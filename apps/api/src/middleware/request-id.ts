import type { Context, Next } from "hono";
import { randomUUID } from "node:crypto";

export async function requestId(c: Context, next: Next) {
  const id = c.req.header("x-request-id") || randomUUID();

  c.set("requestId", id);
  c.header("X-Request-ID", id);

  await next();
}
