-- Fase 1: caché de videos de YouTube
CREATE TABLE public.youtube_videos_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL UNIQUE,
  title text NOT NULL,
  youtube_url text NOT NULL,
  thumbnail_url text NOT NULL,
  published_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.youtube_videos_cache TO anon, authenticated;
GRANT ALL ON public.youtube_videos_cache TO service_role;

ALTER TABLE public.youtube_videos_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active cached videos"
  ON public.youtube_videos_cache FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage cached videos"
  ON public.youtube_videos_cache FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_youtube_videos_cache_updated_at
  BEFORE UPDATE ON public.youtube_videos_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_youtube_videos_cache_published ON public.youtube_videos_cache (published_at DESC);

-- Marca de última sincronización en video_channels
ALTER TABLE public.video_channels
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_sync_error text;

-- Habilitar pg_cron y pg_net para ejecución semanal
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
