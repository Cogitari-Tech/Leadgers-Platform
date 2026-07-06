import { Hono } from "hono";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { validateBody } from "../../middleware/validate";
import {
  createDealSchema,
  updateDealSchema,
  createMrrSnapshotSchema,
} from "../../schemas";
import { AppEnv } from "../../types/env";

const salesRoutes = new Hono<AppEnv>();

salesRoutes.use("*", authMiddleware);
salesRoutes.use("*", tenancyMiddleware);

salesRoutes.get("/deals", async (c) => {
  const tenantId = c.get("tenantId");
  const stage = c.req.query("stage");

  try {
    const deals = await prisma.sales_opportunities.findMany({
      where: {
        tenant_id: tenantId,
        ...(stage ? { stage } : {}),
      },
      orderBy: { updated_at: "desc" },
    });
    return c.json(deals);
  } catch (err) {
    console.error("Error fetching deals:", err);
    return c.json({ error: "Failed to fetch deals" }, 500);
  }
});

salesRoutes.get("/deals/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const dealId = c.req.param("id");

  try {
    const deal = await prisma.sales_opportunities.findFirst({
      where: { id: dealId, tenant_id: tenantId },
    });

    if (!deal) return c.json({ error: "Deal not found" }, 404);
    return c.json(deal);
  } catch (err) {
    console.error("Error fetching deal:", err);
    return c.json({ error: "Failed to fetch deal" }, 500);
  }
});

salesRoutes.post("/deals", validateBody(createDealSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const body = c.get("validatedBody");

  try {
    const deal = await prisma.sales_opportunities.create({
      data: {
        tenant_id: tenantId,
        title: body.title,
        client_name: body.client_name,
        value: body.value,
        mrr_amount: body.mrr_amount ?? null,
        stage: body.stage,
        expected_close_date: body.expected_close_date
          ? new Date(body.expected_close_date)
          : null,
        probability: body.probability,
        type: body.type,
        recurrence: body.recurrence,
        notes: body.notes ?? null,
      },
    });
    return c.json(deal, 201);
  } catch (err) {
    console.error("Error creating deal:", err);
    return c.json({ error: "Failed to create deal" }, 500);
  }
});

// Atomic update with tenant_id in WHERE: a single UPDATE is race-free (no
// read-then-write window) and IDOR-safe. Prisma throws P2025 when no row
// matches (missing id or wrong tenant) -> 404.
salesRoutes.patch("/deals/:id", validateBody(updateDealSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const dealId = c.req.param("id");
  const body = c.get("validatedBody");

  try {
    const result = await prisma.sales_opportunities.update({
      where: { id: dealId, tenant_id: tenantId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.client_name !== undefined && {
          client_name: body.client_name,
        }),
        ...(body.value !== undefined && { value: body.value }),
        ...(body.mrr_amount !== undefined && { mrr_amount: body.mrr_amount }),
        ...(body.stage !== undefined && { stage: body.stage }),
        ...(body.expected_close_date !== undefined && {
          expected_close_date: body.expected_close_date
            ? new Date(body.expected_close_date)
            : null,
        }),
        ...(body.probability !== undefined && {
          probability: body.probability,
        }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.recurrence !== undefined && { recurrence: body.recurrence }),
        ...(body.notes !== undefined && { notes: body.notes }),
        updated_at: new Date(),
      },
    });

    return c.json(result);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return c.json({ error: "Deal not found" }, 404);
    }
    console.error("Error updating deal:", err);
    return c.json({ error: "Failed to update deal" }, 500);
  }
});

// FIXED: Delete with tenant_id in WHERE clause to prevent IDOR
salesRoutes.delete("/deals/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const dealId = c.req.param("id");

  try {
    const existing = await prisma.sales_opportunities.findFirst({
      where: { id: dealId, tenant_id: tenantId },
    });

    if (!existing) {
      return c.json({ error: "Deal not found" }, 404);
    }

    await prisma.sales_opportunities.delete({
      where: { id: dealId, tenant_id: tenantId },
    });
    return c.json({ success: true });
  } catch (err) {
    console.error("Error deleting deal:", err);
    return c.json({ error: "Failed to delete deal" }, 500);
  }
});

salesRoutes.get("/mrr", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const snapshots = await prisma.mrr_snapshots.findMany({
      where: { tenant_id: tenantId },
      orderBy: { month_date: "asc" },
    });
    return c.json(snapshots);
  } catch (err) {
    console.error("Error fetching MRR snapshots:", err);
    return c.json({ error: "Failed to fetch MRR data" }, 500);
  }
});

salesRoutes.post("/mrr", validateBody(createMrrSnapshotSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const body = c.get("validatedBody");

  try {
    const snapshot = await prisma.mrr_snapshots.create({
      data: {
        tenant_id: tenantId,
        month_date: new Date(body.month_date),
        total_mrr: body.total_mrr,
        total_arr: body.total_arr,
        new_mrr: body.new_mrr,
        expansion_mrr: body.expansion_mrr,
        churn_mrr: body.churn_mrr,
        contraction_mrr: body.contraction_mrr,
      },
    });
    return c.json(snapshot, 201);
  } catch (err) {
    console.error("Error creating MRR snapshot:", err);
    return c.json({ error: "Failed to create MRR snapshot" }, 500);
  }
});

export default salesRoutes;
