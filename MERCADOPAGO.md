# Integración Mercado Pago — Frontend Hostinger + Backend Lovable Cloud

Arquitectura:

- **Frontend** (React/Vite) → desplegado en **Hostinger**. Sólo conoce la **Public Key** de Mercado Pago.
- **Backend** (Edge Functions en **Lovable Cloud**) → guarda el **Access Token**, crea la preferencia y recibe el webhook.
- El frontend llama a la edge function, la edge function habla con Mercado Pago, Mercado Pago llama al webhook, el webhook actualiza la BD.

```
Hostinger (React) ──▶ mp-create-preference (Lovable Cloud) ──▶ Mercado Pago
                                                                    │
                                       mp-webhook  ◀────────────────┘
```

---

## 1. URLs importantes

Reemplaza `<PROJECT_REF>` por el ID de tu proyecto de Lovable Cloud (`VITE_SUPABASE_PROJECT_ID` en `.env`).

| Uso | URL |
|---|---|
| Endpoint para **crear preferencia** (lo llama el frontend) | `https://<PROJECT_REF>.supabase.co/functions/v1/mp-create-preference` |
| **Webhook** de Mercado Pago (lo llama Mercado Pago) | `https://<PROJECT_REF>.supabase.co/functions/v1/mp-webhook` |

Ambas URLs son las mismas en test y en producción — el modo lo controla el backend con `MP_MODE`.

---

## 2. Qué configurar en Mercado Pago Developers

En [https://www.mercadopago.com.mx/developers/panel](https://www.mercadopago.com.mx/developers/panel) → tu aplicación:

1. **Credenciales de prueba**
   - Public Key (TEST) → va al frontend en `VITE_MP_PUBLIC_KEY`.
   - Access Token (TEST) → va al backend en el secret `MP_ACCESS_TOKEN_TEST`.
2. **Credenciales de producción** (aparecen después de activar la app)
   - Public Key (PROD) → frontend en `VITE_MP_PUBLIC_KEY` cuando pases a producción.
   - Access Token (PROD) → backend en `MP_ACCESS_TOKEN_PROD`.
3. **Notificaciones / Webhooks** → pega la URL del webhook de arriba y activa el evento **`payment`** (Pagos). Es la misma URL para test y para producción.

---

## 3. Dónde configurar cada credencial

### Public Key (frontend, Hostinger)

Archivo `.env` del proyecto (o variable de build en Hostinger):

```
VITE_MP_MODE="test"                # o "production"
VITE_MP_PUBLIC_KEY="TEST-xxxx..."  # o "APP_USR-xxxx..." en prod
```

Vite hornea estas variables al hacer `npm run build`. Después subes la carpeta `dist/` a Hostinger. Si cambias la Public Key hay que **volver a compilar y volver a subir**.

Nunca pongas el Access Token aquí — cualquier archivo `VITE_*` termina en el bundle público.

### Access Token (backend, Lovable Cloud)

En el panel **Backend → Secrets** de Lovable Cloud define:

| Secret | Valor |
|---|---|
| `MP_MODE` | `test` o `production` |
| `MP_ACCESS_TOKEN_TEST` | Access Token de prueba (empieza con `TEST-...`) |
| `MP_ACCESS_TOKEN_PROD` | Access Token de producción (empieza con `APP_USR-...`) |
| `ALLOWED_ORIGINS` | Lista separada por coma con los dominios de Hostinger, ej. `https://miapp.com,https://www.miapp.com,http://localhost:8080` |

El secret legado `MP_ACCESS_TOKEN` sigue funcionando como fallback si `MP_ACCESS_TOKEN_TEST`/`_PROD` no está definido, para no romper la configuración actual.

---

## 4. Variable que controla el entorno

- **Backend:** `MP_MODE` (`test` | `production`) → decide qué Access Token usar.
- **Frontend:** `VITE_MP_MODE` (`test` | `production`) → sólo informativo por ahora, útil si más adelante cargas el SDK Brick con la Public Key.

Ambas deben coincidir. Si `MP_MODE=production` en el backend pero el frontend manda una Public Key TEST, Mercado Pago rechaza el pago.

---

## 5. CORS

`mp-create-preference` lee `ALLOWED_ORIGINS` (lista separada por coma). Si está vacío se permite `*`. En producción **siempre** pon tu dominio de Hostinger para evitar que otros sitios llamen tu endpoint:

```
ALLOWED_ORIGINS="https://tudominio.com,https://www.tudominio.com"
```

El webhook no necesita CORS (lo llama el servidor de Mercado Pago, no un navegador).

---

## 6. Paso de TEST a PRODUCCIÓN — checklist

Cuando termines de probar y quieras cobrar de verdad:

1. En Mercado Pago Developers → activa tu aplicación y copia las credenciales **de producción**.
2. En **Backend → Secrets** de Lovable Cloud:
   - Actualiza `MP_MODE = production`.
   - Confirma que `MP_ACCESS_TOKEN_PROD` tiene el token de producción.
   - **No borres** `MP_ACCESS_TOKEN_TEST` — déjalo para futuras pruebas.
3. En el frontend (`.env` o variables de build de Hostinger):
   - `VITE_MP_MODE="production"`
   - `VITE_MP_PUBLIC_KEY="APP_USR-..."` (Public Key de producción)
4. Vuelve a compilar el frontend (`npm run build`) y sube el nuevo `dist/` a Hostinger.
5. En Mercado Pago Developers → Notificaciones, verifica que el webhook siga apuntando a `https://<PROJECT_REF>.supabase.co/functions/v1/mp-webhook` (no cambia).
6. Haz un cobro real pequeño de prueba para validar el flujo completo.

Para **volver a modo prueba** repite invirtiendo: `MP_MODE=test`, `VITE_MP_MODE=test`, `VITE_MP_PUBLIC_KEY` con la Public Key TEST, y recompila.

---

## 7. Resumen de secrets/variables

**Frontend (Hostinger, público):**

| Variable | TEST | PRODUCCIÓN |
|---|---|---|
| `VITE_MP_MODE` | `test` | `production` |
| `VITE_MP_PUBLIC_KEY` | `TEST-...` | `APP_USR-...` |

**Backend (Lovable Cloud, privado):**

| Secret | Valor |
|---|---|
| `MP_MODE` | `test` o `production` |
| `MP_ACCESS_TOKEN_TEST` | Access Token de prueba (no borrar) |
| `MP_ACCESS_TOKEN_PROD` | Access Token de producción |
| `ALLOWED_ORIGINS` | dominios permitidos por CORS |

Nunca subas los Access Token a Git, al frontend, ni a Hostinger.
