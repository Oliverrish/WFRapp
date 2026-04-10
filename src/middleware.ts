import { NextRequest, NextResponse } from "next/server";
import {
  buildOverportenEntryUrl,
  clearProjectCookies,
  isNavigationRequest,
  readProjectAccessFromRequest,
  shouldBypassProjectGuard,
} from "@/lib/overporten";

const PROJECT_SLUG = "wfrapp";

const publicPaths = ["/login", "/verify", "/api/auth"];
const overportenPassThrough = ["/api/overporten/authorize"];

function buildUnauthorizedApiResponse(requestUrl: string, redirectUrl: URL) {
  const headers = new Headers({
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  clearProjectCookies(headers, requestUrl);

  return new Response(
    JSON.stringify({
      error: "unauthorized",
      redirectTo: redirectUrl.toString(),
    }),
    { status: 401, headers }
  );
}

function buildUnauthorizedRedirect(requestUrl: string, redirectUrl: URL) {
  const headers = new Headers({
    "cache-control": "no-store",
    location: redirectUrl.toString(),
  });
  clearProjectCookies(headers, requestUrl);

  return new Response(null, { status: 307, headers });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Allow Overporten authorize endpoint (token exchange callback)
  if (overportenPassThrough.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // OPTIONS requests pass through
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  // --- Overporten guard (outer layer) ---
  // Bypass on localhost in development
  if (!shouldBypassProjectGuard(request.url)) {
    try {
      const overportenSession = readProjectAccessFromRequest(
        request,
        PROJECT_SLUG
      );

      if (!overportenSession) {
        // No valid Overporten session — redirect to Overporten hub
        const redirectUrl = buildOverportenEntryUrl(request, PROJECT_SLUG);

        if (
          pathname.startsWith("/api/") ||
          !isNavigationRequest(request)
        ) {
          return buildUnauthorizedApiResponse(request.url, redirectUrl);
        }

        return buildUnauthorizedRedirect(request.url, redirectUrl);
      }
    } catch {
      // Shared secret not configured
      return new Response("Overporten integration is not configured.", {
        status: 503,
        headers: { "cache-control": "no-store" },
      });
    }
  }

  // --- Internal session guard (inner layer) ---
  // Allow public paths (login, verify, auth API)
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Root redirect is allowed
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Check for internal session cookie
  const token = request.cookies.get("session_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
