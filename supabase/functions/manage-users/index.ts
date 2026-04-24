// Edge Function: manage-users
// Solo admins pueden invocarla. Permite:
//   - list: listar todos los usuarios con sus roles y perfil
//   - create: crear usuario (email + password + nombre + rol)
//   - update_role: cambiar el rol de un usuario
//   - delete: eliminar usuario
//
// Verifica el JWT del invocador y comprueba el rol admin antes de actuar.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Action =
  | { type: "list" }
  | {
      type: "create";
      email: string;
      password: string;
      full_name: string;
      role: "admin" | "secretary";
    }
  | { type: "update_role"; user_id: string; role: "admin" | "secretary" }
  | { type: "delete"; user_id: string };

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 255;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Cliente con el JWT del invocador para identificarlo
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Sesión inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cliente admin (service role) para operaciones privilegiadas
    const admin = createClient(supabaseUrl, serviceKey);

    // Verificar rol admin
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(
        JSON.stringify({ error: "Solo administradores pueden hacer esto" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body: Action = await req.json();

    switch (body.type) {
      case "list": {
        const { data: users, error: listErr } =
          await admin.auth.admin.listUsers({ perPage: 200 });
        if (listErr) throw listErr;
        const ids = users.users.map((u) => u.id);
        const [{ data: profiles }, { data: roles }] = await Promise.all([
          admin.from("profiles").select("id, full_name, email").in("id", ids),
          admin.from("user_roles").select("user_id, role").in("user_id", ids),
        ]);
        const result = users.users.map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          full_name:
            profiles?.find((p) => p.id === u.id)?.full_name ?? null,
          roles: roles?.filter((r) => r.user_id === u.id).map((r) => r.role) ?? [],
        }));
        return new Response(JSON.stringify({ users: result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create": {
        if (!isValidEmail(body.email))
          return new Response(JSON.stringify({ error: "Email inválido" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        if (!body.password || body.password.length < 8)
          return new Response(
            JSON.stringify({ error: "Contraseña mínima 8 caracteres" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        if (!body.full_name || body.full_name.trim().length < 2)
          return new Response(JSON.stringify({ error: "Nombre requerido" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        if (body.role !== "admin" && body.role !== "secretary")
          return new Response(JSON.stringify({ error: "Rol inválido" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });

        const { data: created, error: createErr } =
          await admin.auth.admin.createUser({
            email: body.email,
            password: body.password,
            email_confirm: true,
            user_metadata: { full_name: body.full_name.trim() },
          });
        if (createErr) throw createErr;

        await admin
          .from("user_roles")
          .insert({ user_id: created.user.id, role: body.role });

        return new Response(
          JSON.stringify({ ok: true, user_id: created.user.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "update_role": {
        if (body.role !== "admin" && body.role !== "secretary")
          return new Response(JSON.stringify({ error: "Rol inválido" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        // Reemplazar todos los roles del usuario por el nuevo
        await admin.from("user_roles").delete().eq("user_id", body.user_id);
        const { error: insErr } = await admin
          .from("user_roles")
          .insert({ user_id: body.user_id, role: body.role });
        if (insErr) throw insErr;
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        if (body.user_id === user.id)
          return new Response(
            JSON.stringify({ error: "No puedes eliminar tu propia cuenta" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        const { error: delErr } = await admin.auth.admin.deleteUser(body.user_id);
        if (delErr) throw delErr;
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Acción desconocida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("manage-users error:", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
