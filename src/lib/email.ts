import nodemailer from "nodemailer";
import { getEmailDeliveryConfig, isProductionEnv } from "@/lib/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  const config = getEmailDeliveryConfig();
  if (!config) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  return {
    config,
    transporter,
  };
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const mailer = getTransporter();

  if (!mailer) {
    if (!isProductionEnv()) {
      console.info(`[DEV] OTP for ${email}: ${code}`);
      return;
    }

    throw new Error("SMTP is not configured for OTP delivery.");
  }

  const { config, transporter: activeTransporter } = mailer;

  await activeTransporter.sendMail({
    from: config.from,
    to: email,
    subject: "Your WFR sign-in code",
    text: `Your WFR sign-in code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; background: #f8fafc; padding: 32px;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase; color: #1e3a5f; font-weight: 700;">Workshops For Retirement</p>
          <h1 style="margin: 16px 0 12px; font-size: 28px; line-height: 1.2; color: #0f172a;">Your sign-in code</h1>
          <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
            Use the code below to finish signing in. It expires in 10 minutes.
          </p>
          <div style="margin: 0 0 24px; padding: 18px 20px; border-radius: 16px; background: #eff6ff; border: 1px solid #bfdbfe; text-align: center;">
            <span style="font-size: 32px; letter-spacing: 0.4em; font-weight: 700; color: #1e3a5f;">${code}</span>
          </div>
          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
            If you did not request this code, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}

