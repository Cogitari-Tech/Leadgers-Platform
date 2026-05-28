import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { PrismaFinanceRepository } from "../../adapters/PrismaFinanceRepository";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { rateLimiter } from "../../middleware/rate-limiter";
import { validateBody } from "../../middleware/validate";
import { runwayProjectionSchema } from "../../schemas/finance";
import { AppEnv } from "../../types/env";

const runwayRoutes = new Hono<AppEnv>();

// Apply middlewares
runwayRoutes.use("*", authMiddleware);
runwayRoutes.use("*", tenancyMiddleware);

const DEFAULT_SCENARIOS = [
  {
    label: "Pessimista",
    revenueGrowthRate: -0.05,
    costReductionRate: 0,
    color: "#ef4444",
  },
  {
    label: "Base",
    revenueGrowthRate: 0.03,
    costReductionRate: 0.01,
    color: "#3b82f6",
  },
  {
    label: "Otimista",
    revenueGrowthRate: 0.1,
    costReductionRate: 0.03,
    color: "#10b981",
  },
];

runwayRoutes.post(
  "/",
  rateLimiter({ max: 20, windowMs: 60000 }),
  validateBody(runwayProjectionSchema),
  async (c) => {
    const body = c.get("validatedBody");
    const cashBalance = body.cashBalance;
    const projectionMonths = body.projectionMonths;
    const scenarios = body.scenarios || DEFAULT_SCENARIOS;

    const tenantId = c.get("tenantId");
    const repo = new PrismaFinanceRepository(prisma, tenantId);

    // Get current month's income statement
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const incomeStatement = await repo.getIncomeStatement(
      startOfMonth,
      endOfMonth,
    );

    const currentRevenue = incomeStatement.revenue || 0;
    const currentExpenses = incomeStatement.expenses || 0;

    // Fetch headcount plans to add extra expenses over time
    const headcountPlans = await prisma.headcount_plans.findMany({
      where: {
        tenant_id: tenantId,
        status: { in: ["planned", "hired"] },
      },
    });

    const results = scenarios.map((params: any) => {
      const data = [];
      let balance = cashBalance;
      let runwayMonths = projectionMonths;
      let zeroDate: string | null = null;
      let revenue = currentRevenue;
      let expenses = currentExpenses;

      for (let m = 0; m <= projectionMonths; m++) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() + m);
        const label = monthDate.toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        });

        const burn = expenses - revenue;

        data.push({
          month: m,
          label,
          cashBalance: Math.max(balance, 0),
          monthlyBurn: burn,
          monthlyRevenue: revenue,
        });

        if (balance <= 0 && !zeroDate) {
          runwayMonths = m;
          zeroDate = monthDate.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          });
        }

        balance -= burn;
        revenue *= 1 + params.revenueGrowthRate;
        expenses *= 1 - params.costReductionRate;

        // Add new headcount salaries if they start in the upcoming month
        const nextMonthDate = new Date();
        nextMonthDate.setMonth(nextMonthDate.getMonth() + m + 1);

        const newHeadcountMonthlyCost = headcountPlans
          .filter((plan: any) => {
            const startDate = new Date(plan.expected_start_date);
            return (
              startDate.getMonth() === nextMonthDate.getMonth() &&
              startDate.getFullYear() === nextMonthDate.getFullYear()
            );
          })
          .reduce(
            (sum: number, plan: any) => sum + Number(plan.monthly_salary),
            0,
          );

        expenses += newHeadcountMonthlyCost;
      }

      return {
        params,
        data,
        runwayMonths,
        monthlyBurn: currentExpenses - currentRevenue,
        zeroDate,
      };
    });

    return c.json({ results });
  },
);

export default runwayRoutes;
