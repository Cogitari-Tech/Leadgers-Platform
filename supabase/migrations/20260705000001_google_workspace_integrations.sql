-- Migration: google_workspace_integrations table + RLS
-- Backs GoogleWorkspaceConnect.tsx, which queried this table before it existed
-- in a tracked migration (RLS was therefore unverifiable). One integration
-- row per tenant; access is scoped to the caller's tenant via app_metadata.

CREATE TABLE IF NOT EXISTS public.google_workspace_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  connected_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  google_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT google_workspace_integrations_tenant_unique UNIQUE (tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_google_workspace_integrations_tenant
  ON public.google_workspace_integrations (tenant_id);

ALTER TABLE public.google_workspace_integrations ENABLE ROW LEVEL SECURITY;

-- Tenant-scoped policies. UPDATE/INSERT carry WITH CHECK so a row cannot be
-- created or re-parented into another tenant.
CREATE POLICY "Users can view own tenant google_workspace_integrations"
  ON public.google_workspace_integrations
  FOR SELECT
  USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

CREATE POLICY "Users can insert own tenant google_workspace_integrations"
  ON public.google_workspace_integrations
  FOR INSERT
  WITH CHECK (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

CREATE POLICY "Users can update own tenant google_workspace_integrations"
  ON public.google_workspace_integrations
  FOR UPDATE
  USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);

CREATE POLICY "Users can delete own tenant google_workspace_integrations"
  ON public.google_workspace_integrations
  FOR DELETE
  USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);
