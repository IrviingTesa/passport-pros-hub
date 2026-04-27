-- =========================================
-- 1. PERMISOS DE EDICIÓN GLOBAL PARA SECRETARIA
-- =========================================
CREATE TABLE public.secretary_edit_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secretary_id UUID NOT NULL,
  granted_by UUID NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sec_perm_active ON public.secretary_edit_permissions(secretary_id, expires_at) WHERE revoked_at IS NULL;

ALTER TABLE public.secretary_edit_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gestionan permisos secretaria"
ON public.secretary_edit_permissions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Secretaria ve sus permisos"
ON public.secretary_edit_permissions FOR SELECT TO authenticated
USING (auth.uid() = secretary_id);

-- Función helper: ¿la secretaria tiene permiso global activo?
CREATE OR REPLACE FUNCTION public.secretary_has_active_edit_permission(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.secretary_edit_permissions
    WHERE secretary_id = _user_id
      AND revoked_at IS NULL
      AND expires_at > now()
  )
$$;

-- =========================================
-- 2. SOLICITUDES DE EDICIÓN
-- =========================================
CREATE TABLE public.ds160_edit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secretary_id UUID NOT NULL,
  reason TEXT,
  hours_requested INTEGER NOT NULL DEFAULT 24,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ds160_edit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins ven todas las solicitudes edicion"
ON public.ds160_edit_requests FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins actualizan solicitudes edicion"
ON public.ds160_edit_requests FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Secretaria crea sus solicitudes"
ON public.ds160_edit_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = secretary_id AND has_role(auth.uid(), 'secretary'::app_role));

CREATE POLICY "Secretaria ve sus solicitudes"
ON public.ds160_edit_requests FOR SELECT TO authenticated
USING (auth.uid() = secretary_id);

-- =========================================
-- 3. HISTORIAL DE ACCESOS A DS-160
-- =========================================
CREATE TABLE public.ds160_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ds160_id UUID NOT NULL,
  ds160_full_name TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ds160_access_user ON public.ds160_access_log(user_id, accessed_at DESC);

ALTER TABLE public.ds160_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios registran sus accesos"
ON public.ds160_access_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios ven sus accesos"
ON public.ds160_access_log FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins ven todos los accesos"
ON public.ds160_access_log FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- =========================================
-- 4. VISITAS A LA PÁGINA
-- =========================================
CREATE TABLE public.page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT,
  country TEXT,
  city TEXT,
  ip_hash TEXT,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_visits_month ON public.page_visits(visited_at DESC);
CREATE INDEX idx_page_visits_region ON public.page_visits(region, visited_at);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (la edge function usará service role pero por si acaso)
CREATE POLICY "Anyone can log visit"
ON public.page_visits FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins ven visitas"
ON public.page_visits FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- =========================================
-- 5. ACTUALIZAR POLÍTICA DE EDICIÓN DS-160
-- =========================================
-- Permitir que la secretaria edite cuando tenga permiso global activo
CREATE POLICY "Secretaria con permiso edita DS-160"
ON public.ds160_applications FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'secretary'::app_role) AND public.secretary_has_active_edit_permission(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'secretary'::app_role) AND public.secretary_has_active_edit_permission(auth.uid()));

-- Secretaria puede ver todos los DS-160 (solo lectura por defecto)
CREATE POLICY "Secretaria ve todos los DS-160"
ON public.ds160_applications FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'secretary'::app_role));

-- Secretaria puede aprobar reseñas (ya tiene SELECT vía rol, agregamos UPDATE)
CREATE POLICY "Secretaria aprueba reseñas"
ON public.reviews FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'secretary'::app_role))
WITH CHECK (has_role(auth.uid(), 'secretary'::app_role));

CREATE POLICY "Secretaria ve todas reseñas"
ON public.reviews FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'secretary'::app_role));