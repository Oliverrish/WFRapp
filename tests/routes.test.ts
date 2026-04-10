import test from "node:test";
import assert from "node:assert/strict";
import { getHomeRouteForRole, normalizeAuthRedirect } from "@/lib/routes";

test("getHomeRouteForRole sends advisors to the advisor workspace", () => {
  assert.equal(getHomeRouteForRole("advisor"), "/events");
});

test("getHomeRouteForRole sends elevated roles to the admin console", () => {
  assert.equal(getHomeRouteForRole("admin"), "/admin/dashboard");
  assert.equal(getHomeRouteForRole("super_admin"), "/admin/dashboard");
});

test("normalizeAuthRedirect accepts safe in-app routes", () => {
  assert.equal(
    normalizeAuthRedirect("/events/new?source=login"),
    "/events/new?source=login"
  );
});

test("normalizeAuthRedirect rejects external redirects", () => {
  assert.equal(normalizeAuthRedirect("https://evil.example"), null);
  assert.equal(normalizeAuthRedirect("//evil.example"), null);
});

test("normalizeAuthRedirect rejects api routes", () => {
  assert.equal(normalizeAuthRedirect("/api/auth/me"), null);
});

