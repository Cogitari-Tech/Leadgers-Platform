import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { PrismaFinanceRepository } from "../../adapters/PrismaFinanceRepository";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

/**
 * Alertas Preditivos (PRD — Inteligência & IA, Must).
 * Rule-based engine computed on demand from the tenant's own data:
 * runway, burn, ESOP pool, MRR churn/queda e roadmap atrasado.
 */

export type AlertSeverity = "info" | "warning" | "critical";

export interface PredictiveAlert {
  id: string;
  severity: AlertSeverity;
  category: "runway" | "burn" | "equity" | "revenue" | "roadmap";
  title: string;
  message: string;
  metric?: number;
}

const CASH_ACCOUNT_TYPES = ["checking", "savings", "investment", "cash"];
const RUNWAY_CRITICAL_MONTHS = 6;
const RUNWAY_WARNING_MONTHS = 9;
const CHURN_WARNING_RATIO = 0.05;
const CHURN_CRITICAL_RATIO = 0.1;
const POOL_ALERT_RATIO = 0.8;

async function buildFinanceAlerts(
  tenantId: string,
): Promise<PredictiveAlert[]> {
  const alerts: PredictiveAlert[] = [];
  const repo = new PrismaFinanceRepository(prisma, tenantId);
  const today = new Date();

  const accounts = await repo.getAllAccounts();
  const cashAccounts = accounts.filter((a) =>
    CASH_ACCOUNT_TYPES.includes(a.type),
  );
  // Single batch query instead of one balance lookup per cash account (N+1).
  const rawBalances = await repo.getRawBalancesForAccounts(
    cashAccounts.map((a) => a.id),
    today,
  );
  const totalCash = cashAccounts.reduce((sum, account) => {
    const entry = rawBalances.get(account.id);
    if (!entry) return sum;
    const signed = account.isDebitNature()
      ? entry.debit - entry.credit
      : entry.credit - entry.debit;
    return sum + signed;
  }, 0);

  const start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const WINDOW_MONTHS = 4; // start..end spans 4 calendar months inclusive.
  const incomeStatement = await repo.getIncomeStatement(start, end);
  const monthlyNetBurn =
    (incomeStatement.expenses - incomeStatement.revenue) / WINDOW_MONTHS;

  if (monthlyNetBurn > 0 && totalCash > 0) {
    const runwayMonths = totalCash / monthlyNetBurn;
    if (runwayMonths < RUNWAY_CRITICAL_MONTHS) {
      alerts.push({
        id: "runway-critical",
        severity: "critical",
        category: "runway",
        title: "Runway crítico",
        message: `Caixa cobre aproximadamente ${runwayMonths.toFixed(1)} meses no burn atual. Priorize captação ou corte de custos imediatamente.`,
        metric: Number(runwayMonths.toFixed(1)),
      });
    } else if (runwayMonths < RUNWAY_WARNING_MONTHS) {
      alerts.push({
        id: "runway-warning",
        severity: "warning",
        category: "runway",
        title: "Runway abaixo de 9 meses",
        message: `Runway projetado de ${runwayMonths.toFixed(1)} meses. Ideal iniciar planejamento de captação com 12 meses de antecedência.`,
        metric: Number(runwayMonths.toFixed(1)),
      });
    }
  }

  if (
    monthlyNetBurn > 0 &&
    incomeStatement.revenue > 0 &&
    incomeStatement.expenses > incomeStatement.revenue * 2
  ) {
    alerts.push({
      id: "burn-high",
      severity: "warning",
      category: "burn",
      title: "Burn desproporcional à receita",
      message:
        "Despesas do trimestre superam o dobro da receita. Revise o breakdown de burn rate por categoria.",
    });
  }

  return alerts;
}

