// Mercado Pago webhook receiver. Public endpoint (signature validation light).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("type") || url.searchParams.get("topic");
    let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");

    // MP also POSTs body — read it if present
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
      return new Response("ignored", { status: 200, headers: corsHeaders });
    }

    // Fetch full payment from MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    if (!mpRes.ok) {
      console.error("MP fetch failed", await mpRes.text());
      return new Response("mp error", { status: 200, headers: corsHeaders });
    }
    const payment = await mpRes.json();

    const externalRef: string | undefined = payment.external_reference;
    if (!externalRef) {
      return new Response("no external_reference", { status: 200, headers: corsHeaders });
    }

    const status: string = payment.status; // approved | pending | rejected | refunded | cancelled
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

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error(err);
    return new Response("error", { status: 200, headers: corsHeaders });
  }
});
