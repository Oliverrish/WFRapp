import test from "node:test";
import assert from "node:assert/strict";
import { getOtpSecret } from "@/lib/env";

test("getOtpSecret prefers OTP_SECRET over the shared secret", () => {
  const previousOtpSecret = process.env.OTP_SECRET;
  const previousSharedSecret = process.env.OVERPORTEN_SHARED_SECRET;

  process.env.OTP_SECRET = "otp-secret";
  process.env.OVERPORTEN_SHARED_SECRET = "shared-secret";

  assert.equal(getOtpSecret(), "otp-secret");

  process.env.OTP_SECRET = previousOtpSecret;
  process.env.OVERPORTEN_SHARED_SECRET = previousSharedSecret;
});

test("getOtpSecret falls back to OVERPORTEN_SHARED_SECRET", () => {
  const previousOtpSecret = process.env.OTP_SECRET;
  const previousSharedSecret = process.env.OVERPORTEN_SHARED_SECRET;

  delete process.env.OTP_SECRET;
  process.env.OVERPORTEN_SHARED_SECRET = "shared-secret";

  assert.equal(getOtpSecret(), "shared-secret");

  process.env.OTP_SECRET = previousOtpSecret;
  process.env.OVERPORTEN_SHARED_SECRET = previousSharedSecret;
});
