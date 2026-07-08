-- MRR/ARR Tracker backend (PRD: MRR/ARR Tracker Must — sales module).
-- One snapshot per tenant per month. total_arr is stored denormalized
-- (12 × total_mrr) so the existing MrrDashboard reads it directly.

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

CREATE INDEX IF NOT EXISTS idx_mrr_snapshots_tenant_month
  ON public.mrr_snapshots (tenant_id, month_date);

DROP TRIGGER IF EXISTS trg_mrr_snapshots_updated_at ON public.mrr_snapshots;
CREATE TRIGGER trg_mrr_snapshots_updated_at
  BEFORE UPDATE ON public.mrr_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.mrr_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mrr_select_tenant" ON public.mrr_snapshots
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

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
