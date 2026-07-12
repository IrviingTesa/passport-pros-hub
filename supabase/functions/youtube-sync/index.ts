// Edge Function: youtube-sync
// Sincroniza los últimos videos del canal configurado en `video_channels` hacia `youtube_videos_cache`.
// Se dispara semanalmente desde pg_cron y manualmente desde el panel admin.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const finish = async (
    ok: boolean,
    payload: Record<string, unknown>,
    error?: string,
    channelId?: string,
  ) => {
    if (channelId) {
      await supabase
        .from("video_channels")
        .update({
          last_synced_at: ok ? new Date().toISOString() : undefined,
          last_sync_error: ok ? null : (error ?? "sync failed"),
        })
        .eq("id", channelId);
    }
    return new Response(JSON.stringify({ ok, ...payload }), {
      status: ok ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  };

  try {
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return await finish(false, {}, "YOUTUBE_API_KEY no configurada");
    }

    const { data: channel } = await supabase
      .from("video_channels")
      .select("id, youtube_channel_id, youtube_channel_url")
      .limit(1)
      .maybeSingle();

    if (!channel?.youtube_channel_id) {
      return await finish(false, {}, "Canal de YouTube no configurado", channel?.id);
    }

    const channelId = await resolveChannelId(channel.youtube_channel_id, apiKey);
    if (!channelId) {
      return await finish(false, {}, "No se pudo resolver el canal", channel.id);
    }

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10&type=video`;
    const ytRes = await fetch(searchUrl);
    if (!ytRes.ok) {
      const errText = await ytRes.text();
      console.error("YouTube API error:", errText);
      return await finish(false, {}, `YouTube API ${ytRes.status}`, channel.id);
    }

    const ytJson: { items?: YTSearchItem[] } = await ytRes.json();
    const items = ytJson.items ?? [];

    // Marcamos todos como inactivos y luego upsert de los nuevos activos.
    await supabase
      .from("youtube_videos_cache")
      .update({ is_active: false })
      .neq("video_id", "___never___");

    const rows = items.map((item) => ({
      video_id: item.id.videoId,
      title: item.snippet.title,
      published_at: item.snippet.publishedAt,
      thumbnail_url:
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        null,
      youtube_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      is_active: true,
      synced_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error: upErr } = await supabase
        .from("youtube_videos_cache")
        .upsert(rows, { onConflict: "video_id" });
      if (upErr) {
        return await finish(false, {}, upErr.message, channel.id);
      }
    }

    return await finish(true, { synced: rows.length }, undefined, channel.id);
  } catch (err) {
    console.error("youtube-sync error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return await finish(false, {}, message);
  }
});
