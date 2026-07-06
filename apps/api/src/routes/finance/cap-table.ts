import { Hono } from "hono";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../../middleware/auth";
import { tenancyMiddleware } from "../../middleware/tenancy";
import { AppEnv } from "../../types/env";

// --- Type definitions ---

interface VestingScheduleInput {
  start_date?: string;
  cliff_months?: number;
  duration_months?: number;
}

interface CalculatedVesting {
  vested: number;
  unvested: number;
  percentage: number;
}

/**
 * Calculates vested/unvested shares based on a vesting schedule.
 * Handles cliff periods, linear vesting, and edge cases.
 */
export function calculateVesting(
  totalShares: number,
  schedule: VestingScheduleInput | null,
): CalculatedVesting {
  if (!totalShares || totalShares <= 0) {
    return { vested: 0, unvested: 0, percentage: 0 };
  }

  if (
    !schedule ||
    !schedule.start_date ||
    !schedule.duration_months ||
    schedule.duration_months <= 0
  ) {
    return { vested: totalShares, unvested: 0, percentage: 100 };
  }

  const startDate = new Date(schedule.start_date);
  if (isNaN(startDate.getTime())) {
    return { vested: totalShares, unvested: 0, percentage: 100 };
  }

  const now = new Date();
  const monthsElapsed =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    now.getMonth() -
    startDate.getMonth();

  const cliff = schedule.cliff_months || 0;

  // Before cliff: nothing vested
  if (monthsElapsed < cliff) {
    return { vested: 0, unvested: totalShares, percentage: 0 };
  }

  // Past full duration: everything vested
  if (monthsElapsed >= schedule.duration_months) {
    return { vested: totalShares, unvested: 0, percentage: 100 };
  }

  // Linear vesting between cliff and duration
  const vested = Math.floor(
    (totalShares / schedule.duration_months) * monthsElapsed,
  );
  const unvested = totalShares - vested;
  const percentage = Math.round((vested / totalShares) * 100);

  return { vested, unvested, percentage };
}

/**
 * Validates vesting schedule input.
 * Returns null if valid, or an error message string.
 */
function validateVestingSchedule(
  schedule: VestingScheduleInput | null | undefined,
): string | null {
  if (!schedule) return null; // optional field

  const hasAnyField =
    schedule.start_date || schedule.cliff_months || schedule.duration_months;
  if (!hasAnyField) return null; // empty object = no vesting

  if (schedule.start_date && isNaN(new Date(schedule.start_date).getTime())) {
    return "Invalid vesting start_date format";
  }

  if (
    schedule.duration_months !== undefined &&
    schedule.duration_months !== null
  ) {
    if (schedule.duration_months <= 0) {
      return "duration_months must be greater than 0";
    }
  }

  if (schedule.cliff_months !== undefined && schedule.cliff_months !== null) {
    if (schedule.cliff_months < 0) {
      return "cliff_months cannot be negative";
    }
    if (
      schedule.duration_months &&
      schedule.cliff_months >= schedule.duration_months
    ) {
      return "cliff_months must be less than duration_months";
    }
  }

  // If we have cliff or duration, start_date is required
  if (
    (schedule.cliff_months || schedule.duration_months) &&
    !schedule.start_date
  ) {
    return "start_date is required when cliff or duration is specified";
  }

  return null;
}

const capTableRoutes = new Hono<AppEnv>();

capTableRoutes.use("*", authMiddleware);
capTableRoutes.use("*", tenancyMiddleware);

// --- ROUNDS ---

capTableRoutes.get("/rounds", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const rounds = await prisma.cap_table_rounds.findMany({
      where: { tenant_id: tenantId },
      orderBy: { round_date: "asc" },
    });
    return c.json(rounds);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    return c.json({ error: "Failed to fetch rounds" }, 500);
  }
});

