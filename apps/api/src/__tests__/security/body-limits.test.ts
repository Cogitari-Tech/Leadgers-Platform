import { describe, it, expect } from "vitest";
import app from "../../app";

describe("Body Size Limit Tests (DoS Protection)", () => {
  it("should reject oversized JSON body via Content-Length", async () => {
    const largeBody = "A".repeat(2_000_000); // 2MB
    const res = await app.request("/api/sales/deals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(largeBody.length),
        Authorization: "Bearer test",
      },
      body: largeBody,
    });

    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.error).toContain("Payload too large");
  });

  it("should reject fake Content-Length that exceeds limit", async () => {
    const res = await app.request("/api/sales/deals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": "50000000", // 50MB
        Authorization: "Bearer test",
      },
      body: JSON.stringify({ title: "test" }),
    });

    expect(res.status).toBe(413);
  });

  it("should accept normal-sized requests", async () => {
    const normalBody = JSON.stringify({
      title: "Normal deal",
      value: 100,
    });

    const res = await app.request("/api/sales/deals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test",
      },
      body: normalBody,
    });

    // Should pass body limit (may fail at auth, but not 413)
    expect(res.status).not.toBe(413);
  });

  it("should return maxSize and received in error response", async () => {
    const res = await app.request("/api/sales/deals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": "5000000",
        Authorization: "Bearer test",
      },
      body: "x",
    });

    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body).toHaveProperty("maxSize");
    expect(body).toHaveProperty("received");
  });
});
