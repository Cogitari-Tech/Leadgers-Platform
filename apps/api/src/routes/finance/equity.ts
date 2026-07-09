import { Hono } from "hono";
import { Prisma } from "@prisma/client";
import { EquityGrant } from "@leadgers/core";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { validateBody } from "../../middleware/validate";
import { createEquityGrantSchema, upsertEsopPoolSchema } from "../../schemas";
import { AppEnv } from "../../types/env";

// ESOP grants are company-wide financial records — same write roles as the
// cap table (see cap-table.ts).
const EQUITY_WRITE_ROLES = ["owner", "admin"];

// Pool utilization alert threshold (PRD §7.6 RN-06).
const POOL_ALERT_THRESHOLD = 0.8;

function toEntity(row: Record<string, unknown>): EquityGrant {
  return EquityGrant.fromPersistence(row);
}

function grantView(row: Record<string, unknown>) {
  const grant = toEntity(row);
  const vested = grant.vestedOptions();
  return {
    ...row,
    options_total: Number(row.options_total),
    grant_price: Number(row.grant_price),
    vested_options: vested,
    unvested_options: grant.optionsTotal - vested,
    vested_percentage:
      grant.optionsTotal > 0
        ? Math.round((vested / grant.optionsTotal) * 100)
        : 0,
    next_vesting_date: grant.nextVestingDate(),
    exercise_window_open: grant.isExerciseWindowOpen(),
  };
}

const equityRoutes = new Hono<AppEnv>();

equityRoutes.use("*", authMiddleware);
equityRoutes.use("*", tenancyMiddleware);

// --- GRANTS ---

equityRoutes.get("/grants", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const grants = await prisma.equity_grants.findMany({
      where: { tenant_id: tenantId },
      orderBy: { grant_date: "asc" },
    });
    return c.json(grants.map((g: Record<string, unknown>) => grantView(g)));
  } catch (error) {
    console.error("Error fetching equity grants:", error);
    return c.json({ error: "Failed to fetch equity grants" }, 500);
  }
});

equityRoutes.post(
  "/grants",
  validateBody(createEquityGrantSchema),
  async (c) => {
    const tenantId = c.get("tenantId");
    const userRole = c.get("userRole");
    const user = c.get("user");

    if (!EQUITY_WRITE_ROLES.includes(userRole)) {
      return c.json(
        { error: "Insufficient permissions to manage equity grants" },
        403,
      );
    }

    try {
      const body = c.get("validatedBody");

      // Domain validation (cliff <= vesting, positive options, valid date).
      const entity = EquityGrant.create({
        tenantId: tenantId as string,
        beneficiaryName: body.beneficiary_name,
        beneficiaryEmail: body.beneficiary_email,
        optionsTotal: body.options_total,
        grantDate: new Date(body.grant_date),
        cliffMonths: body.cliff_months,
        vestingMonths: body.vesting_months,
        grantPrice: body.grant_price,
        acceleration: body.acceleration,
        exerciseWindowDays: body.exercise_window_days,
      });

      const grant = await prisma.equity_grants.create({
        data: {
          tenant_id: tenantId as string,
          beneficiary_name: entity.beneficiaryName,
          beneficiary_email: entity.beneficiaryEmail,
          options_total: entity.optionsTotal,
          grant_date: entity.grantDate,
          cliff_months: entity.cliffMonths,
          vesting_months: entity.vestingMonths,
          grant_price: entity.grantPrice,
          acceleration: entity.acceleration,
          exercise_window_days: entity.exerciseWindowDays,
          notes: body.notes,
          created_by: user?.id,
        },
      });

      return c.json(grantView(grant), 201);
    } catch (error) {
      if (error instanceof Error && error.message.includes("must")) {
        return c.json({ error: error.message }, 400);
      }
      console.error("Error creating equity grant:", error);
      return c.json({ error: "Failed to create equity grant" }, 500);
    }
  },
);

equityRoutes.get("/grants/:id/timeline", async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");

  try {
    const row = await prisma.equity_grants.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!row) return c.json({ error: "Grant not found" }, 404);

    const grant = toEntity(row);
    return c.json({
      grant_id: row.id,
      milestones: grant.vestingTimeline(24),
    });
  } catch (error) {
    console.error("Error building vesting timeline:", error);
    return c.json({ error: "Failed to build vesting timeline" }, 500);
  }
});

