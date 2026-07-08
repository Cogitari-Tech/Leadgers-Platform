import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { AppEnv } from "../../types/env";

const { mockFindMany, mockUpsert, mockDelete, authState } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockUpsert: vi.fn(),
  mockDelete: vi.fn(),
  authState: { role: "owner" },
}));

vi.mock("../../middleware/auth", () => ({
  authMiddleware: async (c: any, next: any) => {
    c.set("user", { id: "user-123" });
    await next();
  },
}));

vi.mock("../../middleware/tenancy", () => ({
  tenancyMiddleware: async (c: any, next: any) => {
    c.set("tenantId", "tenant-123");
    c.set("userRole", authState.role);
    await next();
  },
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    mrr_snapshots = {
      findMany: mockFindMany,
      upsert: mockUpsert,
      delete: mockDelete,
    };
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

import mrrRoutes from "./mrr";

describe("MRR/ARR API", () => {
  let app: Hono<AppEnv>;

  beforeEach(() => {
    app = new Hono<AppEnv>();
    app.route("/", mrrRoutes);
    vi.clearAllMocks();
    authState.role = "owner";
  });

  it("should list snapshots ordered by month", async () => {
    mockFindMany.mockResolvedValue([
      { id: "s1", month_date: "2026-05-01", total_mrr: "1000" },
      { id: "s2", month_date: "2026-06-01", total_mrr: "1200" },
    ]);

    const res = await app.request("/");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { tenant_id: "tenant-123" },
      orderBy: { month_date: "asc" },
    });
  });

  it("should upsert normalizing month start and deriving ARR", async () => {
    mockUpsert.mockImplementation(({ create }: any) =>
      Promise.resolve({ id: "s1", ...create }),
    );

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month_date: "2026-06-17",
        total_mrr: 5000,
        churn_mrr: 250,
      }),
    });

    expect(res.status).toBe(201);
    const args = mockUpsert.mock.calls[0][0];
    expect(args.where.tenant_id_month_date.month_date.toISOString()).toBe(
      "2026-06-01T00:00:00.000Z",
    );
    expect(args.create.total_arr).toBe(60000);
    expect(args.create.tenant_id).toBe("tenant-123");
  });

  it("should reject writes for non-admin roles", async () => {
    authState.role = "member";

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month_date: "2026-06-01", total_mrr: 5000 }),
    });

    expect(res.status).toBe(403);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("should reject invalid month_date", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month_date: "not-a-date", total_mrr: 5000 }),
    });

    expect(res.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("should delete scoped to the tenant", async () => {
    mockDelete.mockResolvedValue({ id: "s1" });

    const res = await app.request("/s1", { method: "DELETE" });

    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: "s1", tenant_id: "tenant-123" },
    });
  });
});
