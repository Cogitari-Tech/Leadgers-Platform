-- Hardening follow-up (advisors 0011/0028/0029):
-- 1. Drop cleanup_test_user: SECURITY DEFINER helper that deletes auth users,
--    callable by anon in production. Test cleanup belongs to non-prod only
--    (client call is gated by VITE_ENABLE_TEST_CLEANUP and wrapped in
--    try/catch, so dropping it is safe).
-- 2. Trigger functions need no EXECUTE grant for API roles.
-- 3. Session-only RPCs lose anon EXECUTE (check_invite_token keeps anon: the
--    accept-invite page validates tokens before login; check_rate_limit keeps
--    anon: used to throttle pre-auth endpoints).
-- 4. Pin search_path on functions flagged mutable.

DROP FUNCTION IF EXISTS public.cleanup_test_user(text);

-- Trigger functions: API roles must not call them directly
REVOKE ALL ON FUNCTION public.enforce_owner_constraint() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_role_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trigger_auto_create_finding() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_audit_programs_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_user_preferences() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_registration() FROM PUBLIC, anon, authenticated;

-- RPCs that require a session. Revoking only anon is ineffective while the
-- default PUBLIC EXECUTE grant remains (anon inherits via PUBLIC), so revoke
-- PUBLIC and grant back the roles that need each RPC.
REVOKE ALL ON FUNCTION public.complete_onboarding(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_permission(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_tenant_ids() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.redeem_invite_link(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.complete_onboarding(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_permission(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_tenant_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.redeem_invite_link(text) TO authenticated, service_role;

-- Pin search_path (advisor 0011)
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.create_user_preferences() SET search_path = 'public';
