import type { UserRole } from "@/types";

export function getHomeRouteForRole(role: UserRole): string {
  if (role === "advisor") {
    return "/events";
  }

  return "/admin/dashboard";
}

export function normalizeAuthRedirect(value: string | null | undefined): string | null {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) {
    return null;
  }

  if (
    rawValue.startsWith("http://") ||
    rawValue.startsWith("https://") ||
    rawValue.startsWith("//")
  ) {
    return null;
  }

  try {
    const parsedValue = new URL(
      rawValue.startsWith("/") ? rawValue : `/${rawValue}`,
      "https://wfr.local"
    );
    const normalizedValue =
      `${parsedValue.pathname}${parsedValue.search}${parsedValue.hash}` || null;

    if (!normalizedValue || normalizedValue.startsWith("/api/")) {
      return null;
    }

    return normalizedValue;
  } catch {
    return null;
  }
}

