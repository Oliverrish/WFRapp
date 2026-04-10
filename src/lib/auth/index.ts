import { db } from "@/lib/db";
import { otpCodes, sessions, profiles } from "@/lib/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { randomBytes, randomInt } from "crypto";
import { cookies } from "next/headers";

const SESSION_EXPIRY_DAYS = 7;

// ── OTP ────────────────────────────────────────────────

export function generateOTP(): string {
  return String(randomInt(100000, 999999));
}

export async function createOTP(email: string): Promise<string> {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(otpCodes).values({
    email: email.toLowerCase().trim(),
    code,
    expiresAt,
  });

  return code;
}

export async function verifyOTP(
  email: string,
  code: string
): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();

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
  if (otp.attempts >= 5) return false;

  // Mark as used
  await db
    .update(otpCodes)
    .set({ usedAt: new Date() })
    .where(eq(otpCodes.id, otp.id));

  return true;
}

export async function incrementOTPAttempts(
  email: string,
  code: string
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();

  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, normalizedEmail),
        eq(otpCodes.code, code),
        isNull(otpCodes.usedAt)
      )
    )
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
  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );

  await db.insert(sessions).values({
    profileId,
    token,
    userAgent,
    ipAddress,
    expiresAt,
  });

  return token;
}

export async function validateSession(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
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
  await db.delete(sessions).where(eq(sessions.token, token));
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
  const normalizedEmail = email.toLowerCase().trim();

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
      fullName: normalizedEmail.split("@")[0],
    })
    .returning();

  return created;
}
