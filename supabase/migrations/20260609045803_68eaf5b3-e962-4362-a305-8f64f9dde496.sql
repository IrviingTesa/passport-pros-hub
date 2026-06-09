
-- Drop overly broad public SELECT policies on storage.objects.
-- Public buckets still serve files via getPublicUrl without RLS.
DROP POLICY IF EXISTS "Fotos de staff públicas" ON storage.objects;
DROP POLICY IF EXISTS "Fotos de reseñas son públicas" ON storage.objects;

-- Revoke EXECUTE on internal SECURITY DEFINER helpers from public roles.
-- These are used by RLS/triggers, not meant to be called via the API.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.secretary_has_active_edit_permission(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_ds160() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_review() FROM PUBLIC, anon, authenticated;

-- The token-based DS-160 helpers must remain callable by anonymous clients
-- because they implement secure token verification themselves.
GRANT EXECUTE ON FUNCTION public.get_ds160_with_token(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_ds160_with_token(uuid, uuid, jsonb, integer, text, text, text, text, text) TO anon, authenticated;
