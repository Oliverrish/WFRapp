import { NextRequest, NextResponse } from "next/server";
import {
  verifyOTP,
  incrementOTPAttempts,
  findOrCreateProfile,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import { z } from "zod/v4";

const schema = z.object({
  email: z.email(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = schema.parse(body);

    // Demo mode: demo@wfr.com with code 111111
    const isDemo =
      email.toLowerCase() === "demo@wfr.com" && code === "111111";

    if (!isDemo) {
      const valid = await verifyOTP(email, code);
      if (!valid) {
        await incrementOTPAttempts(email, code);
        return NextResponse.json(
          { error: "Invalid or expired code" },
          { status: 401 }
        );
      }
    }

    const profile = await findOrCreateProfile(email);
    const token = await createSession(
      profile.id,
      req.headers.get("user-agent") ?? undefined,
      req.headers.get("x-forwarded-for") ?? undefined
    );

    await setSessionCookie(token);

    return NextResponse.json({ success: true, user: profile });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
