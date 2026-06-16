# Plan de entrega por fases

Te respondo cada fase como una entrega independiente. Tras cada fase pruebas y damos luz verde a la siguiente.

---

## Fase 1 — Branding, Login y DS-160 (pasos 3-5)

**Branding**
- Reemplazar "Despacho legal & trámites" por "Asesores migratorios" en todo el sitio (Navbar, Footer, Hero, SEO, `site.ts`, etc.).

**Login**
- Botón ojo (mostrar/ocultar) en el campo de contraseña en `Auth.tsx`.

**DS-160 — nuevos pasos**
- Paso 3 "Trabajo": lugar, puesto, dirección empresa, sueldo mensual, teléfono empresa, fecha de ingreso.
- Paso 4 "Viajes / Renovación": fecha último viaje a EE.UU., ciudades visitadas, tiempo de estancia. Solo aplica si el usuario marca que es renovación (checkbox al inicio del paso).
- Paso 5 "Contacto en EE.UU.": selector familiar / no familiar.
  - Familiar → nombre completo, parentesco, dirección, teléfono, estatus migratorio.
  - No familiar → nombre hotel, dirección hotel.
- Actualizar `ds160-schema.ts` con schemas `step3`, `step4`, `step5`, validaciones zod.
- Actualizar `validate_ds160` (trigger DB) para permitir `current_step` 1-5.
- Renderizar nuevos componentes `DS160Step3`, `DS160Step4`, `DS160Step5`.
- Mantener `form_data jsonb` — no hay que agregar columnas nuevas.

---

## Fase 2 — Administración

**Servicios (admin)**
- Nueva tabla `service_categories` (title, description, display_order, is_active).
- Modificar `services`: cambiar `category` text → `category_id uuid` FK.
- Migrar datos existentes: crear categorías a partir de los `category` actuales y reasignar.
- Nuevo módulo `CategoriesAdmin` (CRUD categorías) + actualizar `ServicesAdmin` para usar selector de categoría.
- Solo accesible a admin (ya con `requireRoles`).

**Personal de despacho**
- Fusionar `StaffAdmin` con creación de cuentas (lo que hoy hace `UsersAdmin`): desde aquí se crea la cuenta de usuario + el registro de staff en un solo flujo.
- Eliminar duplicación; mantener `UsersAdmin` solo si gestiona usuarios externos (lo confirmamos al implementar).
- Botón "Resetear contraseña" por cuenta (solo admin) — genera contraseña temporal vía edge function `manage-users` y la muestra una sola vez.

**Redes sociales (antes "Videos")**
- Renombrar ruta `/admin/videos` → `/admin/redes-sociales` y label en sidebar.
- Mover edición de WhatsApp, teléfono, email y links sociales aquí (hoy viven en `site.ts` — los moveremos a tabla `site_settings` para que sean editables y se reflejen en toda la página).
- Sección "Preguntas posibles PDF": subir 1 PDF global a Storage bucket privado `ds160-resources`. Admin y personal ven preview; usuarios solo después de pago aprobado.

---

## Fase 3 — Pago DS-160 (Mercado Pago, preparado sin activar)

- Tabla `ds160_payments` (application_id, payment_id, status, amount, addon_live_advisory bool, paid_at).
- Pantalla "Paso 6 — Pago" al final del DS-160 con:
  - Resumen del servicio
  - Checkbox "Agregar asesoría en vivo (+$200 MXN)" — total 600/800 MXN
  - Contenedor para Mercado Pago Payment Brick (stub mientras no haya credenciales)
- Edge function `mp-create-preference` (crea preference, devuelve `preference_id`).
- Edge function `mp-webhook` (recibe notificación, valida con MP, actualiza `ds160_payments.status='approved'` y `ds160_applications.payment_status`).
- Cuando `payment_status='approved'` → se desbloquea envío del trámite y acceso al PDF "Preguntas posibles".
- Frontend: cargar SDK MP solo cuando exista `VITE_MP_PUBLIC_KEY`. Mientras no esté, mostrar aviso "Pago en configuración".
- Secrets que pediré al activar: `MP_ACCESS_TOKEN` (backend) y `VITE_MP_PUBLIC_KEY` (frontend, agregar a `.env`).

---

## Reglas transversales
- Mantener responsivo y diseño actual.
- Validaciones zod en cada paso del DS-160.
- Toasts de éxito/error.
- Respetar roles existentes (admin / secretary / user).
- No tocar `client.ts`, `types.ts`, ni `config.toml` (autogenerados).

---

**Empiezo con Fase 1 al aprobar.** Si quieres ajustar alcance de alguna fase, dime ahora.