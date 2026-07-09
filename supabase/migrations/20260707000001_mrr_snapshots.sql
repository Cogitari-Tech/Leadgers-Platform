-- MRR/ARR Tracker backend (PRD: MRR/ARR Tracker Must — sales module).
-- One snapshot per tenant per month. total_arr is stored denormalized
-- (12 × total_mrr) so the existing MrrDashboard reads it directly.
--
-- Reconciling migration: prod already has an older mrr_snapshots table
-- (no notes/created_by, no defaults on total_mrr/total_arr, no unique
-- constraint, no CHECKs) and beta already has the new shape with the RLS
-- policies applied. Every statement below is idempotent so the same file
-- converges all three states (old prod, new beta, fresh envs).

CREATE TABLE IF NOT EXISTS public.mrr_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month_date date NOT NULL,
  total_mrr numeric NOT NULL DEFAULT 0 CHECK (total_mrr >= 0),
  total_arr numeric NOT NULL DEFAULT 0 CHECK (total_arr >= 0),
  new_mrr numeric NOT NULL DEFAULT 0 CHECK (new_mrr >= 0),
  expansion_mrr numeric NOT NULL DEFAULT 0 CHECK (expansion_mrr >= 0),
  churn_mrr numeric NOT NULL DEFAULT 0 CHECK (churn_mrr >= 0),
  contraction_mrr numeric NOT NULL DEFAULT 0 CHECK (contraction_mrr >= 0),
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, month_date)
);

-- Columns missing from the old prod shape.
ALTER TABLE public.mrr_snapshots ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.mrr_snapshots ADD COLUMN IF NOT EXISTS created_by uuid;

-- Defaults missing from the old prod shape.
ALTER TABLE public.mrr_snapshots ALTER COLUMN total_mrr SET DEFAULT 0;
ALTER TABLE public.mrr_snapshots ALTER COLUMN total_arr SET DEFAULT 0;

-- Constraints (Postgres has no ADD CONSTRAINT IF NOT EXISTS).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.mrr_snapshots'::regclass
      AND conname = 'mrr_snapshots_tenant_id_month_date_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.mrr_snapshots'::regclass
      AND contype = 'u'
  ) THEN
    ALTER TABLE public.mrr_snapshots
      ADD CONSTRAINT mrr_snapshots_tenant_id_month_date_key
      UNIQUE (tenant_id, month_date);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.mrr_snapshots'::regclass
      AND contype = 'f'
      AND confrelid = 'public.tenants'::regclass
  ) THEN
    ALTER TABLE public.mrr_snapshots
      ADD CONSTRAINT mrr_snapshots_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- Guard by name, not "any CHECK exists": an unrelated future CHECK on this
  -- table would otherwise silently skip adding the non-negative guard. Fresh
  -- envs get equivalent column-level CHECKs from CREATE TABLE above (named
  -- mrr_snapshots_<column>_check by Postgres), so both names are probed.
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.mrr_snapshots'::regclass
      AND conname = 'mrr_snapshots_amounts_nonnegative'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.mrr_snapshots'::regclass
      AND contype = 'c'
      AND conname LIKE 'mrr\_snapshots\_%\_check'
  ) THEN
    ALTER TABLE public.mrr_snapshots
      ADD CONSTRAINT mrr_snapshots_amounts_nonnegative
      CHECK (
        total_mrr >= 0 AND total_arr >= 0 AND new_mrr >= 0
        AND expansion_mrr >= 0 AND churn_mrr >= 0 AND contraction_mrr >= 0
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_mrr_snapshots_tenant_month
  ON public.mrr_snapshots (tenant_id, month_date);

DROP TRIGGER IF EXISTS trg_mrr_snapshots_updated_at ON public.mrr_snapshots;
CREATE TRIGGER trg_mrr_snapshots_updated_at
  BEFORE UPDATE ON public.mrr_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.mrr_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mrr_select_tenant" ON public.mrr_snapshots;
CREATE POLICY "mrr_select_tenant" ON public.mrr_snapshots
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

DROP POLICY IF EXISTS "mrr_write_tenant_admins" ON public.mrr_snapshots;
CREATE POLICY "mrr_write_tenant_admins" ON public.mrr_snapshots
  FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        AND r.name IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        AND r.name IN ('owner', 'admin')
    )
  );
