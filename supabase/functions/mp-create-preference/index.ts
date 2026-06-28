// Create a Mercado Pago preference for a DS-160 application payment.
// Public: invoked by guests/owners with the application id + edit token.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const BASE_PRICE = 600;
const ADDON_PRICE = 200;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!MP_ACCESS_TOKEN) {
      return json({ error: "Mercado Pago no está configurado" }, 500);
    }

    const body = await req.json();
    const { application_id, edit_token, addon_live_advisory, success_url } = body ?? {};
    if (!application_id || !edit_token) {
      return json({ error: "application_id y edit_token son obligatorios" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Validate the application via token (service role bypasses RLS but we still
    // explicitly match edit_token to authorize the caller).
    const { data: app, error: appErr } = await admin
      .from("ds160_applications")
      .select("id, email, full_name, edit_token")
      .eq("id", application_id)
      .eq("edit_token", edit_token)
      .maybeSingle();
    if (appErr || !app) return json({ error: "Solicitud no encontrada" }, 404);

    const amount = BASE_PRICE + (addon_live_advisory ? ADDON_PRICE : 0);

    // Insert payment row (pending)
    const { data: payment, error: payErr } = await admin
      .from("ds160_payments")
      .insert({
        application_id,
        amount,
        addon_live_advisory: !!addon_live_advisory,
        status: "pending",
        payer_email: app.email,
      })
      .select()
      .single();
    if (payErr) return json({ error: payErr.message }, 500);

    const origin = req.headers.get("origin") ?? success_url ?? "https://example.com";
    const returnBase = success_url || `${origin}/ds160?id=${application_id}&token=${edit_token}`;

    const preferenceBody = {
      items: [
        {
          id: payment.id,
          title: addon_live_advisory
            ? "Trámite DS-160 + Asesoría en vivo"
            : "Trámite DS-160",
          description: "Pre-registro DS-160 visa americana",
          quantity: 1,
          currency_id: "MXN",
          unit_price: amount,
        },
      ],
      payer: app.email ? { email: app.email, name: app.full_name ?? undefined } : undefined,
      external_reference: payment.id,
      metadata: { payment_id: payment.id, application_id },
      back_urls: {
        success: returnBase,
        failure: returnBase,
        pending: returnBase,
      },
      auto_return: "approved",
      notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook`,
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceBody),
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      console.error("MP preference error", mpData);
      return json({ error: "No se pudo crear la preferencia", details: mpData }, 500);
    }

    await admin
      .from("ds160_payments")
      .update({ mp_preference_id: mpData.id })
      .eq("id", payment.id);

    await admin
      .from("ds160_applications")
      .update({ payment_status: "pending" })
      .eq("id", application_id);

    return json({
      payment_id: payment.id,
      preference_id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
      amount,
    });
  } catch (err) {
    console.error(err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
