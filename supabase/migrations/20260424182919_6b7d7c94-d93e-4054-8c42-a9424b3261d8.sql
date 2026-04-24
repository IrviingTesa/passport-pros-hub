
-- Servicios
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Servicios activos públicos"
ON public.services FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins ven todos los servicios"
ON public.services FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gestionan servicios"
ON public.services FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_services_active_order
ON public.services (is_active, display_order);

-- Personal del despacho (público en la landing)
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  whatsapp_number TEXT,
  email TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Personal activo público"
ON public.staff FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins ven todo el personal"
ON public.staff FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gestionan personal"
ON public.staff FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_staff_active_order
ON public.staff (is_active, display_order);

-- Storage bucket público para fotos del personal
INSERT INTO storage.buckets (id, name, public)
VALUES ('staff-photos', 'staff-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Fotos de staff públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'staff-photos');

CREATE POLICY "Admins suben fotos de staff"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'staff-photos'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins actualizan fotos de staff"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'staff-photos'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins eliminan fotos de staff"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'staff-photos'
  AND public.has_role(auth.uid(), 'admin')
);
