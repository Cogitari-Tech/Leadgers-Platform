import { describe, it, expect } from "vitest";
import app from "../../app";

describe("Error Leakage Tests (OWASP A10)", () => {
  it("should not expose stack traces on 404", async () => {
    const res = await app.request("/api/nonexistent/route");
    const body = await res.text();
    expect(body).not.toContain("node_modules");
    expect(body).not.toContain("at Object");
    expect(body).not.toContain("Error:");
  });

  it("should not expose internal paths in error responses", async () => {
    const res = await app.request("/api/finance/burn-rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json{{{",
    });
    const body = await res.text();
    expect(body).not.toContain("C:\\");
    expect(body).not.toContain("/home/");
    expect(body).not.toContain("\\src\\");
  });

  it("should not expose database connection strings", async () => {
    const res = await app.request("/api/sales/deals", {
      headers: { Authorization: "Bearer bad" },
    });
    const body = await res.text();
    expect(body).not.toContain("postgres://");
    expect(body).not.toContain("DATABASE_URL");
    expect(body).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("should include requestId in error responses", async () => {
    const res = await app.request("/health");
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("should not expose technology stack details", async () => {
    const res = await app.request("/api/sales/deals", {
      headers: { Authorization: "Bearer bad" },
    });
    const body = await res.text();
    expect(body).not.toContain("Hono");
    expect(body).not.toContain("Prisma");
    expect(body).not.toContain("vitest");
  });
});
