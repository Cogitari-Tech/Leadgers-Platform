import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { AppEnv } from "../../types/env";

const { mockDeleteRound, mockCreateRound, mockGetIncomeStatement } = vi.hoisted(
  () => ({
    mockDeleteRound: vi.fn(),
    mockCreateRound: vi.fn(),
    mockGetIncomeStatement: vi.fn(),
  }),
);

vi.mock("../../middleware/auth", () => ({
  authMiddleware: async (c: any, next: any) => {
    c.set("user", { id: "user-123", email: "test@example.com" });
    await next();
  },
}));

// We'll dynamically set the role in tests if needed, but for now let's mock it
let currentRole = "member";
vi.mock("../../middleware/tenancy", () => ({
  tenancyMiddleware: async (c: any, next: any) => {
    c.set("tenantId", "tenant-123");
    c.set("userRole", currentRole);
    await next();
  },
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    cap_table_rounds = {
      delete: mockDeleteRound,
      create: mockCreateRound,
      findMany: vi.fn().mockResolvedValue([]),
    };
    cap_table_shareholders = {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      delete: vi.fn(),
    };
    headcount_plans = {
      findMany: vi.fn().mockResolvedValue([]),
    };
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

vi.mock("../../adapters/PrismaFinanceRepository", () => ({
  PrismaFinanceRepository: class {
    getIncomeStatement = mockGetIncomeStatement;
  },
}));

import capTableRoutes from "./cap-table";
import runwayRoutes from "./runway";

describe("Finance Module Security Tests", () => {
  let app: Hono<AppEnv>;

  beforeEach(() => {
    app = new Hono<AppEnv>();
    app.route("/cap-table", capTableRoutes);
    app.route("/runway", runwayRoutes);
    vi.clearAllMocks();
    currentRole = "member"; // Reset to low privilege
  });

  describe("VULN-001: Missing Role-Based Access Control", () => {
    it("should prevent 'member' role from deleting cap table rounds", async () => {
      currentRole = "member";
      const res = await app.request("/cap-table/rounds/round-123", {
        method: "DELETE",
      });

      // This is EXPECTED TO FAIL (current behavior is 200)
      expect(res.status).toBe(403);
    });
  });

  describe("VULN-002: Potential DoS via Large projectionMonths", () => {
    it("should reject excessively large projectionMonths in runway", async () => {
      mockGetIncomeStatement.mockResolvedValue({
        revenue: 1000,
        expenses: 2000,
        details: {},
      });

      const res = await app.request("/runway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectionMonths: 1000000, // Excessive
        }),
      });

      // This is EXPECTED TO FAIL (current behavior is 200 and it tries to loop 1M times)
      expect(res.status).toBe(400);
    });
  });

  describe("VULN-003: Mass Assignment in POST endpoints", () => {
    it("should not allow overwriting tenant_id via request body in /rounds", async () => {
      mockCreateRound.mockImplementation(({ data }) =>
        Promise.resolve({ id: "new-id", ...data }),
      );

      const res = await app.request("/cap-table/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          round_name: "Seed",
          tenant_id: "ATTACKER-TENANT", // Attempted mass assignment
          amount_raised: 1000,
        }),
      });

      expect(res.status).toBe(201);

      // The implementation currently does:
      // data: { ...body, tenant_id: tenantId }
      // If body has tenant_id, it might be overwritten by the second tenant_id,
      // but let's check if other fields like 'id' or 'created_at' can be injected.

      expect(mockCreateRound).toHaveBeenCalledWith({
        data: expect.not.objectContaining({
          tenant_id: "ATTACKER-TENANT",
        }),
      });
    });

    it("should not allow injecting 'id' in cap table rounds", async () => {
      const res = await app.request("/cap-table/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "INJECTED-ID",
          round_name: "Seed",
          amount_raised: 1000,
        }),
      });

      // Now that validation is in place, it should either fail with 400
      // (if strip is not used and strict is used) or pass but strip the 'id'.
      // Zod by default strips extra fields.

      if (res.status === 201) {
        expect(mockCreateRound).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.not.objectContaining({
              id: "INJECTED-ID",
            }),
          }),
        );
      } else {
        expect(res.status).toBe(400);
      }
    });
  });
});
