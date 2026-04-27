import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP
    const fwd = req.headers.get("x-forwarded-for") ?? "";
    const ip = fwd.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "";

    let region: string | null = null;
    let country: string | null = null;
    let city: string | null = null;

    if (ip) {
      try {
        const geo = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: { "User-Agent": "lovable-app" },
        });
        if (geo.ok) {
          const data = await geo.json();
          country = data.country_code ?? null;
          region = data.region ?? null;
          city = data.city ?? null;
        }
      } catch (_) {
        // ignore geo errors
      }
    }

    // Hash IP (one-way) for soft de-duplication without storing PII
    let ipHash: string | null = null;
    if (ip) {
      const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(ip + (Deno.env.get("SUPABASE_JWKS") ?? "salt")),
      );
      ipHash = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Soft dedupe: same ip_hash within last 30 minutes = ignore
    if (ipHash) {
      const { data: recent } = await supabase
        .from("page_visits")
        .select("id")
        .eq("ip_hash", ipHash)
        .gte("visited_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
        .limit(1)
        .maybeSingle();
      if (recent) {
        return new Response(JSON.stringify({ ok: true, deduped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    await supabase.from("page_visits").insert({
      region,
      country,
      city,
      ip_hash: ipHash,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("track-visit error", e);
    return new Response(JSON.stringify({ ok: false }), {
      status: 200, // never block client
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
