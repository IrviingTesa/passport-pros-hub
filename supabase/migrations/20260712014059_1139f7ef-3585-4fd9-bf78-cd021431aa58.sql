
-- 1. Columnas de papelera
ALTER TABLE public.ds160_applications
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS previous_status text;

CREATE INDEX IF NOT EXISTS idx_ds160_applications_deleted_at
  ON public.ds160_applications(deleted_at);

-- 2. Los usuarios finales no ven sus solicitudes en la papelera
DROP POLICY IF EXISTS "Usuarios ven sus solicitudes DS-160" ON public.ds160_applications;
CREATE POLICY "Usuarios ven sus solicitudes DS-160"
ON public.ds160_applications
FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Los usuarios no pueden actualizar sus solicitudes eliminadas
DROP POLICY IF EXISTS "Usuarios actualizan sus solicitudes DS-160" ON public.ds160_applications;
CREATE POLICY "Usuarios actualizan sus solicitudes DS-160"
ON public.ds160_applications
FOR UPDATE
USING (
  auth.uid() = user_id
  AND deleted_at IS NULL
  AND status = ANY (ARRAY['draft'::text, 'submitted'::text])
)
WITH CHECK (
  auth.uid() = user_id
  AND deleted_at IS NULL
  AND status = ANY (ARRAY['draft'::text, 'submitted'::text])
);

-- 3. El acceso por token de edición no aplica a solicitudes eliminadas
CREATE OR REPLACE FUNCTION public.get_ds160_with_token(_id uuid, _edit_token uuid)
RETURNS public.ds160_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result public.ds160_applications;
BEGIN
  SELECT * INTO result
  FROM public.ds160_applications
  WHERE id = _id
    AND edit_token = _edit_token
    AND deleted_at IS NULL;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'application not found';
  END IF;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_ds160_with_token(
  _id uuid, _edit_token uuid, _form_data jsonb, _current_step integer,
  _status text, _email text, _full_name text, _purpose_of_trip text, _embassy text
)
RETURNS public.ds160_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result public.ds160_applications;
BEGIN
  IF _status NOT IN ('draft','submitted') THEN
    RAISE EXCEPTION 'invalid status for token update';
  END IF;
  IF _current_step < 1 OR _current_step > 5 THEN
    RAISE EXCEPTION 'current_step must be between 1 and 5';
  END IF;

  UPDATE public.ds160_applications
  SET
    form_data = _form_data,
    current_step = _current_step,
    status = _status,
    email = _email,
    full_name = _full_name,
    purpose_of_trip = _purpose_of_trip,
    embassy = _embassy,
    submitted_at = CASE WHEN _status = 'submitted' AND submitted_at IS NULL THEN now() ELSE submitted_at END
  WHERE id = _id
    AND edit_token = _edit_token
    AND deleted_at IS NULL
    AND status IN ('draft','submitted')
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'application not found or not editable';
  END IF;

  RETURN result;
END;
$function$;

-- 4. Función para restaurar (admin/secretaria autorizada)
CREATE OR REPLACE FUNCTION public.restore_ds160(_id uuid)
RETURNS public.ds160_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result public.ds160_applications;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (public.has_role(auth.uid(), 'secretary'::app_role)
        AND public.secretary_has_active_edit_permission(auth.uid()))
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.ds160_applications
  SET
    deleted_at = NULL,
    deleted_by = NULL,
    status = COALESCE(previous_status, 'submitted'),
    previous_status = NULL
  WHERE id = _id AND deleted_at IS NOT NULL
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'application not found in trash';
  END IF;

  RETURN result;
END;
$function$;

-- 5. Función para enviar a papelera (guarda status anterior)
CREATE OR REPLACE FUNCTION public.soft_delete_ds160(_id uuid)
RETURNS public.ds160_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result public.ds160_applications;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (public.has_role(auth.uid(), 'secretary'::app_role)
        AND public.secretary_has_active_edit_permission(auth.uid()))
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.ds160_applications
  SET
    previous_status = status,
    deleted_at = now(),
    deleted_by = auth.uid()
  WHERE id = _id AND deleted_at IS NULL
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'application not found';
  END IF;

  RETURN result;
END;
$function$;

-- 6. Función para borrado definitivo (solo admin)
CREATE OR REPLACE FUNCTION public.hard_delete_ds160(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  DELETE FROM public.ds160_applications
  WHERE id = _id AND deleted_at IS NOT NULL;
END;
$function$;
