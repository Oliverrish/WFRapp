import crypto from "node:crypto";

export const PROJECT_APP_ACCESS_COOKIE = "overporten_app_access";
export const PROJECT_WIDGET_TOKEN_COOKIE = "overporten_widget_token";

const DEFAULT_HUB_URL = "https://www.overporten.com";
const DEFAULT_NEXT_PATH = "/";

interface SignedPayload {
  value: Record<string, unknown>;
  issuedAt: number;
  expiresAt: number;
}

interface BridgeExchange {
  appToken: string;
  widgetToken: string;
  appSession: SignedPayload;
  widgetSession: SignedPayload;
}

function getSharedSecret(): string {
  const secret = String(
    process.env.OVERPORTEN_SHARED_SECRET ||
      process.env.PROJECT_APP_BRIDGE_SECRET ||
      ""
  ).trim();

  if (!secret) {
    throw new Error("OVERPORTEN_SHARED_SECRET is required.");
  }

  return secret;
}

export function getProjectSlug(fallback: string): string {
  const configured = String(
    process.env.OVERPORTEN_PROJECT_SLUG || ""
  ).trim();
  return configured || fallback;
}

function getHubUrl(): string {
  const configured = String(
    process.env.OVERPORTEN_PUBLIC_HUB_URL || DEFAULT_HUB_URL
  ).trim();
  return configured || DEFAULT_HUB_URL;
}

function normalizeHostname(value: string): string {
  return String(value || "")
    .split(":")[0]
    .toLowerCase();
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  );
}

export function shouldBypassProjectGuard(url: string): boolean {
  const requestUrl = new URL(url);
  return (
    process.env.NODE_ENV !== "production" &&
    isLocalHostname(normalizeHostname(requestUrl.hostname))
  );
}

function timingSafeEqualString(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifySignedValue(token: string): SignedPayload | null {
  const rawToken = String(token || "").trim();
  if (!rawToken) {
    return null;
  }

  const separator = rawToken.lastIndexOf(".");
  if (separator <= 0) {
    return null;
  }

  const body = rawToken.slice(0, separator);
  const signature = rawToken.slice(separator + 1);
  const expectedSignature = crypto
    .createHmac("sha256", getSharedSecret())
    .update(body)
    .digest("base64url");

  if (!timingSafeEqualString(signature, expectedSignature)) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    );
    if (
      !decoded ||
      decoded.v !== 1 ||
      typeof decoded.iat !== "number" ||
      typeof decoded.exp !== "number"
    ) {
      return null;
    }

    if (decoded.exp <= Date.now()) {
      return null;
    }

    return {
      value: decoded.data,
      issuedAt: decoded.iat,
      expiresAt: decoded.exp,
    };
  } catch {
    return null;
  }
}

export function verifyProjectBridgeToken(
  token: string,
  expectedSlug?: string
): SignedPayload | null {
  const signed = verifySignedValue(token);
  if (!signed) {
    return null;
  }

  const claims = signed.value as Record<string, string>;
  if (claims.kind !== "app_session" && claims.kind !== "widget") {
    return null;
  }

  if (expectedSlug && claims.projectSlug !== expectedSlug) {
    return null;
  }

  if (
    !claims.projectId ||
    !claims.projectSlug ||
    !claims.viewerGrantId ||
    !claims.email
  ) {
    return null;
  }

  return signed;
}

export function verifyProjectAppAccessToken(
  token: string,
  expectedSlug?: string
): SignedPayload | null {
  const signed = verifyProjectBridgeToken(token, expectedSlug);
  if (!signed || (signed.value as Record<string, string>).kind !== "app_session") {
    return null;
  }
  return signed;
}

export function verifyProjectWidgetToken(
  token: string,
  expectedSlug?: string
): SignedPayload | null {
  const signed = verifyProjectBridgeToken(token, expectedSlug);
  if (!signed || (signed.value as Record<string, string>).kind !== "widget") {
    return null;
  }
  return signed;
}

export function validateProjectBridgeExchange(input: {
  appToken: string | null;
  widgetToken: string | null;
  expectedSlug: string;
}): BridgeExchange | null {
  const appSession = verifyProjectAppAccessToken(
    input.appToken || "",
    input.expectedSlug
  );
  const widgetSession = verifyProjectWidgetToken(
    input.widgetToken || "",
    input.expectedSlug
  );

  if (!appSession || !widgetSession) {
    return null;
  }

  const appClaims = appSession.value as Record<string, string>;
  const widgetClaims = widgetSession.value as Record<string, string>;

  if (
    appClaims.projectId !== widgetClaims.projectId ||
    appClaims.projectSlug !== widgetClaims.projectSlug ||
    appClaims.viewerGrantId !== widgetClaims.viewerGrantId ||
    appClaims.email !== widgetClaims.email
  ) {
    return null;
  }

  return {
    appToken: String(input.appToken || ""),
    widgetToken: String(input.widgetToken || ""),
    appSession,
    widgetSession,
  };
}

