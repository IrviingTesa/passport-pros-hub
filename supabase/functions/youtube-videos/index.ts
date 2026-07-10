// Edge Function: youtube-videos
// Devuelve los últimos N videos del canal de YouTube configurado en la tabla video_channels.
// Cachea en memoria 1 hora para no agotar la cuota de la YouTube Data API v3.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora
let cache: { at: number; data: unknown } | null = null;

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

interface YTChannelsResponse {
  items?: Array<{ id: string }>;
}

interface YTSearchResponse {
  items?: YTSearchItem[];
}

/**
 * Resuelve el channelId real (UC...) a partir de un input que puede ser:
 *  - Un channel ID (empieza con "UC")
 *  - Un handle (@usuario)
 *  - Un nombre de usuario legacy
 */
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
  const json: YTChannelsResponse = await res.json();
  return json.items?.[0]?.id ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Cache hit
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      return new Response(JSON.stringify(cache.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          videos: [],
          channelUrl: null,
          error: "YOUTUBE_API_KEY no configurada",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: config } = await supabase
      .from("video_channels")
      .select("youtube_channel_id, youtube_channel_url")
      .limit(1)
      .maybeSingle();

    const channelInput = config?.youtube_channel_id;
    if (!channelInput) {
      const payload = { videos: [], channelUrl: config?.youtube_channel_url ?? null };
      cache = { at: Date.now(), data: payload };
      return new Response(JSON.stringify(payload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const channelId = await resolveChannelId(channelInput, apiKey);
    if (!channelId) {
      return new Response(
        JSON.stringify({
          videos: [],
          channelUrl: config?.youtube_channel_url ?? null,
          error: "No se pudo resolver el canal",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10&type=video`;
    const ytRes = await fetch(searchUrl);
    if (!ytRes.ok) {
      const errText = await ytRes.text();
      console.error("YouTube API error:", errText);
      return new Response(
        JSON.stringify({
          videos: [],
          channelUrl: config?.youtube_channel_url ?? null,
          error: `YouTube API ${ytRes.status}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const ytJson: YTSearchResponse = await ytRes.json();
    const videos = (ytJson.items ?? []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnail:
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        "",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    const payload = {
      videos,
      channelUrl:
        config?.youtube_channel_url ??
        `https://www.youtube.com/channel/${channelId}`,
    };
    cache = { at: Date.now(), data: payload };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
