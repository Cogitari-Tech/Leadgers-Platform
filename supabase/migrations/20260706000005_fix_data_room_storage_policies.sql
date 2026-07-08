-- data_room storage policies fix.
-- The SELECT policy from 20260404000000 was never applied in prod (it
-- referenced nonexistent cap_table_shareholders.user_id/email columns), so no
-- one could read data_room files through RLS. The INSERT/DELETE policies that
-- did apply checked auth.jwt()->>'role', which is always 'authenticated' in
-- Supabase JWTs — they never matched, so they were dead policies.
-- Fix: scope by the object path convention uploads/{tenant_id}/{file}
-- (apps/api/src/routes/investor/documents.ts) — members of the tenant can
-- read; owner/admin of the tenant can write/delete.

DROP POLICY IF EXISTS "Insert access restricted to admins" ON storage.objects;
DROP POLICY IF EXISTS "Delete access restricted to owner" ON storage.objects;

CREATE POLICY "data_room_select_tenant_members" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'data_room'
    AND (storage.foldername(name))[1] = 'uploads'
    AND (storage.foldername(name))[2] IN (
      SELECT tm.tenant_id::text
      FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

CREATE POLICY "data_room_insert_tenant_admins" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'data_room'
    AND (storage.foldername(name))[1] = 'uploads'
    AND (storage.foldername(name))[2] IN (
      SELECT tm.tenant_id::text
      FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.name IN ('owner', 'admin')
    )
  );

CREATE POLICY "data_room_delete_tenant_admins" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'data_room'
    AND (storage.foldername(name))[1] = 'uploads'
    AND (storage.foldername(name))[2] IN (
      SELECT tm.tenant_id::text
      FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.name IN ('owner', 'admin')
    )
  );
