
-- =========================================================
-- 1) service_categories
-- =========================================================
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.service_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_categories TO authenticated;
GRANT ALL ON public.service_categories TO service_role;

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.service_categories;
CREATE POLICY "Anyone can view active categories"
  ON public.service_categories FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage categories" ON public.service_categories;
CREATE POLICY "Admins manage categories"
  ON public.service_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_service_categories_updated_at ON public.service_categories;
CREATE TRIGGER trg_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing category texts
INSERT INTO public.service_categories (name, slug, display_order)
SELECT
  category,
  lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g')),
  0
FROM (
  SELECT DISTINCT category FROM public.services
  WHERE category IS NOT NULL AND length(trim(category)) > 0
) s
ON CONFLICT (name) DO NOTHING;

-- Add category_id FK on services
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL;

UPDATE public.services s
SET category_id = c.id
FROM public.service_categories c
WHERE s.category_id IS NULL AND c.name = s.category;

CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);

-- =========================================================
-- 2) site_settings (singleton row)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number text,
  phone_number text,
  contact_email text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  youtube_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;
CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed singleton
INSERT INTO public.site_settings (whatsapp_number, contact_email)
SELECT NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- =========================================================
-- 3) ds160_resources (shared resources, e.g. "Preguntas posibles" PDF)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ds160_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  storage_path text,
  file_name text,
  mime_type text,
  size_bytes bigint,
  is_active boolean NOT NULL DEFAULT true,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ds160_resources TO authenticated;
GRANT ALL ON public.ds160_resources TO service_role;

ALTER TABLE public.ds160_resources ENABLE ROW LEVEL SECURITY;

-- Admin & staff can read all resources metadata
DROP POLICY IF EXISTS "Staff and admin read resources" ON public.ds160_resources;
CREATE POLICY "Staff and admin read resources"
  ON public.ds160_resources FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'secretary')
  );

-- Admin manage
DROP POLICY IF EXISTS "Admins manage resources" ON public.ds160_resources;
CREATE POLICY "Admins manage resources"
  ON public.ds160_resources FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_ds160_resources_updated_at ON public.ds160_resources;
CREATE TRIGGER trg_ds160_resources_updated_at
  BEFORE UPDATE ON public.ds160_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the canonical "preguntas posibles" entry
INSERT INTO public.ds160_resources (slug, title, description)
VALUES ('preguntas-posibles', 'Preguntas posibles en la entrevista', 'Documento PDF con las preguntas más comunes en la entrevista de visa americana.')
ON CONFLICT (slug) DO NOTHING;
