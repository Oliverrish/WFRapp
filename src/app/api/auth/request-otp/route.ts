import { NextRequest, NextResponse } from "next/server";
import { createOTP } from "@/lib/auth";
import { z } from "zod/v4";

const schema = z.object({
  email: z.email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const code = await createOTP(email);

    // TODO: Send OTP via email (SMTP integration)
    // For now, log to console in dev
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${email}: ${code}`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }
}
