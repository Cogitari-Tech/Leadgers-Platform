import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { AppEnv } from "../../types/env";

const {
  mockFindManyGrants,
  mockFindFirstGrant,
  mockCreateGrant,
  mockUpdateGrant,
  mockDeleteGrant,
  mockFindUniquePool,
  mockUpsertPool,
  authState,
} = vi.hoisted(() => ({
  mockFindManyGrants: vi.fn(),
  mockFindFirstGrant: vi.fn(),
  mockCreateGrant: vi.fn(),
  mockUpdateGrant: vi.fn(),
  mockDeleteGrant: vi.fn(),
  mockFindUniquePool: vi.fn(),
  mockUpsertPool: vi.fn(),
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

// Mirrors Prisma's known-request error shape so the route's P2025 guard
// (`error instanceof Prisma.PrismaClientKnownRequestError`) works in tests.
const { MockPrismaKnownError } = vi.hoisted(() => {
  class MockPrismaKnownError extends Error {
    code: string;
    constructor(code: string) {
      super(`Prisma error ${code}`);
      this.code = code;
    }
  }
  return { MockPrismaKnownError };
});

vi.mock("@prisma/client", () => ({
  Prisma: { PrismaClientKnownRequestError: MockPrismaKnownError },
  PrismaClient: class MockPrismaClient {
    equity_grants = {
      findMany: mockFindManyGrants,
      findFirst: mockFindFirstGrant,
      create: mockCreateGrant,
      update: mockUpdateGrant,
      delete: mockDeleteGrant,
    };
    esop_pools = {
      findUnique: mockFindUniquePool,
      upsert: mockUpsertPool,
    };
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

import equityRoutes from "./equity";

// Fully vested grant (granted far in the past).
const grantRow = {
  id: "grant-1",
  tenant_id: "tenant-123",
  beneficiary_name: "João Silva",
  beneficiary_email: null,
  options_total: "10000",
  grant_date: "2020-01-01",
  cliff_months: 12,
  vesting_months: 48,
  grant_price: "0.1",
  acceleration: "none",
  status: "active",
  terminated_at: null,
  exercise_window_days: 90,
  notes: null,
  created_by: "user-123",
  created_at: "2020-01-01T00:00:00Z",
  updated_at: "2020-01-01T00:00:00Z",
};

const validGrantBody = {
  beneficiary_name: "Marina CTO",
  options_total: 5000,
  grant_date: "2026-01-01",
  grant_price: 0.25,
};

describe("Equity & Vesting API", () => {
  let app: Hono<AppEnv>;

  beforeEach(() => {
    app = new Hono<AppEnv>();
    app.route("/", equityRoutes);
    vi.clearAllMocks();
    authState.role = "owner";
  });

  describe("GET /grants", () => {
    it("should return grants enriched with vesting computation", async () => {
      mockFindManyGrants.mockResolvedValue([grantRow]);

      const res = await app.request("/grants");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].vested_options).toBe(10000); // fully vested
      expect(data[0].unvested_options).toBe(0);
      expect(data[0].vested_percentage).toBe(100);
      expect(mockFindManyGrants).toHaveBeenCalledWith({
        where: { tenant_id: "tenant-123" },
        orderBy: { grant_date: "asc" },
      });
    });
  });

  describe("POST /grants", () => {
    it("should create a grant with schema defaults (12/48/90)", async () => {
      mockCreateGrant.mockResolvedValue(grantRow);

      const res = await app.request("/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validGrantBody),
      });

      expect(res.status).toBe(201);
      const createArgs = mockCreateGrant.mock.calls[0][0];
      expect(createArgs.data.cliff_months).toBe(12);
      expect(createArgs.data.vesting_months).toBe(48);
      expect(createArgs.data.exercise_window_days).toBe(90);
      expect(createArgs.data.tenant_id).toBe("tenant-123");
    });

    it("should reject creation for non-admin roles", async () => {
      authState.role = "member";

      const res = await app.request("/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validGrantBody),
      });

      expect(res.status).toBe(403);
      expect(mockCreateGrant).not.toHaveBeenCalled();
    });

    it("should reject fractional options_total", async () => {
      const res = await app.request("/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validGrantBody, options_total: 5000.5 }),
      });

      expect(res.status).toBe(400);
      expect(mockCreateGrant).not.toHaveBeenCalled();
    });

    it("should reject cliff greater than vesting duration", async () => {
      const res = await app.request("/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validGrantBody,
          cliff_months: 60,
          vesting_months: 48,
        }),
      });

      expect(res.status).toBe(400);
      expect(mockCreateGrant).not.toHaveBeenCalled();
    });

    it("should ignore client-supplied tenant_id (mass assignment)", async () => {
      mockCreateGrant.mockResolvedValue(grantRow);

      const res = await app.request("/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validGrantBody,
          tenant_id: "attacker-tenant",
        }),
      });

      expect(res.status).toBe(201);
      expect(mockCreateGrant.mock.calls[0][0].data.tenant_id).toBe(
        "tenant-123",
      );
    });
  });

  describe("POST /grants/:id/terminate", () => {
    it("should terminate an active grant and freeze vesting", async () => {
      mockFindFirstGrant.mockResolvedValue(grantRow);
      mockUpdateGrant.mockImplementation(({ data }: any) =>
        Promise.resolve({ ...grantRow, ...data }),
      );

      const res = await app.request("/grants/grant-1/terminate", {
        method: "POST",
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe("terminated");
      expect(mockUpdateGrant.mock.calls[0][0].data.terminated_at).toBeTruthy();
    });

    it("should return 409 when the grant is already terminated", async () => {
      mockFindFirstGrant.mockResolvedValue({
        ...grantRow,
        status: "terminated",
        terminated_at: "2026-01-01T00:00:00Z",
      });

      const res = await app.request("/grants/grant-1/terminate", {
        method: "POST",
      });

      expect(res.status).toBe(409);
      expect(mockUpdateGrant).not.toHaveBeenCalled();
    });

    it("should reject termination for non-admin roles", async () => {
      authState.role = "viewer";

      const res = await app.request("/grants/grant-1/terminate", {
        method: "POST",
      });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /grants/:id", () => {
    it("should reject deletion for non-admin roles", async () => {
      authState.role = "member";

      const res = await app.request("/grants/grant-1", { method: "DELETE" });

      expect(res.status).toBe(403);
      expect(mockDeleteGrant).not.toHaveBeenCalled();
    });

    it("should delete scoped to the tenant", async () => {
      mockDeleteGrant.mockResolvedValue(grantRow);

      const res = await app.request("/grants/grant-1", { method: "DELETE" });

      expect(res.status).toBe(200);
      expect(mockDeleteGrant).toHaveBeenCalledWith({
        where: { id: "grant-1", tenant_id: "tenant-123" },
      });
    });

    it("should return 404 when the grant does not exist (P2025)", async () => {
      mockDeleteGrant.mockRejectedValue(new MockPrismaKnownError("P2025"));

      const res = await app.request("/grants/missing", { method: "DELETE" });

      expect(res.status).toBe(404);
      const body = (await res.json()) as any;
      expect(body.error).toBe("Grant not found");
    });
  });

  describe("GET /pool (RN-06)", () => {
    it("should compute utilization and flag above 80%", async () => {
      mockFindUniquePool.mockResolvedValue({
        id: "pool-1",
        tenant_id: "tenant-123",
        total_options: "100000",
      });
      mockFindManyGrants.mockResolvedValue([
        { ...grantRow, options_total: "85000" },
      ]);

      const res = await app.request("/pool");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.issued_options).toBe(85000);
      expect(data.available_options).toBe(15000);
      expect(data.utilization_percentage).toBe(85);
      expect(data.over_threshold).toBe(true);
    });

    it("should return nulls when no pool is configured", async () => {
      mockFindUniquePool.mockResolvedValue(null);
      mockFindManyGrants.mockResolvedValue([]);

      const res = await app.request("/pool");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.pool).toBeNull();
      expect(data.available_options).toBeNull();
      expect(data.over_threshold).toBe(false);
    });
  });

  describe("PUT /pool", () => {
    it("should upsert the pool for admins", async () => {
      mockUpsertPool.mockResolvedValue({
        id: "pool-1",
        tenant_id: "tenant-123",
        total_options: "100000",
      });

      const res = await app.request("/pool", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_options: 100000, pool_percentage: 10 }),
      });

      expect(res.status).toBe(200);
      expect(mockUpsertPool.mock.calls[0][0].where).toEqual({
        tenant_id: "tenant-123",
      });
    });

    it("should reject pool changes for non-admin roles", async () => {
      authState.role = "member";

      const res = await app.request("/pool", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_options: 100000 }),
      });

      expect(res.status).toBe(403);
      expect(mockUpsertPool).not.toHaveBeenCalled();
    });
  });
});
