export const DEFAULT_PROJECT_SLUG = "wfr";
export const DEFAULT_OVERPORTEN_HUB_URL = "https://www.overporten.com";

function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getProjectSlug(
  fallback: string = DEFAULT_PROJECT_SLUG
): string {
  return readOptionalEnv("OVERPORTEN_PROJECT_SLUG") ?? fallback;
}

export function getOverportenHubUrl(): string {
  return (
    readOptionalEnv("OVERPORTEN_PUBLIC_HUB_URL") ??
    DEFAULT_OVERPORTEN_HUB_URL
  );
}
