import { NextRequest, NextResponse } from "next/server";

/**
 * The Frog Racing sites that call PassTech's photo readers from the browser -- the Scrutineering
 * site's tech sheets read gear tags with /api/analyze-tag and /api/analyze-helmet -- plus local
 * development. Everyone else gets no CORS headers (same-origin PassTech doesn't need them).
 */
function allowedOrigin(req: NextRequest): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  return /^https:\/\/([a-z0-9-]+\.)*frogracing\.us$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ? origin : null;
}

export function withCors(req: NextRequest, res: NextResponse): NextResponse {
  const origin = allowedOrigin(req);
  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
  }
  return res;
}

export function corsPreflight(req: NextRequest): NextResponse {
  const res = new NextResponse(null, { status: 204 });
  const origin = allowedOrigin(req);
  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    res.headers.set("Access-Control-Max-Age", "86400");
    res.headers.set("Vary", "Origin");
  }
  return res;
}
