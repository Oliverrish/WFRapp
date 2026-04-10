import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod/v4";
import {
  createOTP,
  findProfileByEmail,
  getOtpRequestRetryAfter,
  normalizeEmail,
} from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  email: z.email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);
    const normalizedEmail = normalizeEmail(email);
    const existingProfile = await findProfileByEmail(normalizedEmail);

    if (!existingProfile) {
      return NextResponse.json({ success: true });
    }

    const retryAfter = await getOtpRequestRetryAfter(normalizedEmail);
    if (retryAfter > 0) {
      return NextResponse.json(
        {
          error: "Please wait before requesting another sign-in code.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    const code = await createOTP(normalizedEmail);
    await sendOtpEmail(normalizedEmail, code);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    console.error("Failed to create or deliver OTP email.", error);
    return NextResponse.json(
      { error: "Unable to send a sign-in code right now." },
      { status: 503 }
    );
  }
}
