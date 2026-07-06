import { describe, it, expect, vi } from "vitest";
import app from "../../app";

// Regression tests for VULN-001/002/003 (found via the stale sentinel-finance-audit
// branch, reimplemented against current develop): missing RBAC on cap table
// deletions, unbounded projectionMonths on the runway simulation (DoS), and
// unvalidated cap table creation payloads.

const { getMockRole, setMockRole } = vi.hoisted(() => {
  let role = "admin";
  return {
    getMockRole: () => role,
    setMockRole: (next: string) => {
      role = next;
    },
  };
});

vi.mock("../../config/supabase", () => ({
  createScopedClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "user-123", email: "test@leadgers.com" } },
        error: null,
      }),
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
                  roles: { name: getMockRole() },
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

const deleteRound = vi.fn().mockResolvedValue({});
const createRound = vi.fn().mockResolvedValue({ id: "round-1" });
const deleteShareholder = vi.fn().mockResolvedValue({});
const createShareholder = vi.fn().mockResolvedValue({ id: "shareholder-1" });

vi.mock("../../config/prisma", () => ({
  prisma: {
    cap_table_rounds: {
      delete: (...args: unknown[]) => deleteRound(...args),
      create: (...args: unknown[]) => createRound(...args),
      findMany: vi.fn().mockResolvedValue([]),
    },
    cap_table_shareholders: {
      delete: (...args: unknown[]) => deleteShareholder(...args),
      create: (...args: unknown[]) => createShareholder(...args),
      findMany: vi.fn().mockResolvedValue([]),
    },
    headcount_plans: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("../../adapters/PrismaFinanceRepository", () => ({
  PrismaFinanceRepository: class {
    async getIncomeStatement() {
      return { revenue: 10000, expenses: 8000, details: {} };
    }
  },
}));

const AUTH_HEADERS = {
  Authorization: "Bearer valid-token",
  "x-tenant-id": "tenant-aaa",
  "Content-Type": "application/json",
};

describe("Cap table RBAC on deletions (VULN-001)", () => {
  it("rejects a 'member' role deleting a round", async () => {
    setMockRole("member");
    const res = await app.request("/api/finance/cap-table/rounds/round-1", {
      method: "DELETE",
      headers: AUTH_HEADERS,
    });
    expect(res.status).toBe(403);
    expect(deleteRound).not.toHaveBeenCalled();
  });

  it("rejects a 'viewer' role deleting a shareholder", async () => {
    setMockRole("viewer");
    const res = await app.request(
      "/api/finance/cap-table/shareholders/holder-1",
      { method: "DELETE", headers: AUTH_HEADERS },
    );
    expect(res.status).toBe(403);
    expect(deleteShareholder).not.toHaveBeenCalled();
  });

  it("allows an 'admin' role to delete a round", async () => {
    setMockRole("admin");
    const res = await app.request("/api/finance/cap-table/rounds/round-1", {
      method: "DELETE",
      headers: AUTH_HEADERS,
    });
    expect(res.status).toBe(200);
    expect(deleteRound).toHaveBeenCalled();
  });

  it("allows an 'owner' role to delete a shareholder", async () => {
    setMockRole("owner");
    const res = await app.request(
      "/api/finance/cap-table/shareholders/holder-1",
      { method: "DELETE", headers: AUTH_HEADERS },
    );
    expect(res.status).toBe(200);
    expect(deleteShareholder).toHaveBeenCalled();
  });
});

describe("Cap table creation validation and mass-assignment guard (VULN-003)", () => {
  it("rejects a round missing required fields", async () => {
    setMockRole("admin");
    const res = await app.request("/api/finance/cap-table/rounds", {
      method: "POST",
      headers: AUTH_HEADERS,
      body: JSON.stringify({ round_type: "seed" }),
    });
    expect(res.status).toBe(400);
  });

  it("ignores client-supplied tenant_id/created_by on round creation", async () => {
    setMockRole("admin");
    createRound.mockClear();
    const res = await app.request("/api/finance/cap-table/rounds", {
      method: "POST",
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        round_name: "Seed",
        round_type: "seed",
        pre_money_valuation: 1_000_000,
        amount_raised: 200_000,
        tenant_id: "spoofed-tenant",
        created_by: "spoofed-user",
      }),
    });
    expect(res.status).toBe(201);
    const createArgs = createRound.mock.calls[0][0];
    expect(createArgs.data.tenant_id).toBe("tenant-aaa");
    expect(createArgs.data.created_by).toBe("user-123");
  });

  it("rejects an out-of-range ownership_percentage on shareholder creation", async () => {
    setMockRole("admin");
    const res = await app.request("/api/finance/cap-table/shareholders", {
      method: "POST",
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        shareholder_name: "Founder",
        shareholder_type: "founder",
        shares_count: 1000,
        share_price: 1,
        ownership_percentage: 250,
        investment_amount: 0,
      }),
    });
    expect(res.status).toBe(400);
  });
});

describe("Runway projection DoS guard (VULN-002)", () => {
  it("rejects an absurdly large projectionMonths", async () => {
    const res = await app.request("/api/finance/runway", {
      method: "POST",
      headers: AUTH_HEADERS,
      body: JSON.stringify({ projectionMonths: 999_999_999 }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects a negative projectionMonths", async () => {
    const res = await app.request("/api/finance/runway", {
      method: "POST",
      headers: AUTH_HEADERS,
      body: JSON.stringify({ projectionMonths: -5 }),
    });
    expect(res.status).toBe(400);
  });

  it("accepts a valid projection within bounds", async () => {
    const res = await app.request("/api/finance/runway", {
      method: "POST",
      headers: AUTH_HEADERS,
      body: JSON.stringify({ cashBalance: 50000, projectionMonths: 12 }),
    });
    expect(res.status).toBe(200);
  });
});
