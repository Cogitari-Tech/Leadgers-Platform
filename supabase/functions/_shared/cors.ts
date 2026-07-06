// Shared CORS helper for Edge Functions.
//
// Instead of a wildcard `Access-Control-Allow-Origin: *`, requests are matched
// against an allowlist. Origins are read from the `ALLOWED_ORIGINS` env var
// (comma-separated); when unset we fall back to the known Leadgers origins.
//
// The response echoes the request Origin only when it is on the allowlist,
// otherwise it pins the first allowed origin. `Vary: Origin` keeps caches
// from serving one tenant's CORS decision to another.

const DEFAULT_ORIGINS = [
  "https://leadgers.com",
  "https://www.leadgers.com",
  "https://app.leadgers.com",
  "http://localhost:5173",
];

function allowedOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS");
  if (!raw) return DEFAULT_ORIGINS;
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowList = allowedOrigins();
  const allowOrigin = allowList.includes(origin) ? origin : allowList[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    Vary: "Origin",
  };
}
