import type { Context, Next } from "hono";

const DEFAULT_MAX_BODY_SIZE = 1_048_576; // 1MB
const UPLOAD_MAX_BODY_SIZE = 10_485_760; // 10MB

interface BodyLimitConfig {
  maxSize?: number;
}

export function bodyLimit(config: BodyLimitConfig = {}) {
  const maxSize = config.maxSize ?? DEFAULT_MAX_BODY_SIZE;

  return async (c: Context, next: Next) => {
    const contentLength = c.req.header("content-length");

    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (isNaN(size) || size > maxSize) {
        return c.json(
          {
            error: "Payload too large",
            maxSize,
            received: size || "unknown",
          },
          413,
        );
      }
    }

    // For chunked/streaming requests (no or spoofable Content-Length) read the
    // cloned body as a stream and abort the moment the running total exceeds the
    // cap — never buffer the whole payload, which would defeat the DoS control.
    if (
      c.req.method === "POST" ||
      c.req.method === "PUT" ||
      c.req.method === "PATCH"
    ) {
      const stream = c.req.raw.clone().body;
      if (stream) {
        const reader = stream.getReader();
        let received = 0;
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            received += value.byteLength;
            if (received > maxSize) {
              await reader.cancel();
              return c.json(
                {
                  error: "Payload too large",
                  maxSize,
                  received,
                },
                413,
              );
            }
          }
        } catch {
          // If we can't read the body (e.g. no body), that's fine
        }
      }
    }

    await next();
  };
}

export function uploadBodyLimit() {
  return bodyLimit({ maxSize: UPLOAD_MAX_BODY_SIZE });
}
