// Entrega el PDF de "Preguntas posibles" correcto (primera vez / renovación)
// a un solicitante DS-160 cuyo pago ya fue aprobado.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { application_id, edit_token } = await req.json();
    if (!application_id || !edit_token) {
      return json({ error: "Datos incompletos" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: app, error: appErr } = await admin
      .from("ds160_applications")
      .select("id, edit_token, form_data")
      .eq("id", application_id)
      .maybeSingle();

    if (appErr) throw appErr;
    if (!app || app.edit_token !== edit_token) {
      return json({ error: "Solicitud no encontrada" }, 404);
    }

    const { data: payment } = await admin
      .from("ds160_payments")
      .select("status")
      .eq("application_id", application_id)
      .eq("status", "approved")
      .maybeSingle();

    if (!payment) return json({ error: "El pago aún no está aprobado" }, 403);

    const formData = (app.form_data ?? {}) as Record<string, unknown>;
    const isRenewal = formData.is_renewal === "yes";
    const slug = isRenewal
      ? "preguntas-posibles-renovacion"
      : "preguntas-posibles";

    const { data: resource } = await admin
      .from("ds160_resources")
      .select("storage_path, file_name, title")
      .eq("slug", slug)
      .maybeSingle();

    if (!resource?.storage_path) {
      return json({ error: "El documento aún no está disponible. Contáctanos por WhatsApp." }, 404);
    }

    const { data: signed, error: signErr } = await admin.storage
      .from("ds160-resources")
      .createSignedUrl(resource.storage_path, 600, {
        download: resource.file_name ?? "preguntas-posibles.pdf",
      });

    if (signErr || !signed) throw signErr ?? new Error("No se pudo firmar la URL");

    return json({
      url: signed.signedUrl,
      file_name: resource.file_name,
      title: resource.title,
      kind: isRenewal ? "renovacion" : "primera_vez",
    });
  } catch (err) {
    console.error("ds160-resource-download error", err);
    return json({ error: "Error interno" }, 500);
  }
});