equityRoutes.post("/grants/:id/terminate", async (c) => {
  const tenantId = c.get("tenantId");
  const userRole = c.get("userRole");
  const id = c.req.param("id");

  if (!EQUITY_WRITE_ROLES.includes(userRole)) {
    return c.json(
      { error: "Insufficient permissions to manage equity grants" },
      403,
    );
  }

  try {
    const row = await prisma.equity_grants.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!row) return c.json({ error: "Grant not found" }, 404);

    const grant = toEntity(row);
    grant.terminate();

    const updated = await prisma.equity_grants.update({
      where: { id, tenant_id: tenantId as string },
      data: { status: grant.status, terminated_at: grant.terminatedAt },
    });

    return c.json(grantView(updated));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Cannot")) {
      return c.json({ error: error.message }, 409);
    }
    console.error("Error terminating equity grant:", error);
    return c.json({ error: "Failed to terminate equity grant" }, 500);
  }
});

equityRoutes.delete("/grants/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const userRole = c.get("userRole");
  const id = c.req.param("id");

  if (!EQUITY_WRITE_ROLES.includes(userRole)) {
    return c.json(
      { error: "Insufficient permissions to delete financial records" },
      403,
    );
  }

  try {
    await prisma.equity_grants.delete({
      where: { id, tenant_id: tenantId as string },
    });
    return c.json({ success: true });
  } catch (error) {
    // P2025 = no row matched {id, tenant_id} — missing or another tenant's.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return c.json({ error: "Grant not found" }, 404);
    }
    console.error("Error deleting equity grant:", error);
    return c.json({ error: "Failed to delete equity grant" }, 500);
  }
});

// --- POOL (RN-06) ---

equityRoutes.get("/pool", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const [pool, grants] = await Promise.all([
      prisma.esop_pools.findUnique({ where: { tenant_id: tenantId } }),
      prisma.equity_grants.findMany({
        where: { tenant_id: tenantId, status: { not: "cancelled" } },
      }),
    ]);

    const issuedOptions = grants.reduce(
      (sum: number, g: Record<string, unknown>) =>
        sum + Number(g.options_total),
      0,
    );
    const vestedOptions = grants.reduce(
      (sum: number, g: Record<string, unknown>) =>
        sum + toEntity(g).vestedOptions(),
      0,
    );
    const totalOptions = pool ? Number(pool.total_options) : null;
    const utilization =
      totalOptions && totalOptions > 0 ? issuedOptions / totalOptions : null;

    return c.json({
      pool: pool ? { ...pool, total_options: totalOptions } : null,
      issued_options: issuedOptions,
      vested_options: vestedOptions,
      available_options:
        totalOptions !== null ? totalOptions - issuedOptions : null,
      utilization_percentage:
        utilization !== null ? Math.round(utilization * 100) : null,
      over_threshold:
        utilization !== null && utilization > POOL_ALERT_THRESHOLD,
      beneficiaries: grants.length,
    });
  } catch (error) {
    console.error("Error fetching ESOP pool:", error);
    return c.json({ error: "Failed to fetch ESOP pool" }, 500);
  }
});

equityRoutes.put("/pool", validateBody(upsertEsopPoolSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const userRole = c.get("userRole");

  if (!EQUITY_WRITE_ROLES.includes(userRole)) {
    return c.json(
      { error: "Insufficient permissions to manage the ESOP pool" },
      403,
    );
  }

  try {
    const body = c.get("validatedBody");

    const pool = await prisma.esop_pools.upsert({
      where: { tenant_id: tenantId as string },
      create: {
        tenant_id: tenantId as string,
        total_options: body.total_options,
        pool_percentage: body.pool_percentage,
        notes: body.notes,
      },
      update: {
        total_options: body.total_options,
        pool_percentage: body.pool_percentage,
        notes: body.notes,
      },
    });

    return c.json(pool);
  } catch (error) {
    console.error("Error saving ESOP pool:", error);
    return c.json({ error: "Failed to save ESOP pool" }, 500);
  }
});

export default equityRoutes;
