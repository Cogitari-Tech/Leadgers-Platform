import { describe, expect, it, vi, beforeEach } from "vitest";
import { Hono } from "hono";

// Mock PrismaClient as a class (must come before importing the router)
vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    investor_updates = {
      findMany: vi.fn().mockResolvedValue([]),
    };
    data_room_documents = {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: "doc-1" }),
      delete: vi.fn().mockResolvedValue({}),
    };
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

vi.mock("../../jobs/queue", () => ({
  inngest: {
    send: vi.fn(),
  },
}));

const { authState } = vi.hoisted(() => ({
  authState: { role: "owner" },
}));

// Mock auth middleware so tenantId / user / role are set in context
vi.mock("../../middleware/auth", () => ({
  authMiddleware: async (c: any, next: any) => {
    c.set("tenantId", "test-tenant");
    c.set("user", { id: "test-user" });
    await next();
  },
}));
vi.mock("../../middleware/tenancy", () => ({
  tenancyMiddleware: async (c: any, next: any) => {
    c.set("userRole", authState.role);
    await next();
  },
}));

import investorRouter from "./index";

describe("Investor Routes", () => {
  let app: Hono<{ Variables: { tenantId: string; user: { id: string } } }>;

  beforeEach(() => {
    app = new Hono<{ Variables: { tenantId: string; user: { id: string } } }>();
    // Simulate auth context for all requests
    app.use("*", async (c, next) => {
      c.set("tenantId", "test-tenant");
      c.set("user", { id: "test-user" });
      await next();
    });
    app.route("/investor", investorRouter);
    authState.role = "owner";
  });

  it("GET /investor/updates should return investor updates", async () => {
    const res = await app.request("/investor/updates");
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json).toHaveProperty("data");
  });

  it("POST /investor/reports/generate should queue generation", async () => {
    const res = await app.request("/investor/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "test-tenant", type: "monthly" }),
    });
    expect(res.status).toBe(202);
    const json = (await res.json()) as any;
    expect(json.status).toBe("queued");
    expect(json).toHaveProperty("reportId");
  });

  it("POST /investor/reports/generate should reject non-admin roles", async () => {
    authState.role = "viewer";

    const res = await app.request("/investor/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "monthly" }),
    });
    expect(res.status).toBe(403);
  });

  it("POST /investor/reports/generate should reject unknown byokProvider", async () => {
    const res = await app.request("/investor/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "monthly",
        byokKey: "a".repeat(40),
        byokProvider: "evil-provider",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /investor/reports/generate should reject byokKey without provider", async () => {
    const res = await app.request("/investor/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "monthly", byokKey: "a".repeat(40) }),
    });
    expect(res.status).toBe(400);
  });

  it("GET /investor/documents should return documents list", async () => {
    const res = await app.request("/investor/documents");
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json).toHaveProperty("documents");
  });

  it("DELETE /investor/documents/:id should reject non-admin roles", async () => {
    authState.role = "viewer";

    const res = await app.request("/investor/documents/doc-1", {
      method: "DELETE",
    });
    expect(res.status).toBe(403);
  });

  it("POST /investor/documents should reject non-admin roles", async () => {
    authState.role = "member";

    const res = await app.request("/investor/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "doc.pdf",
        file_path: "uploads/test-tenant/doc.pdf",
        file_size: 1000,
        mime_type: "application/pdf",
      }),
    });
    expect(res.status).toBe(403);
  });
});
