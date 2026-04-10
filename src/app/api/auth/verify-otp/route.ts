import { NextRequest, NextResponse } from "next/server";
import {
  verifyOTP,
  incrementOTPAttempts,
  findProfileByEmail,
  createSession,
  setSessionCookie,
  normalizeEmail,
} from "@/lib/auth";
import { getHomeRouteForRole } from "@/lib/routes";
import { isDemoAuthEnabled } from "@/lib/env";
import { ZodError, z } from "zod/v4";

const schema = z.object({
  email: z.email(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = schema.parse(body);
    const normalizedEmail = normalizeEmail(email);

    // Demo mode is only available in development unless explicitly re-enabled.
    const isDemo =
      isDemoAuthEnabled() &&
      normalizedEmail.endsWith("@wfr.com") &&
      code === "111111";

    if (!isDemo) {
      const valid = await verifyOTP(normalizedEmail, code);
      if (!valid) {
        await incrementOTPAttempts(normalizedEmail);
        return NextResponse.json(
          { error: "Invalid or expired code" },
          { status: 401 }
        );
      }
    }

    const profile = await findProfileByEmail(normalizedEmail);
    if (!profile) {
      return NextResponse.json(
        { error: "This account is not provisioned for access." },
        { status: 403 }
      );
    }

    const token = await createSession(
      profile.id,
      req.headers.get("user-agent") ?? undefined,
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined
    );

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: profile,
      redirectTo: getHomeRouteForRole(profile.role),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    console.error("Failed to verify OTP.", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