capTableRoutes.post("/rounds", async (c) => {
  const tenantId = c.get("tenantId");
  const user = c.get("user");

  try {
    const body = await c.req.json();

    const round = await prisma.cap_table_rounds.create({
      data: {
        tenant_id: tenantId as string,
        round_name: body.round_name,
        round_type: body.round_type,
        pre_money_valuation: body.pre_money_valuation,
        amount_raised: body.amount_raised,
        post_money_valuation: body.post_money_valuation,
        round_date: body.round_date ? new Date(body.round_date) : null,
        notes: body.notes,
        created_by: user?.id,
      },
    });

    return c.json(round, 201);
  } catch (error) {
    console.error("Error creating round:", error);
    return c.json({ error: "Failed to create round" }, 500);
  }
});

capTableRoutes.delete("/rounds/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");

  try {
    await prisma.cap_table_rounds.delete({
      where: { id, tenant_id: tenantId as string },
    });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting round:", error);
    return c.json({ error: "Failed to delete round" }, 500);
  }
});

// --- SHAREHOLDERS ---

capTableRoutes.get("/shareholders", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const shareholders = await prisma.cap_table_shareholders.findMany({
      where: { tenant_id: tenantId },
      orderBy: { ownership_percentage: "desc" },
    });

    const enrichedShareholders = shareholders.map((s: any) => {
      const schedule =
        typeof s.vesting_schedule === "object" && s.vesting_schedule !== null
          ? (s.vesting_schedule as VestingScheduleInput)
          : null;

      const totalShares = Number(s.shares_count);
      const vesting = calculateVesting(totalShares, schedule);

      return {
        ...s,
        calculated_vesting: vesting,
      };
    });

    return c.json(enrichedShareholders);
  } catch (error) {
    console.error("Error fetching shareholders:", error);
    return c.json({ error: "Failed to fetch shareholders" }, 500);
  }
});

capTableRoutes.post("/shareholders", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const body = await c.req.json();

    // Validate vesting schedule if provided
    const vestingError = validateVestingSchedule(body.vesting_schedule);
    if (vestingError) {
      return c.json({ error: vestingError }, 400);
    }

    const shareholder = await prisma.cap_table_shareholders.create({
      data: {
        tenant_id: tenantId as string,
        round_id: body.round_id,
        shareholder_name: body.shareholder_name,
        shareholder_type: body.shareholder_type,
        shares_count: body.shares_count,
        share_price: body.share_price,
        ownership_percentage: body.ownership_percentage,
        investment_amount: body.investment_amount,
        vesting_schedule: body.vesting_schedule,
        notes: body.notes,
      },
    });

    return c.json(shareholder, 201);
  } catch (error) {
    console.error("Error adding shareholder:", error);
    return c.json({ error: "Failed to add shareholder" }, 500);
  }
});

capTableRoutes.delete("/shareholders/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");

  try {
    await prisma.cap_table_shareholders.delete({
      where: { id, tenant_id: tenantId as string },
    });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting shareholder:", error);
    return c.json({ error: "Failed to delete shareholder" }, 500);
  }
});

// --- SUMMARY ---

capTableRoutes.get("/summary", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const [rounds, shareholders] = await Promise.all([
      prisma.cap_table_rounds.findMany({
        where: { tenant_id: tenantId },
        orderBy: { round_date: "asc" },
      }),
      prisma.cap_table_shareholders.findMany({
        where: { tenant_id: tenantId },
      }),
    ]);

    const totalShares = shareholders.reduce(
      (sum: number, s: any) => sum + Number(s.shares_count),
      0,
    );
    const totalInvested = rounds.reduce(
      (sum: number, r: any) => sum + Number(r.amount_raised),
      0,
    );
    const latestValuation =
      rounds.length > 0
        ? Number(rounds[rounds.length - 1].post_money_valuation)
        : 0;

    return c.json({
      totalShares,
      totalInvested,
      latestValuation,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return c.json({ error: "Failed to fetch summary" }, 500);
  }
});

export default capTableRoutes;
