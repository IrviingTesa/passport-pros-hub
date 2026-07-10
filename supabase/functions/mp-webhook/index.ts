// Webhook público de Mercado Pago. Recibe notificaciones y actualiza el pago.
//
// Variables de entorno (secrets del backend de Lovable Cloud):
//   MP_MODE                 -> "test" | "production" (default: "test")
//   MP_ACCESS_TOKEN_TEST    -> Access Token en modo prueba
//   MP_ACCESS_TOKEN_PROD    -> Access Token en modo producción
//   MP_ACCESS_TOKEN         -> Fallback
//
// URL pública de este webhook (configúrala en Mercado Pago Developers):
//   https://<PROJECT_REF>.supabase.co/functions/v1/mp-webhook
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

// El webhook lo llama Mercado Pago (server-to-server), no necesita CORS de navegador,
// pero devolvemos headers permisivos por si acaso hay pruebas manuales desde el browser.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    if (!MP_ACCESS_TOKEN) {
      console.error("MP_ACCESS_TOKEN no configurado para MP_MODE=", MP_MODE);
      return new Response("mp not configured", { status: 200, headers: CORS });
    }

    const url = new URL(req.url);
    const topic = url.searchParams.get("type") || url.searchParams.get("topic");
    let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // ignore
    }
    if (!paymentId && body?.data && typeof body.data === "object") {
      paymentId = String((body.data as { id?: string }).id ?? "");
    }

    if (!paymentId || (topic && topic !== "payment")) {
      return new Response("ignored", { status: 200, headers: CORS });
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    if (!mpRes.ok) {
      console.error("MP fetch failed", await mpRes.text());
      return new Response("mp error", { status: 200, headers: CORS });
    }
    const payment = await mpRes.json();

    const externalRef: string | undefined = payment.external_reference;
    if (!externalRef) {
      return new Response("no external_reference", { status: 200, headers: CORS });
    }

    const status: string = payment.status;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const update: Record<string, unknown> = {
      mp_payment_id: String(payment.id),
      status,
      raw_payload: payment,
      payer_email: payment.payer?.email ?? null,
    };
    if (status === "approved") update.paid_at = new Date().toISOString();

    const { data: payRow } = await admin
      .from("ds160_payments")
      .update(update)
      .eq("id", externalRef)
      .select("application_id")
      .single();

    if (payRow && status === "approved") {
      await admin
        .from("ds160_applications")
        .update({ payment_status: "paid" })
        .eq("id", payRow.application_id);
    }

    return new Response("ok", { status: 200, headers: CORS });
  } catch (err) {
    console.error(err);
    return new Response("error", { status: 200, headers: CORS });
  }
});
