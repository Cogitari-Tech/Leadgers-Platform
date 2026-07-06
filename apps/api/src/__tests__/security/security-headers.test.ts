import { describe, it, expect } from "vitest";
import app from "../../app";

describe("Security Headers Tests (OWASP A02)", () => {
  it("should set X-Content-Type-Options: nosniff", async () => {
    const res = await app.request("/health");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("should set X-Frame-Options: DENY", async () => {
    const res = await app.request("/health");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
  });

  it("should set Strict-Transport-Security", async () => {
    const res = await app.request("/health");
    const hsts = res.headers.get("strict-transport-security");
    expect(hsts).toContain("max-age=");
    expect(hsts).toContain("includeSubDomains");
  });

  it("should set Content-Security-Policy", async () => {
    const res = await app.request("/health");
    const csp = res.headers.get("content-security-policy");
    expect(csp).toContain("default-src");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("should set Referrer-Policy", async () => {
    const res = await app.request("/health");
    expect(res.headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("should set X-Request-ID on every response", async () => {
    const res = await app.request("/health");
    const requestId = res.headers.get("x-request-id");
    expect(requestId).toBeTruthy();
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("should propagate client-provided X-Request-ID", async () => {
    const clientId = "client-req-abc-123";
    const res = await app.request("/health", {
      headers: { "x-request-id": clientId },
    });
    expect(res.headers.get("x-request-id")).toBe(clientId);
  });

  it("should set Cross-Origin-Opener-Policy", async () => {
    const res = await app.request("/health");
    expect(res.headers.get("cross-origin-opener-policy")).toBe("same-origin");
  });
});
