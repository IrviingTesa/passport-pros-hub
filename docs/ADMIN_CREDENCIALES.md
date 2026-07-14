# Credenciales de administrador

Este documento explica cómo se administran las cuentas admin del sistema, cómo cambiarlas y cómo crear/eliminar administradores sin romper el acceso.

---

## 1. Dónde viven las credenciales

Toda la autenticación corre sobre **Lovable Cloud** (Supabase gestionado). No hay archivo `.env` ni script seed con usuarios: los admins existen como filas reales en dos tablas.

| Componente | Ubicación | Qué guarda |
|---|---|---|
| Usuario (correo + contraseña) | `auth.users` (esquema gestionado por Lovable Cloud) | Email, hash de contraseña, metadata |
| Perfil público | `public.profiles` | `id`, `email`, `full_name` (se crea automático con el trigger `handle_new_user`) |
| Rol de admin | `public.user_roles` | Fila `(user_id, role='admin')` — **ésta es la que otorga acceso al panel** |

Regla clave: **el rol admin NO vive en `profiles` ni en `auth.users`.** Está en `user_roles`. Todas las políticas RLS y funciones (`has_role`, `ProtectedRoute`, etc.) leen de ahí.

Roles definidos actualmente en el enum `app_role`:

- `admin` — acceso completo al panel `/admin/*`.
- `secretary` — acceso al panel con permisos limitados; puede solicitar edición temporal de DS-160.
- (sin fila en `user_roles`) — usuario externo/cliente.

---

## 2. Cambiar email o contraseña del admin

Hay dos formas soportadas, ambas por diseño no exponen secretos al frontend.

### Opción A — Desde la propia app (recomendada)

Ruta: `/admin/usuarios` (componente `src/pages/admin/UsersAdmin.tsx`).

- Debes estar logueado como admin.
- Por cada cuenta puedes:
  - Cambiar el correo.
  - Resetear la contraseña (genera una temporal y se muestra una sola vez).
  - Asignar o quitar rol.
- Internamente llama a la Edge Function `manage-users`, que usa el `SUPABASE_SERVICE_ROLE_KEY` **solo en el backend**. La clave nunca sale a la web.

### Opción B — Desde el panel de Lovable Cloud (Backend)

`<presentation-actions><presentation-open-backend>Ver Backend</presentation-open-backend></presentation-actions>`

- Sección **Users**: buscar el email → editar correo, forzar reset de contraseña, revocar sesiones.
- Sirve como salvavidas si perdiste acceso a la app y aún puedes entrar al backend.

No existe un script `seed.sql` ni un archivo de configuración con la contraseña del admin. El primer admin del proyecto se creó registrándose con el correo del dueño en `/auth` y luego insertando una fila manual en `user_roles`.

---

## 3. Crear otro admin

Dos pasos, en orden:

