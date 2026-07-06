import { describe, it, expect } from "vitest";
import app from "../../app";

describe("Rate Limiting Tests (DoS Protection)", () => {
  it("should include rate limit headers", async () => {
    const res = await app.request("/api/finance/burn-rate", {
      headers: {
        Authorization: "Bearer test",
        "x-forwarded-for": "unique-ip-headers-1",
      },
    });
    expect(res.headers.get("x-ratelimit-limit")).toBeTruthy();
    expect(res.headers.get("x-ratelimit-remaining")).toBeTruthy();
  });

  it("should enforce limits after burst", async () => {
    const ip = `burst-${Date.now()}`;
    const results: number[] = [];
    for (let i = 0; i < 65; i++) {
      const res = await app.request("/api/finance/burn-rate", {
        headers: { Authorization: "Bearer t", "x-forwarded-for": ip },
      });
      results.push(res.status);
    }
    expect(results.filter((s) => s === 429).length).toBeGreaterThan(0);
  });

  it("should isolate rate limits per IP", async () => {
    const r1 = await app.request("/api/finance/burn-rate", {
      headers: {
        Authorization: "Bearer t",
        "x-forwarded-for": `iso-a-${Date.now()}`,
      },
    });
    const r2 = await app.request("/api/finance/burn-rate", {
      headers: {
        Authorization: "Bearer t",
        "x-forwarded-for": `iso-b-${Date.now()}`,
      },
    });
    expect(r1.status).not.toBe(429);
    expect(r2.status).not.toBe(429);
  });
});
