// Configuración del frontend de Mercado Pago.
// Sólo lee variables VITE_* (públicas). Nunca importes ni referencies aquí
// el Access Token — ese secreto vive únicamente en el backend (Lovable Cloud).
//
// Cambia el entorno editando VITE_MP_MODE en .env (o en las variables de build
// de Hostinger) y volviendo a compilar/desplegar.

export type MpMode = "test" | "production";

export const MP_MODE: MpMode =
  (import.meta.env.VITE_MP_MODE as MpMode) === "production" ? "production" : "test";

export const MP_PUBLIC_KEY: string = import.meta.env.VITE_MP_PUBLIC_KEY ?? "";

export const isMpConfigured = () => MP_PUBLIC_KEY.length > 0;
