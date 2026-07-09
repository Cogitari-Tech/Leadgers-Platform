import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { inngest } from "../../jobs/queue";
import { documentsRouter } from "./documents";
import { updatesRouter } from "./updates";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

// AI report generation spends AI credits and writes investor updates — same
// write roles as the rest of the investor module (owner/admin only).
const REPORT_WRITE_ROLES = ["owner", "admin"];

// byokKey/byokProvider flow into the Inngest job and select the AI adapter.
// Enums + length caps stop arbitrary client strings from reaching the job
// (provider injection / oversized-payload DoS).
const generateReportSchema = z.object({
  documentId: z.string().uuid().optional(),
  type: z.enum(["monthly", "quarterly", "annual"]).default("monthly"),
  model: z.enum(["fast", "balanced", "advanced"]).default("fast"),
  byokKey: z.string().min(20).max(256).optional(),
  byokProvider: z.enum(["anthropic", "google"]).optional(),
});

const investorRouter = new Hono<AppEnv>();

// Auth + tenant isolation for ALL investor routes (incl. mounted documentsRouter).
// Without this, Prisma bypasses RLS and an undefined tenantId drops the tenant_id
// filter — exposing every tenant's data room to anonymous callers.
investorRouter.use("*", authMiddleware);
investorRouter.use("*", tenancyMiddleware);

investorRouter.route("/documents", documentsRouter);
investorRouter.route("/updates", updatesRouter);

investorRouter.post(
  "/reports/generate",
  zValidator("json", generateReportSchema),
  async (c) => {
    // tenantId comes ONLY from the authenticated session — never from the body,
    // otherwise an anonymous caller could target any tenant's financial data.
    const tenantId = c.get("tenantId");
    const userRole = c.get("userRole");
    const body = c.req.valid("json");
    const documentId = body.documentId || crypto.randomUUID();

    if (!tenantId) {
      return c.json({ error: "Tenant ID required" }, 400);
    }

    if (!REPORT_WRITE_ROLES.includes(userRole)) {
      return c.json(
        { error: "Insufficient permissions to generate investor reports" },
        403,
      );
    }

    // A byokKey without a provider would silently fall through to the
    // platform's own env keys while the caller believes their key was used.
    if (body.byokKey && !body.byokProvider) {
      return c.json({ error: "byokProvider is required with byokKey" }, 400);
    }

    await inngest.send({
      name: "investor.report/generate",
      data: {
        documentId,
        tenantId,
        type: body.type,
        model: body.model,
        byokKey: body.byokKey,
        byokProvider: body.byokProvider,
      },
    });

    return c.json({ status: "queued", reportId: documentId }, 202);
  },
);

export default investorRouter;
