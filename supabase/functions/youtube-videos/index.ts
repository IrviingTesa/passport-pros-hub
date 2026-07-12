// Edge Function: youtube-videos
// Devuelve los últimos videos activos desde la tabla `youtube_videos_cache`.
// No llama a la YouTube API — eso lo hace `youtube-sync` (cron semanal + botón manual).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [{ data: channel }, { data: rows }] = await Promise.all([
      supabase
        .from("video_channels")
        .select("youtube_channel_url, last_synced_at, last_sync_error")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("youtube_videos_cache")
        .select("video_id, title, thumbnail_url, published_at, youtube_url")
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(10),
    ]);

    const videos = (rows ?? []).map((v) => ({
      videoId: v.video_id,
      title: v.title,
      publishedAt: v.published_at,
      thumbnail: v.thumbnail_url ?? "",
      url: v.youtube_url ?? `https://www.youtube.com/watch?v=${v.video_id}`,
    }));

    return new Response(
      JSON.stringify({
        videos,
        channelUrl: channel?.youtube_channel_url ?? null,
        lastSyncedAt: channel?.last_synced_at ?? null,
        error: channel?.last_sync_error ?? undefined,
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
