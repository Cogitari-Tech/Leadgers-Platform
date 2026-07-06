import { Hono } from "hono";
import { inngest } from "../../jobs/queue";
import { PrismaClient } from "@prisma/client";
import { documentsRouter } from "./documents";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

const prisma = new PrismaClient();
const investorRouter = new Hono<AppEnv>();

// Auth + tenant isolation for ALL investor routes (incl. mounted documentsRouter).
// Without this, Prisma bypasses RLS and an undefined tenantId drops the tenant_id
// filter — exposing every tenant's data room to anonymous callers.
investorRouter.use("*", authMiddleware);
investorRouter.use("*", tenancyMiddleware);

investorRouter.route("/documents", documentsRouter);

investorRouter.get("/updates", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const updates = await prisma.investor_updates.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });

    return c.json({
      data: updates,
      meta: { message: "Investor updates list" },
    });
  } catch (error) {
    console.error("Error fetching investor updates:", error);
    return c.json({ error: "Failed to fetch updates" }, 500);
  }
});

investorRouter.post("/reports/generate", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  // tenantId comes ONLY from the authenticated session — never from the body,
  // otherwise an anonymous caller could target any tenant's financial data.
  const tenantId = c.get("tenantId");
  const documentId = body?.documentId || crypto.randomUUID();

  if (!tenantId) {
    return c.json({ error: "Tenant ID required" }, 400);
  }

  await inngest.send({
    name: "investor.report/generate",
    data: {
      documentId,
      tenantId,
      type: body?.type || "monthly",
      model: body?.model || "fast",
      byokKey: body?.byokKey,
      byokProvider: body?.byokProvider,
    },
  });

  return c.json({ status: "queued", reportId: documentId }, 202);
});

export default investorRouter;
