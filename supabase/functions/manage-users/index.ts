// Edge Function: manage-users
// Solo admins. Acciones:
//   - list
//   - create (con contraseña visible + ficha pública opcional)
//   - update_account (nombre, email, rol, activo/inactivo)
//   - delete
//   - reset_password (genera y guarda)
//   - set_password (admin define un valor específico)
//   - get_password (admin consulta la última contraseña conocida; queda registrado)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Role = "admin" | "secretary";

type Action =
  | { type: "list" }
  | {
      type: "create";
      email: string;
      password: string;
      full_name: string;
      role: Role;
    }
  | {
      type: "update_account";
      user_id: string;
      email?: string;
      full_name?: string;
      role?: Role;
      is_active?: boolean;
    }
  | { type: "delete"; user_id: string }
  | { type: "reset_password"; user_id: string }
  | { type: "set_password"; user_id: string; password: string }
  | { type: "get_password"; user_id: string };

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 255;
}

function generateTempPassword() {
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const symbols = "!@#$%&*";
  const all = lower + upper + digits + symbols;
  const rand = (s: string) => s[Math.floor(Math.random() * s.length)];
  let pwd = rand(upper) + rand(lower) + rand(digits) + rand(symbols);
  for (let i = 0; i < 8; i++) pwd += rand(all);
  return pwd;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No autorizado" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Sesión inválida" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow)
      return json({ error: "Solo administradores pueden hacer esto" }, 403);

    const body: Action = await req.json();

    const logPwdAccess = async (
      target_user_id: string,
      target_email: string | null,
      action: "view" | "edit" | "reset" | "create",
    ) => {
      await admin.from("password_access_log").insert({
        admin_id: user.id,
        admin_email: user.email,
        target_user_id,
        target_email,
        action,
      });
    };

    const storePassword = async (
      target_user_id: string,
      password: string,
    ) => {
      await admin.from("internal_passwords").upsert({
        user_id: target_user_id,
        password,
        is_stale: false,
        set_by: user.id,
        set_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    };

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
          is_active: !u.banned_until || new Date(u.banned_until) < new Date(),
          full_name:
            profiles?.find((p) => p.id === u.id)?.full_name ?? null,
          roles:
            roles?.filter((r) => r.user_id === u.id).map((r) => r.role) ?? [],
        }));
        return json({ users: result });
      }

      case "create": {
        if (!isValidEmail(body.email)) return json({ error: "Email inválido" }, 400);
        if (!body.password || body.password.length < 8)
          return json({ error: "Contraseña mínima 8 caracteres" }, 400);
        if (!body.full_name || body.full_name.trim().length < 2)
          return json({ error: "Nombre requerido" }, 400);
        if (body.role !== "admin" && body.role !== "secretary")
          return json({ error: "Rol inválido" }, 400);

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

        await storePassword(created.user.id, body.password);
        await logPwdAccess(created.user.id, body.email, "create");

        return json({ ok: true, user_id: created.user.id });
      }

      case "update_account": {
        const updates: Record<string, unknown> = {};
        if (body.email) {
          if (!isValidEmail(body.email))
            return json({ error: "Email inválido" }, 400);
          updates.email = body.email;
        }
        if (body.full_name !== undefined) {
          if (body.full_name.trim().length < 2)
            return json({ error: "Nombre requerido" }, 400);
          updates.user_metadata = { full_name: body.full_name.trim() };
        }
        if (typeof body.is_active === "boolean") {
          // Supabase admin: ban_duration "none" or e.g. "876000h" (100 yrs)
          updates.ban_duration = body.is_active ? "none" : "876000h";
        }
        if (Object.keys(updates).length > 0) {
          const { error } = await admin.auth.admin.updateUserById(
            body.user_id,
            updates,
          );
          if (error) throw error;
        }
        if (body.full_name !== undefined) {
          await admin
            .from("profiles")
            .update({ full_name: body.full_name.trim() })
            .eq("id", body.user_id);
        }
        if (body.email) {
          await admin
            .from("profiles")
            .update({ email: body.email })
            .eq("id", body.user_id);
        }
        if (body.role) {
          if (body.role !== "admin" && body.role !== "secretary")
            return json({ error: "Rol inválido" }, 400);
          await admin.from("user_roles").delete().eq("user_id", body.user_id);
          await admin
            .from("user_roles")
            .insert({ user_id: body.user_id, role: body.role });
        }
        return json({ ok: true });
      }

      case "delete": {
        if (body.user_id === user.id)
          return json({ error: "No puedes eliminar tu propia cuenta" }, 400);
        const { error: delErr } = await admin.auth.admin.deleteUser(body.user_id);
        if (delErr) throw delErr;
        return json({ ok: true });
      }

      case "reset_password": {
        if (!body.user_id) return json({ error: "user_id requerido" }, 400);
        const newPassword = generateTempPassword();
        const { data: target, error: updErr } =
          await admin.auth.admin.updateUserById(body.user_id, {
            password: newPassword,
          });
        if (updErr) throw updErr;
        await storePassword(body.user_id, newPassword);
        await logPwdAccess(body.user_id, target.user?.email ?? null, "reset");
        return json({ ok: true, password: newPassword });
      }

      case "set_password": {
        if (!body.user_id) return json({ error: "user_id requerido" }, 400);
        if (!body.password || body.password.length < 8)
          return json({ error: "Contraseña mínima 8 caracteres" }, 400);
        const { data: target, error: updErr } =
          await admin.auth.admin.updateUserById(body.user_id, {
            password: body.password,
          });
        if (updErr) throw updErr;
        await storePassword(body.user_id, body.password);
        await logPwdAccess(body.user_id, target.user?.email ?? null, "edit");
        return json({ ok: true });
      }

      case "get_password": {
        if (!body.user_id) return json({ error: "user_id requerido" }, 400);
        const { data: row } = await admin
          .from("internal_passwords")
          .select("password, is_stale, set_at")
          .eq("user_id", body.user_id)
          .maybeSingle();
        if (!row)
          return json({
            ok: true,
            password: null,
            message:
              "No tenemos registro de esta contraseña. Resetéala para obtener una nueva.",
          });
        const { data: target } = await admin.auth.admin.getUserById(body.user_id);
        await logPwdAccess(body.user_id, target.user?.email ?? null, "view");
        return json({
          ok: true,
          password: row.password,
          is_stale: row.is_stale,
          set_at: row.set_at,
        });
      }

      default:
        return json({ error: "Acción desconocida" }, 400);
    }
  } catch (err) {
    console.error("manage-users error:", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return json({ error: msg }, 500);
  }
});
