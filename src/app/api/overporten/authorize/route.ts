import { NextRequest } from "next/server";
import {
  appendProjectCookies,
  buildOverportenEntryUrl,
  clearProjectCookies,
  getProjectSlug,
  sanitizeNextPath,
  validateProjectBridgeExchange,
} from "@/lib/overporten";

const PROJECT_SLUG = getProjectSlug();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const nextPath = sanitizeNextPath(searchParams.get("next"));

  try {
    const exchange = await validateProjectBridgeExchange({
      appToken: searchParams.get("token"),
      widgetToken: searchParams.get("widgetToken"),
      expectedSlug: PROJECT_SLUG,
    });

    if (!exchange) {
      const redirectUrl = buildOverportenEntryUrl(nextPath, PROJECT_SLUG);
      const headers = new Headers({
        "cache-control": "no-store",
        location: redirectUrl.toString(),
      });
      clearProjectCookies(headers, request.url);
      return new Response(null, { status: 307, headers });
    }

    const destinationUrl = new URL(nextPath, request.url);
    const headers = new Headers({
      "cache-control": "no-store",
      location: destinationUrl.toString(),
    });
    appendProjectCookies(headers, request.url, exchange);

    return new Response(null, { status: 307, headers });
  } catch {
    return new Response("Overporten integration is not configured.", {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }
}
