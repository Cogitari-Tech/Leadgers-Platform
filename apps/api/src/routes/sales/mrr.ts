import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { validateBody } from "../../middleware/validate";
import { upsertMrrSnapshotSchema } from "../../schemas";
import { AppEnv } from "../../types/env";

// Revenue records follow the same write roles as the rest of finance/sales.
const MRR_WRITE_ROLES = ["owner", "admin"];

/** Normalizes any date string to the first day of its month (one snapshot/month). */
function toMonthStart(value: string): Date | null {
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

const mrrRoutes = new Hono<AppEnv>();

mrrRoutes.use("*", authMiddleware);
mrrRoutes.use("*", tenancyMiddleware);

mrrRoutes.get("/", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const snapshots = await prisma.mrr_snapshots.findMany({
      where: { tenant_id: tenantId },
      orderBy: { month_date: "asc" },
    });
    return c.json(snapshots);
  } catch (error) {
    console.error("Error fetching MRR snapshots:", error);
    return c.json({ error: "Failed to fetch MRR snapshots" }, 500);
  }
});

mrrRoutes.post("/", validateBody(upsertMrrSnapshotSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const userRole = c.get("userRole");
  const user = c.get("user");

  if (!MRR_WRITE_ROLES.includes(userRole)) {
    return c.json(
      { error: "Insufficient permissions to manage MRR snapshots" },
      403,
    );
  }

  try {
    const body = c.get("validatedBody");
    const monthDate = toMonthStart(body.month_date);
    if (!monthDate) {
      return c.json({ error: "Invalid month_date" }, 400);
    }

    const data = {
      total_mrr: body.total_mrr,
      total_arr: body.total_mrr * 12,
      new_mrr: body.new_mrr,
      expansion_mrr: body.expansion_mrr,
      churn_mrr: body.churn_mrr,
      contraction_mrr: body.contraction_mrr,
      notes: body.notes,
    };

    const snapshot = await prisma.mrr_snapshots.upsert({
      where: {
        tenant_id_month_date: {
          tenant_id: tenantId as string,
          month_date: monthDate,
        },
      },
      create: {
        tenant_id: tenantId as string,
        month_date: monthDate,
        created_by: user?.id,
        ...data,
      },
      update: data,
    });

    return c.json(snapshot, 201);
  } catch (error) {
    console.error("Error saving MRR snapshot:", error);
    return c.json({ error: "Failed to save MRR snapshot" }, 500);
  }
});

mrrRoutes.delete("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const userRole = c.get("userRole");
  const id = c.req.param("id");

  if (!MRR_WRITE_ROLES.includes(userRole)) {
    return c.json(
      { error: "Insufficient permissions to delete MRR snapshots" },
      403,
    );
  }

  try {
    await prisma.mrr_snapshots.delete({
      where: { id, tenant_id: tenantId as string },
    });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting MRR snapshot:", error);
    return c.json({ error: "Failed to delete MRR snapshot" }, 500);
  }
});

export default mrrRoutes;