function parseCookieHeader(cookieHeader: string): Record<string, string> {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce(
      (cookies, pair) => {
        const separator = pair.indexOf("=");
        if (separator <= 0) {
          return cookies;
        }
        const key = decodeURIComponent(pair.slice(0, separator).trim());
        const value = decodeURIComponent(pair.slice(separator + 1).trim());
        cookies[key] = value;
        return cookies;
      },
      {} as Record<string, string>
    );
}

export function readProjectAccessFromRequest(
  request: Request,
  fallbackSlug: string
): SignedPayload | null {
  const cookies = parseCookieHeader(request.headers.get("cookie") || "");
  return verifyProjectAppAccessToken(
    cookies[PROJECT_APP_ACCESS_COOKIE],
    getProjectSlug(fallbackSlug)
  );
}

function serializeCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    expires?: Date;
    httpOnly?: boolean;
    sameSite?: "lax" | "strict" | "none";
    secure?: boolean;
  } = {}
): string {
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
  ];

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.trunc(options.maxAge))}`);
  }

  parts.push(`Path=${options.path || "/"}`);

  if (options.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  const sameSite =
    options.sameSite === "none"
      ? "None"
      : options.sameSite === "strict"
        ? "Strict"
        : "Lax";
  parts.push(`SameSite=${sameSite}`);

  if (options.secure !== false) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function serializeExpiredCookie(
  name: string,
  options: Record<string, unknown> = {}
): string {
  return serializeCookie(name, "", {
    ...options,
    expires: new Date(0),
    maxAge: 0,
    httpOnly: options.httpOnly as boolean | undefined,
    sameSite: options.sameSite as "lax" | "strict" | "none" | undefined,
    secure: options.secure as boolean | undefined,
    path: options.path as string | undefined,
  });
}

function secondsUntil(expiresAt: number): number {
  return Math.max(0, Math.ceil((Number(expiresAt) - Date.now()) / 1000));
}

function buildCookieSettings(
  url: string,
  maxAge: number,
  httpOnly: boolean
) {
  const requestUrl = new URL(url);
  return {
    httpOnly,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: !isLocalHostname(normalizeHostname(requestUrl.hostname)),
  };
}

export function appendProjectCookies(
  headers: Headers,
  requestUrl: string,
  exchange: BridgeExchange
): void {
  headers.append(
    "Set-Cookie",
    serializeCookie(
      PROJECT_APP_ACCESS_COOKIE,
      exchange.appToken,
      buildCookieSettings(
        requestUrl,
        secondsUntil(exchange.appSession.expiresAt),
        true
      )
    )
  );
  headers.append(
    "Set-Cookie",
    serializeCookie(
      PROJECT_WIDGET_TOKEN_COOKIE,
      exchange.widgetToken,
      buildCookieSettings(
        requestUrl,
        secondsUntil(exchange.widgetSession.expiresAt),
        false
      )
    )
  );
}

export function clearProjectCookies(
  headers: Headers,
  requestUrl: string
): void {
  const appSettings = buildCookieSettings(requestUrl, 0, true);
  const widgetSettings = buildCookieSettings(requestUrl, 0, false);
  headers.append(
    "Set-Cookie",
    serializeExpiredCookie(PROJECT_APP_ACCESS_COOKIE, appSettings)
  );
  headers.append(
    "Set-Cookie",
    serializeExpiredCookie(PROJECT_WIDGET_TOKEN_COOKIE, widgetSettings)
  );
}

export function sanitizeNextPath(
  value: string | null,
  fallback: string = DEFAULT_NEXT_PATH
): string {
  const raw = String(value || "").trim();
  if (!raw) {
    return fallback;
  }

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("//")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(
      raw.startsWith("/") ? raw : `/${raw}`,
      "https://overporten.local"
    );
    const normalized =
      `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;

    if (normalized.startsWith("/api/overporten/authorize")) {
      return fallback;
    }

    return normalized;
  } catch {
    return fallback;
  }
}

export function buildOverportenEntryUrl(
  input: string | Request,
  fallbackSlug: string
): URL {
  const requestedPath =
    typeof input === "string"
      ? input
      : `${new URL(input.url).pathname}${new URL(input.url).search}`;
  const launchPath = sanitizeNextPath(requestedPath, DEFAULT_NEXT_PATH);
  const url = new URL(
    `/projects/${getProjectSlug(fallbackSlug)}`,
    getHubUrl()
  );

  if (launchPath !== DEFAULT_NEXT_PATH) {
    url.searchParams.set("launch", launchPath);
  }

  return url;
}

export function isNavigationRequest(request: Request): boolean {
  const destination = request.headers.get("sec-fetch-dest") || "";
  if (destination === "document" || destination === "iframe") {
    return true;
  }

  if (destination && destination !== "empty") {
    return false;
  }

  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}
