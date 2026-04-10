type EmailDeliveryConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getDatabaseUrl(): string {
  const databaseUrl = readOptionalEnv("DATABASE_URL");
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  return databaseUrl;
}

export function getSessionExpiryDays(): number {
  const rawValue = readOptionalEnv("SESSION_EXPIRY_DAYS");
  if (!rawValue) {
    return 7;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error("SESSION_EXPIRY_DAYS must be a positive integer.");
  }

  return parsedValue;
}

export function getOtpSecret(): string {
  const otpSecret = readOptionalEnv("OTP_SECRET");
  if (otpSecret) {
    return otpSecret;
  }

  const sharedSecret = readOptionalEnv("OVERPORTEN_SHARED_SECRET");
  if (sharedSecret) {
    return sharedSecret;
  }

  throw new Error(
    "OTP_SECRET is required. Set OTP_SECRET or OVERPORTEN_SHARED_SECRET."
  );
}

export function isDemoAuthEnabled(): boolean {
  return !isProductionEnv() || readOptionalEnv("ALLOW_DEMO_AUTH") === "true";
}

export function getEmailDeliveryConfig(): EmailDeliveryConfig | null {
  const host = readOptionalEnv("SMTP_HOST");
  const portRaw = readOptionalEnv("SMTP_PORT");
  const user = readOptionalEnv("SMTP_USER");
  const pass = readOptionalEnv("SMTP_PASS");
  const secureRaw = readOptionalEnv("SMTP_SECURE");
  const from = readOptionalEnv("SMTP_FROM");

  const definedValues = [host, portRaw, user, pass].filter(Boolean).length;
  if (definedValues === 0) {
    return null;
  }

  if (definedValues !== 4) {
    throw new Error(
      "SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS must all be configured together."
    );
  }

  const port = Number.parseInt(portRaw!, 10);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("SMTP_PORT must be a positive integer.");
  }

  return {
    host: host!,
    port,
    secure: secureRaw ? secureRaw === "true" : port === 465,
    user: user!,
    pass: pass!,
    from: from ?? user!,
  };
}
