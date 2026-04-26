-- Tabla para solicitudes DS-160
CREATE TABLE public.ds160_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  edit_token UUID NOT NULL DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  purpose_of_trip TEXT NULL,
  embassy TEXT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  current_step INTEGER NOT NULL DEFAULT 1,
  submitted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices útiles
CREATE INDEX idx_ds160_user_id ON public.ds160_applications(user_id);
CREATE INDEX idx_ds160_status ON public.ds160_applications(status);
CREATE INDEX idx_ds160_email ON public.ds160_applications(email);
CREATE INDEX idx_ds160_created_at ON public.ds160_applications(created_at DESC);

-- Validación
CREATE OR REPLACE FUNCTION public.validate_ds160()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('draft','submitted','in_review','completed','rejected') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  IF NEW.current_step < 1 OR NEW.current_step > 2 THEN
    RAISE EXCEPTION 'current_step must be between 1 and 2';
  END IF;
  IF length(trim(NEW.email)) = 0 THEN
    RAISE EXCEPTION 'email cannot be empty';
  END IF;
  IF length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'email too long';
  END IF;
  IF length(NEW.full_name) > 200 THEN
    RAISE EXCEPTION 'full_name too long';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_ds160
BEFORE INSERT OR UPDATE ON public.ds160_applications
FOR EACH ROW EXECUTE FUNCTION public.validate_ds160();

-- Trigger updated_at
CREATE TRIGGER trg_ds160_updated_at
BEFORE UPDATE ON public.ds160_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.ds160_applications ENABLE ROW LEVEL SECURITY;

-- Cualquiera (incluso anónimo) puede crear borrador
CREATE POLICY "Cualquiera crea solicitud DS-160"
ON public.ds160_applications
FOR INSERT
TO public
WITH CHECK (status IN ('draft','submitted'));

-- Usuarios ven sus propias solicitudes
CREATE POLICY "Usuarios ven sus solicitudes DS-160"
ON public.ds160_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuarios actualizan sus propias solicitudes (mientras estén en borrador o enviadas)
CREATE POLICY "Usuarios actualizan sus solicitudes DS-160"
ON public.ds160_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status IN ('draft','submitted'))
WITH CHECK (auth.uid() = user_id AND status IN ('draft','submitted'));

-- Admins ven todas
CREATE POLICY "Admins ven todas las solicitudes DS-160"
ON public.ds160_applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins gestionan todas
CREATE POLICY "Admins gestionan solicitudes DS-160"
ON public.ds160_applications
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Función security definer para que invitados puedan actualizar con edit_token
CREATE OR REPLACE FUNCTION public.update_ds160_with_token(
  _id UUID,
  _edit_token UUID,
  _form_data JSONB,
  _current_step INTEGER,
  _status TEXT,
  _email TEXT,
  _full_name TEXT,
  _purpose_of_trip TEXT,
  _embassy TEXT
)
RETURNS public.ds160_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.ds160_applications;
BEGIN
  IF _status NOT IN ('draft','submitted') THEN
    RAISE EXCEPTION 'invalid status for token update';
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
    AND status IN ('draft','submitted')
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'application not found or not editable';
  END IF;

  RETURN result;
END;
$$;

-- Función para que invitados puedan releer su borrador con token
CREATE OR REPLACE FUNCTION public.get_ds160_with_token(
  _id UUID,
  _edit_token UUID
)
RETURNS public.ds160_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.ds160_applications;
BEGIN
  SELECT * INTO result
  FROM public.ds160_applications
  WHERE id = _id AND edit_token = _edit_token;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'application not found';
  END IF;

  RETURN result;
END;
$$;