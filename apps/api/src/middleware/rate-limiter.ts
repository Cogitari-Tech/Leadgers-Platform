import type { Context, Next } from "hono";

/**
 * Sliding-window rate limiter (in-memory).
 * Suitable for single-instance APIs. For horizontal scaling,
 * replace the Map with Redis (e.g. @hono/rate-limiter + ioredis).
 */

interface RateLimitConfig {
  /** Max requests allowed within the window */
  max: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Header prefix for rate limit headers */
  headerPrefix?: string;
  /** Custom key generator (default: IP-based) */
  keyGenerator?: (c: Context) => string;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

/**
 * Derives a client key that is hard to forge from the browser.
 *
 * `x-forwarded-for` is fully client-controllable, so rotating it lets an
 * attacker mint a fresh bucket per request and bypass the limit. On Vercel /
 * most reverse proxies `x-real-ip` is set by the platform (overwriting any
 * client-supplied value), so it is preferred. When falling back to XFF we take
 * only the left-most hop (the original client) instead of the raw header, so a
 * padded chain still collapses to one key.
 *
 * Note: the backing store is an in-memory Map, so the effective limit is
 * `max × number of serverless instances`. For strict limits back this with a
 * shared store (Redis) via a custom `keyGenerator`.
 */
function defaultClientKey(c: Context): string {
  const realIp = c.req.header("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    const firstHop = forwarded.split(",")[0]?.trim();
    if (firstHop) return firstHop;
  }

  return "unknown";
}

const stores = new Map<string, Map<string, WindowEntry>>();

function getStore(name: string): Map<string, WindowEntry> {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name)!;
}

/**
 * Creates a rate limiting middleware for Hono.
 *
 * @example
 * ```ts
 * // 10 requests per minute
 * app.use("/api/ai/*", rateLimiter({ max: 10, windowMs: 60_000 }));
 *
 * // 5 requests per minute for auth
 * app.use("/api/auth/*", rateLimiter({ max: 5, windowMs: 60_000 }));
 * ```
 */
export function rateLimiter(config: RateLimitConfig) {
  const { max, windowMs, headerPrefix = "X-RateLimit", keyGenerator } = config;

  const storeName = `rl_${max}_${windowMs}`;
  const store = getStore(storeName);

  // Periodic cleanup of expired entries (every 60s)
  const cleanupInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (entry.resetAt <= now) {
          store.delete(key);
        }
      }
    },
    Math.max(windowMs, 60_000),
  );

  // Prevent the interval from keeping the process alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return async function rateLimit(c: Context, next: Next) {
    const key = keyGenerator ? keyGenerator(c) : defaultClientKey(c);

    const now = Date.now();
    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers
    const remaining = Math.max(0, max - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    c.header(`${headerPrefix}-Limit`, String(max));
    c.header(`${headerPrefix}-Remaining`, String(remaining));
    c.header(`${headerPrefix}-Reset`, String(resetSeconds));

    if (entry.count > max) {
      c.header("Retry-After", String(resetSeconds));
      return c.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: resetSeconds,
        },
        429,
      );
    }

    await next();
  };
}
