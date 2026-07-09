// Edge Function: youtube-videos
// Devuelve los últimos videos del canal configurado.
// Fase 1: sirve desde la tabla youtube_videos_cache y sincroniza automáticamente
// cuando la caché tiene más de 7 días o cuando se pide sync=1 (admin).
// La API Key de YouTube nunca sale al frontend.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface YTSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: {
      medium?: { url: string };
      high?: { url: string };
      default?: { url: string };
    };
  };
}

async function resolveChannelId(
  input: string,
  apiKey: string,
): Promise<string | null> {
  const clean = input.trim();
  if (clean.startsWith("UC") && clean.length >= 20) return clean;
  const handle = clean.startsWith("@") ? clean : `@${clean}`;
  const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  return json.items?.[0]?.id ?? null;
}

async function syncFromYouTube(
  supabase: ReturnType<typeof createClient>,
  channelInput: string,
  apiKey: string,
): Promise<{ count: number; error?: string }> {
  const channelId = await resolveChannelId(channelInput, apiKey);
  if (!channelId) return { count: 0, error: "No se pudo resolver el canal" };

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10&type=video`;
  const res = await fetch(searchUrl);
  if (!res.ok) {
    const errText = await res.text();
    console.error("YouTube API error:", errText);
    return { count: 0, error: `YouTube API ${res.status}` };
  }
  const json = await res.json();
  const items: YTSearchItem[] = json.items ?? [];
  if (items.length === 0) return { count: 0, error: "Sin resultados" };

  const rows = items.map((it) => ({
    video_id: it.id.videoId,
    title: it.snippet.title,
    youtube_url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
    thumbnail_url:
      it.snippet.thumbnails.high?.url ??
      it.snippet.thumbnails.medium?.url ??
      it.snippet.thumbnails.default?.url ??
      "",
    published_at: it.snippet.publishedAt,
    is_active: true,
    synced_at: new Date().toISOString(),
  }));

  // Upsert por video_id: no borra los anteriores si falla, sólo refresca los nuevos.
  const { error: upErr } = await supabase
    .from("youtube_videos_cache")
    .upsert(rows, { onConflict: "video_id" });
  if (upErr) return { count: 0, error: upErr.message };

  return { count: rows.length };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    let forceSync = url.searchParams.get("sync") === "1";
    if (!forceSync && req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.sync === true) forceSync = true;
      } catch {
        // ignore
      }
    }

    const { data: config } = await supabase
      .from("video_channels")
      .select("youtube_channel_id, youtube_channel_url, last_synced_at")
      .limit(1)
      .maybeSingle();

    const channelInput = config?.youtube_channel_id as string | undefined;
    const channelUrl = (config?.youtube_channel_url as string | null) ?? null;
    const lastSyncedAt = config?.last_synced_at as string | null | undefined;

    // ¿Necesita sincronizar?
    const stale =
      !lastSyncedAt || Date.now() - new Date(lastSyncedAt).getTime() > WEEK_MS;
    const shouldSync = forceSync || stale;

    let syncError: string | undefined;
    let syncedCount = 0;

    if (shouldSync && channelInput) {
      const apiKey = Deno.env.get("YOUTUBE_API_KEY");
      if (!apiKey) {
        syncError = "YOUTUBE_API_KEY no configurada";
      } else {
        const result = await syncFromYouTube(supabase, channelInput, apiKey);
        syncedCount = result.count;
        syncError = result.error;
        // Actualiza marca de última sincronización (aunque haya error, dejamos el error registrado).
        await supabase
          .from("video_channels")
          .update({
            last_synced_at: result.count > 0 ? new Date().toISOString() : lastSyncedAt,
            last_sync_error: result.error ?? null,
          })
          .not("id", "is", null);
      }
    }

    // Sirve SIEMPRE desde caché (aunque la sync haya fallado no borramos nada).
    const { data: cached } = await supabase
      .from("youtube_videos_cache")
      .select("video_id, title, youtube_url, thumbnail_url, published_at")
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(10);

    const videos = (cached ?? []).map((v: Record<string, unknown>) => ({
      videoId: v.video_id,
      title: v.title,
      publishedAt: v.published_at,
      thumbnail: v.thumbnail_url,
      url: v.youtube_url,
    }));

    return new Response(
      JSON.stringify({
        videos,
        channelUrl,
        lastSyncedAt,
        synced: shouldSync,
        syncedCount,
        syncError: syncError ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("youtube-videos error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ videos: [], channelUrl: null, error: message }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
