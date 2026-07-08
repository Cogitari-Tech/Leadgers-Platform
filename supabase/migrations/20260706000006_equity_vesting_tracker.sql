-- Equity & Vesting Tracker (PRD §7.6, SDD-003) — Fase 1 Must-have.
-- esop_pools: one pool per tenant (RN-06). equity_grants: immutable grant
-- history with cliff/vesting/acceleration parameters (RN-01..07). Vesting math
-- lives in the domain layer (packages/core EquityGrant), not in SQL.

-- Helper may not exist on environments that skipped 20260706000003 (beta has
-- no data room tables, so that migration was not applied there).
CREATE OR REPLACE FUNCTION public.get_my_active_tenant_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT tenant_id FROM public.tenant_members
  WHERE user_id = auth.uid() AND status = 'active';
$function$;

REVOKE ALL ON FUNCTION public.get_my_active_tenant_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_active_tenant_ids() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_active_tenant_ids() TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.esop_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  total_options numeric NOT NULL CHECK (total_options > 0),
  pool_percentage numeric CHECK (pool_percentage > 0 AND pool_percentage <= 100),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.equity_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  beneficiary_name text NOT NULL,
  beneficiary_email text,
  options_total numeric NOT NULL CHECK (options_total > 0),
  grant_date date NOT NULL,
  cliff_months integer NOT NULL DEFAULT 12 CHECK (cliff_months >= 0),
  vesting_months integer NOT NULL DEFAULT 48 CHECK (vesting_months > 0),
  grant_price numeric NOT NULL DEFAULT 0 CHECK (grant_price >= 0),
  acceleration text NOT NULL DEFAULT 'none'
    CHECK (acceleration IN ('none', 'single_trigger', 'double_trigger')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'terminated', 'exercised', 'cancelled')),
  terminated_at timestamptz,
  exercise_window_days integer NOT NULL DEFAULT 90 CHECK (exercise_window_days >= 0),
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (cliff_months <= vesting_months)
);

CREATE INDEX IF NOT EXISTS idx_equity_grants_tenant ON public.equity_grants (tenant_id);
CREATE INDEX IF NOT EXISTS idx_equity_grants_tenant_status
  ON public.equity_grants (tenant_id, status);

DROP TRIGGER IF EXISTS trg_esop_pools_updated_at ON public.esop_pools;
CREATE TRIGGER trg_esop_pools_updated_at
  BEFORE UPDATE ON public.esop_pools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_equity_grants_updated_at ON public.equity_grants;
CREATE TRIGGER trg_equity_grants_updated_at
  BEFORE UPDATE ON public.equity_grants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.esop_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_grants ENABLE ROW LEVEL SECURITY;

-- Members read; owner/admin write (grants manage the company's ESOP).
CREATE POLICY "ep_select_tenant" ON public.esop_pools
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

CREATE POLICY "ep_write_tenant_admins" ON public.esop_pools
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

CREATE POLICY "eg_select_tenant" ON public.equity_grants
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

CREATE POLICY "eg_write_tenant_admins" ON public.equity_grants
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

-- service_role bypasses RLS; Hono API (Prisma) enforces tenancy middleware.
