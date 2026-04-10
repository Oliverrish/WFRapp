import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_OVERPORTEN_HUB_URL,
  DEFAULT_PROJECT_SLUG,
  getOverportenHubUrl,
  getProjectSlug,
} from "@/lib/project-config";

test("project config falls back to repo defaults", () => {
  const previousSlug = process.env.OVERPORTEN_PROJECT_SLUG;
  const previousHubUrl = process.env.OVERPORTEN_PUBLIC_HUB_URL;

  delete process.env.OVERPORTEN_PROJECT_SLUG;
  delete process.env.OVERPORTEN_PUBLIC_HUB_URL;

  assert.equal(getProjectSlug(), DEFAULT_PROJECT_SLUG);
  assert.equal(getOverportenHubUrl(), DEFAULT_OVERPORTEN_HUB_URL);

  process.env.OVERPORTEN_PROJECT_SLUG = previousSlug;
  process.env.OVERPORTEN_PUBLIC_HUB_URL = previousHubUrl;
});

test("project config honors environment overrides", () => {
  const previousSlug = process.env.OVERPORTEN_PROJECT_SLUG;
  const previousHubUrl = process.env.OVERPORTEN_PUBLIC_HUB_URL;

  process.env.OVERPORTEN_PROJECT_SLUG = "custom-project";
  process.env.OVERPORTEN_PUBLIC_HUB_URL = "https://hub.example/";

  assert.equal(getProjectSlug(), "custom-project");
  assert.equal(getOverportenHubUrl(), "https://hub.example/");

  process.env.OVERPORTEN_PROJECT_SLUG = previousSlug;
  process.env.OVERPORTEN_PUBLIC_HUB_URL = previousHubUrl;
});
