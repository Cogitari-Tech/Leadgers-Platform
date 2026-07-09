import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { AppEnv } from "../../types/env";

const {
  mockGetAllAccounts,
  mockGetRawBalancesForAccounts,
  mockGetIncomeStatement,
  mockPoolFindUnique,
  mockGrantsFindMany,
  mockMrrFindMany,
  mockRoadmapCount,
} = vi.hoisted(() => ({
  mockGetAllAccounts: vi.fn(),
  mockGetRawBalancesForAccounts: vi.fn(),
  mockGetIncomeStatement: vi.fn(),
  mockPoolFindUnique: vi.fn(),
  mockGrantsFindMany: vi.fn(),
  mockMrrFindMany: vi.fn(),
  mockRoadmapCount: vi.fn(),
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
    c.set("userRole", "owner");
    await next();
  },
}));

vi.mock("../../adapters/PrismaFinanceRepository", () => ({
  PrismaFinanceRepository: class MockRepo {
    getAllAccounts = mockGetAllAccounts;
    getRawBalancesForAccounts = mockGetRawBalancesForAccounts;
    getIncomeStatement = mockGetIncomeStatement;
  },
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    esop_pools = { findUnique: mockPoolFindUnique };
    equity_grants = { findMany: mockGrantsFindMany };
    mrr_snapshots = { findMany: mockMrrFindMany };
    roadmap_items = { count: mockRoadmapCount };
    $disconnect() {
      return Promise.resolve();
    }
  },
}));

import alertsRoutes from "./alerts";

function primeCalmScenario() {
  mockGetAllAccounts.mockResolvedValue([]);
  mockGetRawBalancesForAccounts.mockResolvedValue(new Map());
  mockGetIncomeStatement.mockResolvedValue({
    revenue: 10000,
    expenses: 5000,
    details: {},
  });
  mockPoolFindUnique.mockResolvedValue(null);
  mockGrantsFindMany.mockResolvedValue([]);
  mockMrrFindMany.mockResolvedValue([]);
  mockRoadmapCount.mockResolvedValue(0);
}

describe("Predictive Alerts API", () => {
  let app: Hono<AppEnv>;

  beforeEach(() => {
    app = new Hono<AppEnv>();
    app.route("/", alertsRoutes);
    vi.clearAllMocks();
    primeCalmScenario();
  });

  it("should return no alerts for a healthy tenant", async () => {
    const res = await app.request("/");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.alerts).toHaveLength(0);
    expect(data.degraded).toBe(false);
  });

  it("should emit critical runway alert when cash covers under 6 months", async () => {
    mockGetAllAccounts.mockResolvedValue([
      { id: "a1", type: "checking", isDebitNature: () => true },
    ]);
    mockGetRawBalancesForAccounts.mockResolvedValue(
      new Map([["a1", { debit: 50000, credit: 0 }]]),
    );
    mockGetIncomeStatement.mockResolvedValue({
      revenue: 0,
      expenses: 40000, // window spans 4 months -> net burn 10000/month -> runway 5 months
      details: {},
    });

    const res = await app.request("/");
    const data = await res.json();

    const runway = data.alerts.find((a: any) => a.id === "runway-critical");
    expect(runway).toBeDefined();
    expect(runway.severity).toBe("critical");
    expect(runway.metric).toBe(5);
  });

  it("should emit ESOP pool alert above 80% utilization", async () => {
    mockPoolFindUnique.mockResolvedValue({ total_options: "100000" });
    mockGrantsFindMany.mockResolvedValue([{ options_total: "85000" }]);

    const res = await app.request("/");
    const data = await res.json();

    const pool = data.alerts.find((a: any) => a.id === "esop-pool-high");
    expect(pool).toBeDefined();
    expect(pool.metric).toBe(85);
  });

  it("should escalate churn to critical above 10% of MRR", async () => {
    mockMrrFindMany.mockResolvedValue([
      { total_mrr: "10000", churn_mrr: "1500" },
    ]);

    const res = await app.request("/");
    const data = await res.json();

    const churn = data.alerts.find((a: any) => a.id === "mrr-churn");
    expect(churn.severity).toBe("critical");
  });

  it("should sort alerts by severity (critical first)", async () => {
    mockRoadmapCount.mockResolvedValue(3); // info
    mockMrrFindMany.mockResolvedValue([
      { total_mrr: "10000", churn_mrr: "1500" }, // critical
    ]);

    const res = await app.request("/");
    const data = await res.json();

    expect(data.alerts[0].severity).toBe("critical");
    expect(data.alerts[data.alerts.length - 1].severity).toBe("info");
  });

  it("should degrade gracefully when one source fails", async () => {
    mockGetAllAccounts.mockRejectedValue(new Error("db down"));
    mockRoadmapCount.mockResolvedValue(2);

    const res = await app.request("/");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.degraded).toBe(true);
    expect(
      data.alerts.find((a: any) => a.id === "roadmap-overdue"),
    ).toBeDefined();
  });
});
