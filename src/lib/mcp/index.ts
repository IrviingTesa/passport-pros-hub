import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listServicesTool from "./tools/list-services";
import listMyDs160Tool from "./tools/list-my-ds160";
import getDs160Tool from "./tools/get-ds160";
import submitReviewTool from "./tools/submit-review";

// Build the OAuth issuer from the project ref (safe at import time — Vite
// inlines VITE_* as literals at build time).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "asesores-migratorios-mcp",
  title: "Asesores Migratorios",
  version: "0.1.0",
  instructions:
    "Herramientas de Asesores Migratorios. Consulta el catálogo público de servicios, y con la sesión del usuario, revisa tus solicitudes DS-160 y envía reseñas para aprobación.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listServicesTool, listMyDs160Tool, getDs160Tool, submitReviewTool],
});
