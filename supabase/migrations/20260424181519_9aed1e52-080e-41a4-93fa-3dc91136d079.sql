
-- Tabla única de configuración de videos (siempre habrá UN solo registro)
CREATE TABLE public.video_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- YouTube
  youtube_channel_id TEXT, -- ej: UCxxxxxxxxxxxxxxxxxx (canal ID) o @handle
  youtube_channel_url TEXT, -- URL pública del canal para "Ver más"
  -- TikTok (manual, hasta 10 links)
  tiktok_profile_url TEXT, -- URL pública del perfil para "Ver más"
  tiktok_video_urls JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de strings con URLs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Función para mantener updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_video_channels_updated_at
BEFORE UPDATE ON public.video_channels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.video_channels ENABLE ROW LEVEL SECURITY;

-- Lectura pública: cualquiera ve la configuración (los videos son contenido público)
CREATE POLICY "video_channels son públicos para lectura"
ON public.video_channels
FOR SELECT
USING (true);

-- Por ahora NO hay policy de INSERT/UPDATE/DELETE — solo el service_role
-- (desde edge functions o panel admin) podrá modificarla. En la Fase 3
-- agregaremos políticas basadas en el rol "admin".

-- Insertamos el registro inicial vacío para que siempre exista
INSERT INTO public.video_channels (youtube_channel_id, youtube_channel_url, tiktok_profile_url, tiktok_video_urls)
VALUES (NULL, NULL, NULL, '[]'::jsonb);
