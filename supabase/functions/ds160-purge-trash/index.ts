import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);
    const cutoffIso = cutoff.toISOString();

    const { data: toPurge, error: selErr } = await supabase
      .from("ds160_applications")
      .select("id, full_name, deleted_at")
      .not("deleted_at", "is", null)
      .lt("deleted_at", cutoffIso);

    if (selErr) throw selErr;

    const ids = (toPurge ?? []).map((r) => r.id);
    let deleted = 0;
    if (ids.length > 0) {
      const { error: delErr, count } = await supabase
        .from("ds160_applications")
        .delete({ count: "exact" })
        .in("id", ids);
      if (delErr) throw delErr;
      deleted = count ?? ids.length;
    }

    console.log(`[ds160-purge-trash] cutoff=${cutoffIso} purged=${deleted}`);

    return new Response(
      JSON.stringify({ ok: true, cutoff: cutoffIso, purged: deleted, ids }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[ds160-purge-trash] error", e);
    return new Response(
      JSON.stringify({ ok: false, error: String((e as Error).message ?? e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
