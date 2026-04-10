import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOverportenEntryUrl,
  sanitizeNextPath,
} from "@/lib/overporten";

test("sanitizeNextPath keeps safe relative routes", () => {
  assert.equal(
    sanitizeNextPath("/events/new?draft=true"),
    "/events/new?draft=true"
  );
});

test("sanitizeNextPath rejects absolute and callback-loop urls", () => {
  assert.equal(sanitizeNextPath("https://evil.example"), "/");
  assert.equal(sanitizeNextPath("/api/overporten/authorize"), "/");
});

test("buildOverportenEntryUrl adds launch path for deep links", () => {
  process.env.OVERPORTEN_PROJECT_SLUG = "wfr";
  process.env.OVERPORTEN_PUBLIC_HUB_URL = "https://hub.example";

  const url = buildOverportenEntryUrl("/events/abc", "fallback");

  assert.equal(url.origin, "https://hub.example");
  assert.equal(url.pathname, "/projects/wfr");
  assert.equal(url.searchParams.get("launch"), "/events/abc");
});
