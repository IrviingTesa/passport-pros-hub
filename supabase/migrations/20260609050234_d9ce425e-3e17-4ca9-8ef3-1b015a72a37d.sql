
-- Restore EXECUTE for functions referenced inside RLS policies.
-- PostgreSQL requires the caller to hold EXECUTE on functions used in policies.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.secretary_has_active_edit_permission(uuid) TO authenticated;
