-- Migration: Security Hardening (RLS + search_path)
-- SEC-03: RLS for health_scores and north_star_metrics
-- SEC-05: search_path for specific db functions

-- 1. Enable RLS
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.north_star_metrics ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for health_scores
CREATE POLICY "Users can view own tenant health_scores" ON public.health_scores
  FOR SELECT USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

CREATE POLICY "Users can insert own tenant health_scores" ON public.health_scores
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

CREATE POLICY "Users can update own tenant health_scores" ON public.health_scores
  FOR UPDATE USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

CREATE POLICY "Users can delete own tenant health_scores" ON public.health_scores
  FOR DELETE USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

-- 3. Create Policies for north_star_metrics
CREATE POLICY "Users can view own tenant north_star_metrics" ON public.north_star_metrics
  FOR SELECT USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

CREATE POLICY "Users can insert own tenant north_star_metrics" ON public.north_star_metrics
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

CREATE POLICY "Users can update own tenant north_star_metrics" ON public.north_star_metrics
  FOR UPDATE USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

CREATE POLICY "Users can delete own tenant north_star_metrics" ON public.north_star_metrics
  FOR DELETE USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

-- 4. Fix search_paths for potentially vulnerable functions
-- Explicitly setting search path prevents function hijacking and schema injection
ALTER FUNCTION public.complete_onboarding SET search_path = 'public';
ALTER FUNCTION public.handle_new_user_registration SET search_path = 'public';
ALTER FUNCTION public.check_rate_limit SET search_path = 'public';
ALTER FUNCTION public.check_invite_token SET search_path = 'public';
