-- north_star_metrics table backing apps/api/src/routes/strategic/north-star.ts
-- and the Prisma model of the same name. Never had its own migration —
-- discovered as a gap while backfilling prod (20260417000001_security_hardening
-- enables RLS on this table but it was never created).
CREATE TABLE IF NOT EXISTS public.north_star_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_value NUMERIC(10, 2) NOT NULL,
  current_value NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_north_star_metrics_tenant ON public.north_star_metrics(tenant_id);
