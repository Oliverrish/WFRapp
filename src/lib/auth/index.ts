import { db } from "@/lib/db";
import { otpCodes, sessions, profiles } from "@/lib/db/schema";
import { eq, and, gt, isNull, desc } from "drizzle-orm";
import { createHash, randomBytes, randomInt } from "crypto";
import { cookies } from "next/headers";
import { getSessionExpiryDays } from "@/lib/env";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_REQUEST_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const SESSION_EXPIRY_DAYS = getSessionExpiryDays();

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function buildDisplayNameFromEmail(email: string): string {
  const localPart = normalizeEmail(email).split("@")[0] ?? "";
  const readableName = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!readableName) {
    return email;
  }

  return readableName.replace(/\b\w/g, (character) => character.toUpperCase());
}

// ── OTP ────────────────────────────────────────────────

export function generateOTP(): string {
  return String(randomInt(100000, 999999));
}

export async function createOTP(email: string): Promise<string> {
  const normalizedEmail = normalizeEmail(email);
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await db
    .update(otpCodes)
    .set({ usedAt: new Date() })
    .where(and(eq(otpCodes.email, normalizedEmail), isNull(otpCodes.usedAt)));

  await db.insert(otpCodes).values({
    email: normalizedEmail,
    code,
    expiresAt,
  });

  return code;
}

export async function getOtpRequestRetryAfter(email: string): Promise<number> {
  const normalizedEmail = normalizeEmail(email);

  const [latestOtp] = await db
    .select({ createdAt: otpCodes.createdAt })
    .from(otpCodes)
    .where(eq(otpCodes.email, normalizedEmail))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!latestOtp?.createdAt) {
    return 0;
  }

  const elapsedMs =
    Date.now() - new Date(latestOtp.createdAt).getTime();
  const remainingMs = OTP_REQUEST_COOLDOWN_MS - elapsedMs;

  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}

export async function verifyOTP(
  email: string,
  code: string
): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);

  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, normalizedEmail),
        eq(otpCodes.code, code),
        gt(otpCodes.expiresAt, new Date()),
        isNull(otpCodes.usedAt)
      )
    )
    .limit(1);

  if (!otp) return false;
  if (otp.attempts >= MAX_OTP_ATTEMPTS) return false;

  // Mark as used
  await db
    .update(otpCodes)
    .set({ usedAt: new Date() })
    .where(eq(otpCodes.id, otp.id));

  return true;
}

export async function incrementOTPAttempts(
  email: string,
  _code: string
): Promise<void> {
  const normalizedEmail = normalizeEmail(email);

  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, normalizedEmail),
        gt(otpCodes.expiresAt, new Date()),
        isNull(otpCodes.usedAt)
      )
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (otp) {
    await db
      .update(otpCodes)
      .set({ attempts: otp.attempts + 1 })
      .where(eq(otpCodes.id, otp.id));
  }
}

// ── Sessions ───────────────────────────────────────────

export async function createSession(
  profileId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );

  await db.insert(sessions).values({
    profileId,
    token: tokenHash,
    userAgent,
    ipAddress,
    expiresAt,
  });

  return token;
}

export async function validateSession(token: string) {
  const hashedToken = hashSessionToken(token);
  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        gt(sessions.expiresAt, new Date()),
        eq(sessions.token, hashedToken)
      )
    )
    .limit(1);

  if (!session) return null;

  // Update last active
  await db
    .update(sessions)
    .set({ lastActiveAt: new Date() })
    .where(eq(sessions.id, session.id));

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, session.profileId))
    .limit(1);

  return profile ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, hashSessionToken(token)));
}

// ── Cookie helpers ─────────────────────────────────────

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value ?? null;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
}

// ── Get current user (for server components/actions) ───

export async function getCurrentUser() {
  const token = await getSessionToken();
  if (!token) return null;
  return validateSession(token);
}

// ── Find or create profile ─────────────────────────────

export async function findOrCreateProfile(email: string) {
  const normalizedEmail = normalizeEmail(email);

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, normalizedEmail))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(profiles)
    .values({
      email: normalizedEmail,
      fullName: buildDisplayNameFromEmail(normalizedEmail),
    })
    .returning();

  return created;
}

export async function findProfileByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, normalizedEmail))
    .limit(1);

  return profile ?? null;
}
