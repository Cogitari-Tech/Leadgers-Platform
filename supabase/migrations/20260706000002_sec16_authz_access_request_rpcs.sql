-- SEC-16: approve_access_request / reject_access_request were SECURITY DEFINER
-- with no authorization check and EXECUTE granted to anon. Combined with the
-- permissive ar_insert_own policy, any user could self-approve into any tenant
-- (tenant takeover). Fix: require the caller to be an active owner/admin of the
-- request's tenant, block owner-role grants through this path, and revoke
-- anon/PUBLIC execute.

CREATE OR REPLACE FUNCTION public.approve_access_request(p_request_id uuid, p_role_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_request RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_request FROM public.access_requests WHERE id = p_request_id AND status = 'pending';

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada ou já processada.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    JOIN public.roles r ON tm.role_id = r.id
    WHERE tm.user_id = auth.uid()
      AND tm.tenant_id = v_request.tenant_id
      AND tm.status = 'active'
      AND r.name IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Sem permissão para aprovar solicitações deste tenant.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.roles WHERE id = p_role_id AND name = 'owner') THEN
    RAISE EXCEPTION 'O papel de owner não pode ser concedido via aprovação de solicitação.';
  END IF;

  -- Create tenant member
  INSERT INTO public.tenant_members (tenant_id, user_id, role_id, status)
  VALUES (v_request.tenant_id, v_request.user_id, p_role_id, 'active')
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role_id = p_role_id, status = 'active';

  -- Update request status
  UPDATE public.access_requests
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = NOW()
  WHERE id = p_request_id;

  -- Update user's app_metadata with tenant_id
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('tenant_id', v_request.tenant_id)
  WHERE id = v_request.user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reject_access_request(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_request RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_request FROM public.access_requests WHERE id = p_request_id AND status = 'pending';

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada ou já processada.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    JOIN public.roles r ON tm.role_id = r.id
    WHERE tm.user_id = auth.uid()
      AND tm.tenant_id = v_request.tenant_id
      AND tm.status = 'active'
      AND r.name IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Sem permissão para rejeitar solicitações deste tenant.';
  END IF;

  UPDATE public.access_requests
  SET status = 'rejected', reviewed_by = auth.uid(), reviewed_at = NOW()
  WHERE id = p_request_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.approve_access_request(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_access_request(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.approve_access_request(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.reject_access_request(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_access_request(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.reject_access_request(uuid) TO authenticated, service_role;