1. La persona se registra normalmente en `/auth` con su email y una contraseña. Esto crea automáticamente su fila en `auth.users` y en `profiles` (por el trigger `handle_new_user`).
2. Desde `/admin/usuarios`, un admin existente le asigna el rol `admin`. Internamente esto inserta:

   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<uuid-del-usuario>', 'admin');
   ```

Si por alguna razón necesitas crear el primer admin desde cero (por ejemplo, después de un reset):

- Regístrate en `/auth` normalmente.
- En el Backend → SQL runner, ejecuta el `INSERT` de arriba con tu propio `user_id`.

---

## 4. Quitar permisos admin

Desde `/admin/usuarios`, cambiar el rol o quitarlo. Equivalente en SQL:

```sql
DELETE FROM public.user_roles
WHERE user_id = '<uuid>' AND role = 'admin';
```

Consecuencia: el usuario sigue existiendo (puede iniciar sesión) pero pierde acceso al panel `/admin/*`. Sus datos no se borran.

Nota importante: **no te quites tu propio rol admin si eres el único admin activo**, o perderás la capacidad de gestionar usuarios desde la app y sólo podrás recuperar acceso desde el Backend de Lovable Cloud.

---

## 5. Qué puede hacer cada rol

| Acción | Externo (sin rol) | `secretary` | `admin` |
|---|---|---|---|
| Ver landing y enviar DS-160 propio | Sí | Sí | Sí |
| Ver DS-160 de otros usuarios | No | Sí (solo lectura) | Sí |
| Editar DS-160 de otros | No | Solo con permiso temporal aprobado por admin | Sí |
| Enviar DS-160 a papelera | No | Solo con permiso activo | Sí |
| Restaurar DS-160 | No | Solo con permiso activo | Sí |
| Eliminar definitivamente | No | No | Sí |
| Aprobar reseñas | No | Sí | Sí |
| Gestionar servicios / categorías | No | No | Sí |
| Gestionar personal / videos / redes sociales | No | No | Sí |
| Gestionar usuarios y roles | No | No | Sí |
| Ver pagos y configuración de Mercado Pago | No | No | Sí |

Los permisos temporales de `secretary` viven en `secretary_edit_permissions` con `expires_at`. Se verifican con la función `secretary_has_active_edit_permission(user_id)`.

---

## 6. Qué NO tocar

Para no romper el acceso, evita:

- **Borrar filas en `auth.users`** manualmente sin borrar antes las filas dependientes en `profiles`, `user_roles`, `ds160_applications.user_id` (aunque hay cascade en algunas relaciones, mejor hacerlo desde `/admin/usuarios`).
- **Renombrar o eliminar el enum `app_role`** o los valores `admin` / `secretary`.
- **Modificar `src/integrations/supabase/client.ts` o `types.ts`** (son autogenerados).
- **Cambiar la firma de `has_role(uuid, app_role)`** — todas las RLS dependen de ella.
- **Desactivar RLS** en cualquier tabla del esquema `public`.
- **Poner claves privadas en `.env` del frontend** (`VITE_*`). Cualquier `VITE_*` termina en el bundle del navegador.

---

## 7. Secrets / variables de entorno

Los secretos sensibles viven **solo en Lovable Cloud → Backend → Secrets**, nunca en el frontend. Los actuales:

| Secret | Uso | Consumido por |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Operaciones admin (crear/editar usuarios, service role) | Edge Function `manage-users`, `ds160-purge-trash` |
| `SUPABASE_URL` | URL del proyecto backend | Todas las Edge Functions |
| `SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY` | Cliente público — es pública por diseño | Frontend (via `VITE_SUPABASE_PUBLISHABLE_KEY`) |
| `YOUTUBE_API_KEY` | Sync semanal de videos | Edge Function `youtube-sync` |
| `MP_ACCESS_TOKEN` (legacy) | Access token Mercado Pago (compat) | `mp-create-preference`, `mp-webhook` |
| `MP_ACCESS_TOKEN_TEST` / `MP_ACCESS_TOKEN_PROD` | Access tokens por entorno | `mp-create-preference`, `mp-webhook` |
| `MP_MODE` | `test` o `production` — decide qué access token usa el backend | `mp-create-preference`, `mp-webhook` |
| `MP_PUBLIC_KEY` | Public Key MP (opcional en backend) | Referencia |
| `ALLOWED_ORIGINS` | Lista CSV de orígenes permitidos por CORS | `mp-create-preference` |
| `LOVABLE_API_KEY` | Lovable AI Gateway | Reservado |

Variables públicas del frontend (permitidas en `.env`, se compilan al bundle):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_MP_PUBLIC_KEY` (Public Key de Mercado Pago, es pública)
- `VITE_MP_MODE` (opcional, `test` o `production`)

Cómo agregar/rotar un secret: **Backend → Secrets → Add Secret / Update**. Después de rotar el `SERVICE_ROLE_KEY` o el `MP_ACCESS_TOKEN_*`, las Edge Functions afectadas se reinician solas y toman el nuevo valor.

---

## 8. Si pierdes acceso al admin

En orden de intentos:

1. Entrar a `/auth`, usar **"Olvidé mi contraseña"** con el correo del admin. Llega email de reset.
2. Si el correo del admin ya no existe: entrar al **Backend de Lovable Cloud → Users**, cambiar el email del admin al que sí tienes acceso, y luego resetear contraseña desde `/auth`.
3. Si perdiste incluso acceso al backend: contactar soporte de Lovable Cloud desde el email dueño del proyecto.

No hay puerta trasera hardcodeada en el código — y no debe haberla.
