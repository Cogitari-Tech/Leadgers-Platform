import { describe, it, expect, vi } from "vitest";
import app from "../../app";

// Mock supabase to prevent startup errors
vi.mock("../../config/supabase", () => ({
  createScopedClient: (token: string) => ({
    auth: {
      getUser: async () => {
        if (token === "valid-token") {
          return {
            data: {
              user: { id: "user-123", email: "test@leadgers.com" },
            },
            error: null,
          };
        }
        return { data: { user: null }, error: new Error("Invalid token") };
      },
    },
  }),
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              data: [
                {
                  tenant_id: "tenant-aaa",
                  roles: { name: "admin" },
                  status: "active",
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    }),
  },
}));

describe("Auth Bypass Tests (OWASP A07)", () => {
  it("should reject requests without Authorization header", async () => {
    const res = await app.request("/api/finance/burn-rate");
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("Authorization");
  });

  it("should reject requests with malformed Bearer token", async () => {
    const res = await app.request("/api/finance/burn-rate", {
      headers: { Authorization: "Bearer " },
    });
    expect(res.status).toBe(401);
  });

  it("should reject requests with invalid token format", async () => {
    const res = await app.request("/api/finance/burn-rate", {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });
    expect(res.status).toBe(401);
  });

  it("should reject requests with expired/forged token", async () => {
    const res = await app.request("/api/finance/burn-rate", {
      headers: { Authorization: "Bearer forged-jwt-token-12345" },
    });
    expect(res.status).toBe(401);
  });

  it("should not expose user details in auth error responses", async () => {
    const res = await app.request("/api/finance/burn-rate", {
      headers: { Authorization: "Bearer invalid" },
    });
    const body = await res.json();
    expect(body).not.toHaveProperty("stack");
    expect(body).not.toHaveProperty("user");
    expect(body).not.toHaveProperty("token");
  });
});

// Route-enumeration guard: every tenant-scoped /api/* endpoint MUST reject an
// unauthenticated request. This is the regression test that would have caught
// SEC-09 (investor routes shipped without authMiddleware). When a new protected
// router is mounted in app.ts, add a representative endpoint here.
describe("Protected route enumeration — no anonymous access", () => {
  const protectedRoutes: Array<{ method: "GET" | "POST"; path: string }> = [
    { method: "GET", path: "/api/finance/unit-economics" },
    { method: "GET", path: "/api/finance/burn-rate" },
    { method: "GET", path: "/api/finance/cap-table/summary" },
    { method: "POST", path: "/api/finance/runway" },
    { method: "GET", path: "/api/strategic/health-score" },
    { method: "GET", path: "/api/strategic/north-star" },
    { method: "GET", path: "/api/strategic/okrs" },
    { method: "GET", path: "/api/strategic/milestones" },
    { method: "GET", path: "/api/strategic/bmc" },
    { method: "GET", path: "/api/product/tech-debt" },
    { method: "GET", path: "/api/product/roadmap" },
    { method: "GET", path: "/api/people/headcount" },
    { method: "GET", path: "/api/ai/config" },
    { method: "GET", path: "/api/sales/deals" },
    { method: "GET", path: "/api/sales/mrr" },
    // SEC-09 / SEC-10 regression guards
    { method: "GET", path: "/api/investor/updates" },
    { method: "GET", path: "/api/investor/documents" },
    { method: "POST", path: "/api/investor/reports/generate" },
  ];

  for (const { method, path } of protectedRoutes) {
    it(`should reject unauthenticated ${method} ${path}`, async () => {
      const res = await app.request(path, {
        method,
        ...(method === "POST"
          ? {
              headers: { "Content-Type": "application/json" },
              body: "{}",
            }
          : {}),
      });
      expect(res.status).toBe(401);
    });
  }
});
