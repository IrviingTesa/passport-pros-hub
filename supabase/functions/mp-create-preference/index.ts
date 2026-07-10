// Crea una preferencia de Mercado Pago para el pago de una solicitud DS-160.
// Endpoint público: se invoca con application_id + edit_token.
//
// Variables de entorno (secrets del backend de Lovable Cloud):
//   MP_MODE                 -> "test" | "production" (default: "test")
//   MP_ACCESS_TOKEN_TEST    -> Access Token de Mercado Pago en modo prueba
//   MP_ACCESS_TOKEN_PROD    -> Access Token de Mercado Pago en modo producción
//   MP_ACCESS_TOKEN         -> Fallback (compatibilidad con la config anterior)
//   ALLOWED_ORIGINS         -> Lista separada por coma con los orígenes permitidos por CORS.
//                              Ej: "https://miapp.com,https://www.miapp.com,http://localhost:8080"
//                              Si está vacío se permite cualquier origen ("*").
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MP_MODE = (Deno.env.get("MP_MODE") ?? "test").toLowerCase();
const MP_ACCESS_TOKEN =
  (MP_MODE === "production"
    ? Deno.env.get("MP_ACCESS_TOKEN_PROD")
    : Deno.env.get("MP_ACCESS_TOKEN_TEST")) ??
  Deno.env.get("MP_ACCESS_TOKEN") ??
  "";

const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const BASE_PRICE = 600;
const ADDON_PRICE = 200;

function buildCors(origin: string | null) {
  const allow =
    ALLOWED_ORIGINS.length === 0
      ? "*"
      : origin && ALLOWED_ORIGINS.includes(origin)
        ? origin
        : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const cors = buildCors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    if (!MP_ACCESS_TOKEN) {
      return json({ error: "Mercado Pago no está configurado (falta MP_ACCESS_TOKEN)" }, 500, cors);
    }

    const body = await req.json();
    const { application_id, edit_token, addon_live_advisory, success_url } = body ?? {};
    if (!application_id || !edit_token) {
      return json({ error: "application_id y edit_token son obligatorios" }, 400, cors);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: app, error: appErr } = await admin
      .from("ds160_applications")
      .select("id, email, full_name, edit_token")
      .eq("id", application_id)
      .eq("edit_token", edit_token)
      .maybeSingle();
    if (appErr || !app) return json({ error: "Solicitud no encontrada" }, 404, cors);

    const amount = BASE_PRICE + (addon_live_advisory ? ADDON_PRICE : 0);

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
    if (payErr) return json({ error: payErr.message }, 500, cors);

    const origin = req.headers.get("origin") ?? success_url ?? "https://example.com";
    const returnBase = success_url || `${origin}/ds160?id=${application_id}&token=${edit_token}`;

    const preferenceBody = {
      items: [
        {
          id: payment.id,
          title: addon_live_advisory ? "Trámite DS-160 + Asesoría en vivo" : "Trámite DS-160",
          description: "Pre-registro DS-160 visa americana",
          quantity: 1,
          currency_id: "MXN",
          unit_price: amount,
        },
      ],
      payer: app.email ? { email: app.email, name: app.full_name ?? undefined } : undefined,
      external_reference: payment.id,
      metadata: { payment_id: payment.id, application_id, mp_mode: MP_MODE },
      back_urls: { success: returnBase, failure: returnBase, pending: returnBase },
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
      return json({ error: "No se pudo crear la preferencia", details: mpData }, 500, cors);
    }

    await admin
      .from("ds160_payments")
      .update({ mp_preference_id: mpData.id })
      .eq("id", payment.id);

    await admin
      .from("ds160_applications")
      .update({ payment_status: "pending" })
      .eq("id", application_id);

    return json(
      {
        payment_id: payment.id,
        preference_id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        amount,
        mp_mode: MP_MODE,
      },
      200,
      cors,
    );
  } catch (err) {
    console.error(err);
    return json({ error: (err as Error).message }, 500, cors);
  }
});

function json(obj: unknown, status = 200, cors: Record<string, string> = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
