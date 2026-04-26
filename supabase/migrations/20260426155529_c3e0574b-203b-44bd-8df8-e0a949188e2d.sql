-- Tabla de reseñas
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  photo_url TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  service_related TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Validación de rango y status mediante trigger (no CHECK con funciones mutables)
CREATE OR REPLACE FUNCTION public.validate_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;
  IF NEW.status NOT IN ('pending','approved','rejected') THEN
    RAISE EXCEPTION 'status must be pending, approved or rejected';
  END IF;
  IF length(trim(NEW.client_name)) = 0 THEN
    RAISE EXCEPTION 'client_name cannot be empty';
  END IF;
  IF length(trim(NEW.comment)) = 0 THEN
    RAISE EXCEPTION 'comment cannot be empty';
  END IF;
  IF length(NEW.client_name) > 100 THEN
    RAISE EXCEPTION 'client_name too long (max 100)';
  END IF;
  IF length(NEW.comment) > 1000 THEN
    RAISE EXCEPTION 'comment too long (max 1000)';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_review_trigger
BEFORE INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_review();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Lectura pública sólo de reseñas aprobadas y activas
CREATE POLICY "Reseñas aprobadas son públicas"
ON public.reviews
FOR SELECT
TO public
USING (status = 'approved' AND is_active = true);

-- Cualquiera (incluso anónimo) puede crear, pero forzando status='pending' y is_active=true
CREATE POLICY "Cualquiera puede enviar reseña"
ON public.reviews
FOR INSERT
TO public
WITH CHECK (status = 'pending' AND is_active = true);

-- Admins ven todas
CREATE POLICY "Admins ven todas las reseñas"
ON public.reviews
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins gestionan todo
CREATE POLICY "Admins gestionan reseñas"
ON public.reviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bucket público para fotos de reseñas
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública del bucket
CREATE POLICY "Fotos de reseñas son públicas"
ON storage.objects
FOR SELECT
USING (bucket_id = 'review-photos');

-- Sólo admins suben fotos
CREATE POLICY "Admins suben fotos de reseñas"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins actualizan fotos de reseñas"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'review-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins borran fotos de reseñas"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'review-photos' AND public.has_role(auth.uid(), 'admin'));