
-- 1) Wipe current public staff rows (user opted to recreate from internal accounts)
DELETE FROM public.staff;

-- 2) Link staff (public profile) to an internal account (optional, unique)
ALTER TABLE public.staff
  ADD COLUMN user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3) Internal passwords storage (admin-viewable). Locked down: only service_role.
CREATE TABLE public.internal_passwords (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  password text NOT NULL,
  is_stale boolean NOT NULL DEFAULT false,
  set_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  set_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only service_role can touch this. No grants to anon/authenticated.
GRANT ALL ON public.internal_passwords TO service_role;
ALTER TABLE public.internal_passwords ENABLE ROW LEVEL SECURITY;
-- No policies = no client access. Edge function uses service_role and bypasses RLS.

-- 4) Audit log for password access (view / edit / reset / create)
CREATE TABLE public.password_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_email text,
  action text NOT NULL CHECK (action IN ('view','edit','reset','create')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.password_access_log TO authenticated;
GRANT ALL ON public.password_access_log TO service_role;
ALTER TABLE public.password_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view password access log"
ON public.password_access_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
