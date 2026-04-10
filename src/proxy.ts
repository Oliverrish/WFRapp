import { NextRequest, NextResponse } from "next/server";
import {
  buildOverportenEntryUrl,
  clearProjectCookies,
  getProjectSlug,
  isNavigationRequest,
  readProjectAccessFromRequest,
  shouldBypassProjectGuard,
} from "@/lib/overporten";

const PROJECT_SLUG = getProjectSlug("wfr");

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

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  if (overportenPassThrough.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  if (!shouldBypassProjectGuard(request.url)) {
    try {
      const overportenSession = await readProjectAccessFromRequest(
        request,
        PROJECT_SLUG
      );

      if (!overportenSession) {
        const redirectUrl = buildOverportenEntryUrl(request, PROJECT_SLUG);

        if (pathname.startsWith("/api/") || !isNavigationRequest(request)) {
          return buildUnauthorizedApiResponse(request.url, redirectUrl);
        }

        return buildUnauthorizedRedirect(request.url, redirectUrl);
      }
    } catch {
      return new Response("Overporten integration is not configured.", {
        status: 503,
        headers: { "cache-control": "no-store" },
      });
    }
  }

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.next();
  }

  const token = request.cookies.get("session_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