async function buildEquityAlerts(tenantId: string): Promise<PredictiveAlert[]> {
  const [pool, grants] = await Promise.all([
    prisma.esop_pools.findUnique({ where: { tenant_id: tenantId } }),
    prisma.equity_grants.findMany({
      where: { tenant_id: tenantId, status: { not: "cancelled" } },
      select: { options_total: true },
    }),
  ]);
  if (!pool) return [];

  const issued = grants.reduce(
    (sum: number, g: { options_total: unknown }) =>
      sum + Number(g.options_total),
    0,
  );
  const total = Number(pool.total_options);
  if (total > 0 && issued / total > POOL_ALERT_RATIO) {
    return [
      {
        id: "esop-pool-high",
        severity: "warning",
        category: "equity",
        title: "Pool de ESOP quase esgotado",
        message: `${Math.round((issued / total) * 100)}% do pool emitido. Novos grants podem exigir ampliação do pool (diluição).`,
        metric: Math.round((issued / total) * 100),
      },
    ];
  }
  return [];
}

async function buildRevenueAlerts(
  tenantId: string,
): Promise<PredictiveAlert[]> {
  const alerts: PredictiveAlert[] = [];
  const snapshots = await prisma.mrr_snapshots.findMany({
    where: { tenant_id: tenantId },
    orderBy: { month_date: "asc" },
  });
  if (snapshots.length === 0) return alerts;

  const latest = snapshots[snapshots.length - 1];
  const totalMrr = Number(latest.total_mrr);
  const churn = Number(latest.churn_mrr);

  if (totalMrr > 0 && churn / totalMrr >= CHURN_WARNING_RATIO) {
    const ratio = churn / totalMrr;
    alerts.push({
      id: "mrr-churn",
      severity: ratio >= CHURN_CRITICAL_RATIO ? "critical" : "warning",
      category: "revenue",
      title: "Churn de MRR elevado",
      message: `Churn de ${(ratio * 100).toFixed(1)}% do MRR no último mês. Investigue cancelamentos antes que o padrão se consolide.`,
      metric: Number((ratio * 100).toFixed(1)),
    });
  }

  if (snapshots.length >= 2) {
    const previous = Number(snapshots[snapshots.length - 2].total_mrr);
    if (previous > 0 && totalMrr < previous) {
      alerts.push({
        id: "mrr-shrinking",
        severity: "warning",
        category: "revenue",
        title: "MRR em queda",
        message: `MRR caiu ${(((previous - totalMrr) / previous) * 100).toFixed(1)}% em relação ao mês anterior.`,
      });
    }
  }

  return alerts;
}

async function buildRoadmapAlerts(
  tenantId: string,
): Promise<PredictiveAlert[]> {
  const overdue = await prisma.roadmap_items.count({
    where: {
      tenant_id: tenantId,
      status: { notIn: ["completed", "cancelled"] },
      end_date: { lt: new Date() },
    },
  });
  if (overdue === 0) return [];
  return [
    {
      id: "roadmap-overdue",
      severity: "info",
      category: "roadmap",
      title: "Itens de roadmap atrasados",
      message: `${overdue} item(ns) do roadmap passaram da data de entrega e não foram concluídos.`,
      metric: overdue,
    },
  ];
}

const alertsRoutes = new Hono<AppEnv>();

alertsRoutes.use("*", authMiddleware);
alertsRoutes.use("*", tenancyMiddleware);

alertsRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId") as string;

  try {
    const results = await Promise.allSettled([
      buildFinanceAlerts(tenantId),
      buildEquityAlerts(tenantId),
      buildRevenueAlerts(tenantId),
      buildRoadmapAlerts(tenantId),
    ]);

    // One failing source must not take the whole alert feed down.
    const alerts = results.flatMap((r) =>
      r.status === "fulfilled" ? r.value : [],
    );
    const failedSources = results.filter((r) => r.status === "rejected").length;

    const severityOrder: Record<AlertSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    };
    alerts.sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
    );

    return c.json({
      alerts,
      generated_at: new Date().toISOString(),
      degraded: failedSources > 0,
    });
  } catch (error) {
    console.error("Error computing predictive alerts:", error);
    return c.json({ error: "Failed to compute predictive alerts" }, 500);
  }
});

export default alertsRoutes;
