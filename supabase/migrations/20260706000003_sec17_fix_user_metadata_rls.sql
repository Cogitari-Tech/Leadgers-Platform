-- SEC-17: RLS policies on investor_updates, data_room_documents,
-- data_room_shares and data_room_access_logs derived tenant_id from
-- auth.jwt() -> 'user_metadata', which end users can edit via
-- supabase.auth.updateUser(). Any user could set user_metadata.tenant_id to a
-- victim tenant and read/write its data cross-tenant (advisor 0015, ERROR x10).
-- Fix: tenant scope comes from tenant_members via a SECURITY DEFINER helper,
-- and the policies apply to authenticated only instead of public.

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

-- investor_updates
DROP POLICY IF EXISTS "Users can only see updates from their tenant" ON public.investor_updates;
DROP POLICY IF EXISTS "Users can insert updates for their tenant" ON public.investor_updates;
DROP POLICY IF EXISTS "Users can update updates from their tenant" ON public.investor_updates;

CREATE POLICY "iu_select_tenant" ON public.investor_updates
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

CREATE POLICY "iu_insert_tenant" ON public.investor_updates
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

CREATE POLICY "iu_update_tenant" ON public.investor_updates
  FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT public.get_my_active_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

-- data_room_documents
DROP POLICY IF EXISTS "Users can only see documents from their tenant" ON public.data_room_documents;
DROP POLICY IF EXISTS "Users can insert documents for their tenant" ON public.data_room_documents;
DROP POLICY IF EXISTS "Users can delete documents from their tenant" ON public.data_room_documents;

CREATE POLICY "drd_select_tenant" ON public.data_room_documents
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

CREATE POLICY "drd_insert_tenant" ON public.data_room_documents
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

CREATE POLICY "drd_delete_tenant" ON public.data_room_documents
  FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

-- data_room_shares
DROP POLICY IF EXISTS "Users can see shares from their tenant" ON public.data_room_shares;
DROP POLICY IF EXISTS "Users can create shares for their tenant" ON public.data_room_shares;

CREATE POLICY "drs_select_tenant" ON public.data_room_shares
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

CREATE POLICY "drs_insert_tenant" ON public.data_room_shares
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT public.get_my_active_tenant_ids()));

-- data_room_access_logs
DROP POLICY IF EXISTS "Users can see logs from their tenant" ON public.data_room_access_logs;

CREATE POLICY "dral_select_tenant" ON public.data_room_access_logs
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT public.get_my_active_tenant_ids()));
