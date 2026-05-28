import { z } from "zod";

// ─── Cap Table ───────────────────────────────────────────

export const createRoundSchema = z.object({
  round_name: z.string().min(1, "Round name is required").max(200),
  round_type: z.string().max(50).optional(),
  pre_money_valuation: z.number().nonnegative().optional(),
  amount_raised: z.number().nonnegative(),
  post_money_valuation: z.number().nonnegative().optional(),
  round_date: z.string().datetime().or(z.string().date()).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const createShareholderSchema = z.object({
  round_id: z.string().uuid().optional().nullable(),
  shareholder_name: z.string().min(1, "Shareholder name is required").max(200),
  shareholder_type: z.enum([
    "founder",
    "investor",
    "employee",
    "advisor",
    "other",
  ]),
  shares_count: z.number().nonnegative(),
  share_price: z.number().nonnegative().optional(),
  ownership_percentage: z.number().min(0).max(100).optional(),
  investment_amount: z.number().nonnegative().optional(),
  vesting_schedule: z
    .object({
      start_date: z.string().datetime().or(z.string().date()).optional(),
      cliff_months: z.number().int().min(0).max(120).optional(),
      duration_months: z.number().int().min(1).max(120).optional(),
    })
    .optional()
    .nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// ─── Runway & Projections ────────────────────────────────

export const runwayProjectionSchema = z.object({
  cashBalance: z.number().nonnegative().optional().default(100000),
  projectionMonths: z.number().int().min(1).max(60).optional().default(24),
  scenarios: z
    .array(
      z.object({
        label: z.string().max(100),
        revenueGrowthRate: z.number().min(-1).max(10),
        costReductionRate: z.number().min(-1).max(1),
        color: z
          .string()
          .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          .optional(),
      }),
    )
    .optional(),
});

// ─── Burn Rate ───────────────────────────────────────────

export const burnRateQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).optional().default(6),
});
