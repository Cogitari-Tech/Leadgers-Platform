import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { validateBody } from "../../middleware/validate";
import {
  createInvestorUpdateSchema,
  updateInvestorUpdateSchema,
} from "../../schemas";
import { AppEnv } from "../../types/env";

// Updates follow the same write roles as the rest of investor relations.
const UPDATES_WRITE_ROLES = ["owner", "admin"];

export const updatesRouter = new Hono<AppEnv>();

updatesRouter.get("/", async (c) => {
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

updatesRouter.post("/", validateBody(createInvestorUpdateSchema), async (c) => {
  const tenantId = c.get("tenantId") as string;
  const userRole = c.get("userRole");
  const user = c.get("user");

  if (!UPDATES_WRITE_ROLES.includes(userRole)) {
    return c.json(
      { error: "Insufficient permissions to manage investor updates" },
      403,
    );
  }

  try {
    const body = c.get("validatedBody");
    const update = await prisma.investor_updates.create({
      data: {
        tenant_id: tenantId,
        title: body.title,
        content_md: body.content_md,
        period: body.period,
        status: "draft",
        created_by: user?.id,
      },
    });

    return c.json({ data: update }, 201);
  } catch (error) {
    console.error("Error creating investor update:", error);
    return c.json({ error: "Failed to create update" }, 500);
  }
});

updatesRouter.patch(
  "/:id",
  validateBody(updateInvestorUpdateSchema),
  async (c) => {
    const tenantId = c.get("tenantId") as string;
    const userRole = c.get("userRole");
    const id = c.req.param("id");

    if (!UPDATES_WRITE_ROLES.includes(userRole)) {
      return c.json(
        { error: "Insufficient permissions to manage investor updates" },
        403,
      );
    }

    try {
      const body = c.get("validatedBody");
      const existing = await prisma.investor_updates.findFirst({
        where: { id, tenant_id: tenantId },
      });
      if (!existing) {
        return c.json({ error: "Update not found" }, 404);
      }

      const update = await prisma.investor_updates.update({
        where: { id, tenant_id: tenantId },
        data: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.content_md !== undefined && {
            content_md: body.content_md,
          }),
          ...(body.period !== undefined && { period: body.period }),
          updated_at: new Date(),
        },
      });

      return c.json({ data: update });
    } catch (error) {
      console.error("Error updating investor update:", error);
      return c.json({ error: "Failed to update" }, 500);
    }
  },
);

updatesRouter.post("/:id/publish", async (c) => {
  const tenantId = c.get("tenantId") as string;
  const userRole = c.get("userRole");
  const id = c.req.param("id");

  if (!UPDATES_WRITE_ROLES.includes(userRole)) {
    return c.json(
      { error: "Insufficient permissions to manage investor updates" },
      403,
    );
  }

  try {
    const existing = await prisma.investor_updates.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!existing) {
      return c.json({ error: "Update not found" }, 404);
    }

    const update = await prisma.investor_updates.update({
      where: { id, tenant_id: tenantId },
      data: {
        status: "published",
        published_at: new Date(),
        updated_at: new Date(),
      },
    });

    return c.json({ data: update });
  } catch (error) {
    console.error("Error publishing investor update:", error);
    return c.json({ error: "Failed to publish update" }, 500);
  }
});

updatesRouter.delete("/:id", async (c) => {
  const tenantId = c.get("tenantId") as string;
  const userRole = c.get("userRole");
  const id = c.req.param("id");

  if (!UPDATES_WRITE_ROLES.includes(userRole)) {
    return c.json(
      { error: "Insufficient permissions to manage investor updates" },
      403,
    );
  }

  try {
    const existing = await prisma.investor_updates.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!existing) {
      return c.json({ error: "Update not found" }, 404);
    }

    await prisma.investor_updates.delete({
      where: { id, tenant_id: tenantId },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting investor update:", error);
    return c.json({ error: "Failed to delete update" }, 500);
  }
});
