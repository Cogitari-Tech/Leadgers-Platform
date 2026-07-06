import type { Context } from "hono";

export function errorHandler(err: Error, c: Context) {
  const requestId = c.get("requestId") || "unknown";
  const isProduction = process.env.NODE_ENV === "production";

  console.error(`[${requestId}] Unhandled error:`, {
    message: err.message,
    stack: isProduction ? undefined : err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  // Never leak internal details in production
  return c.json(
    {
      error: isProduction ? "Internal server error" : err.message,
      requestId,
    },
    500,
  );
}
