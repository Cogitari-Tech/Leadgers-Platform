-- Migration: add WITH CHECK to UPDATE policies (SEC — tenant re-parenting)
-- The 20260417000001_security_hardening.sql UPDATE policies had USING but no
-- WITH CHECK, so a row's tenant_id could be reassigned to another tenant on
-- UPDATE. Recreate them with a matching WITH CHECK. (Applied migrations are
-- immutable, so this is a forward fix rather than an edit to that file.)

-- health_scores
DROP POLICY IF EXISTS "Users can update own tenant health_scores"
  ON public.health_scores;
CREATE POLICY "Users can update own tenant health_scores"
  ON public.health_scores
  FOR UPDATE
  USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

-- north_star_metrics
DROP POLICY IF EXISTS "Users can update own tenant north_star_metrics"
  ON public.north_star_metrics;
CREATE POLICY "Users can update own tenant north_star_metrics"
  ON public.north_star_metrics
  FOR UPDATE
  USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);
