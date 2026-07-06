import { z } from "zod";

// ─── Shared Constraints ──────────────────────────────────
const MAX_TEXT_LENGTH = 10_000;
const MAX_SHORT_TEXT = 500;
const MAX_ARRAY_ITEMS = 100;

const safeString = (max = MAX_SHORT_TEXT) => z.string().min(1).max(max).trim();

const safeText = (max = MAX_TEXT_LENGTH) => z.string().max(max).trim();

const safeUuid = () => z.string().uuid();

// ─── BMC Strict Schema (was z.any()) ─────────────────────

const bmcItemSchema = z.object({
  id: z.string().max(100).optional(),
  text: z.string().max(1000).trim(),
  color: z.string().max(20).optional(),
});

const bmcArrayField = z.array(bmcItemSchema).max(MAX_ARRAY_ITEMS).default([]);

// ─── OKRs ────────────────────────────────────────────────

export const createOkrSchema = z.object({
  title: safeString(300),
  description: safeText(2000).optional(),
  target_date: z.string().datetime({ offset: true }).or(safeString()),
  key_results: z
    .array(
      z.object({
        title: safeString(300),
        target_val: z.number().positive().max(1_000_000_000),
        unit: safeString(50),
        weight: z.number().positive().max(100).default(1),
      }),
    )
    .min(1, "At least one key result is required")
    .max(20),
});

export const updateKeyResultSchema = z.object({
  current_val: z.number().nonnegative().max(1_000_000_000),
});

// ─── Milestones ──────────────────────────────────────────

export const createMilestoneSchema = z.object({
  title: safeString(300),
  description: safeText(2000).optional(),
  target_date: z.string().max(100).optional(),
  status: z
    .enum(["planned", "in_progress", "completed", "cancelled"])
    .default("planned"),
  category: z
    .enum([
      "product",
      "engineering",
      "legal",
      "finance",
      "operations",
      "marketing",
    ])
    .default("product"),
  linked_okr_id: safeUuid().optional().nullable(),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

// ─── North Star ──────────────────────────────────────────

export const createNorthStarSchema = z.object({
  name: safeString(200),
  target_value: z.number().max(1_000_000_000_000).optional(),
  current_value: z.number().max(1_000_000_000_000).optional(),
  unit: safeString(50).optional(),
});

// ─── BMC ─────────────────────────────────────────────────

export const updateBmcSchema = z.object({
  key_partners: bmcArrayField.optional(),
  key_activities: bmcArrayField.optional(),
  key_resources: bmcArrayField.optional(),
  value_props: bmcArrayField.optional(),
  customer_rels: bmcArrayField.optional(),
  channels: bmcArrayField.optional(),
  customer_segs: bmcArrayField.optional(),
  cost_structure: bmcArrayField.optional(),
  revenue_streams: bmcArrayField.optional(),
});

// ─── Sales Deals ─────────────────────────────────────────

export const createDealSchema = z.object({
  title: safeString(300),
  client_name: safeString(200).optional(),
  value: z.number().nonnegative().max(1_000_000_000_000).default(0),
  mrr_amount: z.number().nonnegative().max(1_000_000_000).optional().nullable(),
  stage: z
    .enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"])
    .default("lead"),
  expected_close_date: z.string().max(100).optional().nullable(),
  probability: z.number().min(0).max(100).default(0),
  type: z.enum(["new_business", "upsell", "renewal"]).default("new_business"),
  recurrence: z.enum(["one_time", "monthly", "annual"]).default("one_time"),
  notes: safeText(5000).optional().nullable(),
});

export const updateDealSchema = createDealSchema.partial();

export const createMrrSnapshotSchema = z.object({
  month_date: safeString(100),
  total_mrr: z.number().nonnegative().max(1_000_000_000_000).default(0),
  total_arr: z.number().nonnegative().max(1_000_000_000_000).default(0),
  new_mrr: z.number().nonnegative().max(1_000_000_000_000).default(0),
  expansion_mrr: z.number().nonnegative().max(1_000_000_000_000).default(0),
  churn_mrr: z.number().nonnegative().max(1_000_000_000_000).default(0),
  contraction_mrr: z.number().nonnegative().max(1_000_000_000_000).default(0),
});

// ─── Product Roadmap ─────────────────────────────────────

export const createRoadmapSchema = z.object({
  title: safeString(300),
  description: safeText(2000).optional().nullable(),
  status: z
    .enum(["planned", "in_progress", "completed", "cancelled"])
    .default("planned"),
  quarter: safeString(10).optional(),
  github_issue_id: z.string().max(100).optional().nullable(),
  github_issue_url: z.string().url().max(500).optional().nullable(),
  key_result_id: safeUuid().optional().nullable(),
  milestone_id: safeUuid().optional().nullable(),
  start_date: z.string().max(100).optional().nullable(),
  end_date: z.string().max(100).optional().nullable(),
});

export const updateRoadmapSchema = createRoadmapSchema.partial();

// ─── People Headcount ────────────────────────────────────

export const createHeadcountSchema = z.object({
  role_title: safeString(200),
  department: safeString(100),
  monthly_salary: z.number().nonnegative().max(1_000_000).optional(),
  expected_start_date: safeString(100),
  status: z
    .enum(["planned", "approved", "hiring", "hired", "cancelled"])
    .default("planned"),
  notes: safeText(2000).optional(),
});

export const updateHeadcountSchema = createHeadcountSchema.partial();

// ─── Cap Table ───────────────────────────────────────────

export const createRoundSchema = z.object({
  name: safeString(200),
  round_date: safeString(100),
  pre_money_valuation: z.number().nonnegative().max(1_000_000_000_000),
  amount_raised: z.number().nonnegative().max(1_000_000_000_000),
  share_price: z.number().positive().max(1_000_000),
  shares_issued: z.number().int().positive().max(1_000_000_000),
  investor_names: z.array(safeString(200)).max(50).optional(),
  notes: safeText(2000).optional().nullable(),
});

export const createShareholderSchema = z.object({
  name: safeString(200),
  type: z.enum(["founder", "investor", "employee", "advisor", "other"]),
  shares: z.number().int().nonnegative().max(1_000_000_000),
  share_class: safeString(50).optional().default("common"),
  investment_amount: z.number().nonnegative().max(1_000_000_000_000).optional(),
  vesting_start_date: z.string().max(100).optional().nullable(),
  vesting_months: z.number().int().min(0).max(120).optional(),
  cliff_months: z.number().int().min(0).max(48).optional(),
  notes: safeText(2000).optional().nullable(),
});

// ─── AI Config ───────────────────────────────────────────

export const updateAiConfigSchema = z.object({
  proactivity_level: z.enum(["low", "medium", "high"]).optional(),
  tone: z.enum(["professional", "casual", "technical"]).optional(),
  insight_focus: z
    .array(z.enum(["finance", "burn_rate", "growth", "team", "product"]))
    .max(10)
    .optional(),
});

// ─── Param Validators ────────────────────────────────────

export const uuidParamSchema = z.object({
  id: safeUuid(),
});
