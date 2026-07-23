import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_services",
  title: "Listar servicios",
  description:
    "Lista el catálogo público de servicios y categorías activas de Asesores Migratorios.",
  inputSchema: {
    category_slug: z
      .string()
      .trim()
      .optional()
      .describe("Filtrar por slug de categoría (opcional)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category_slug }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let query = supabase
      .from("services")
      .select("id, title, slug, description, category_id, service_categories!inner(name, slug)")
      .eq("is_active", true);
    if (category_slug) query = query.eq("service_categories.slug", category_slug);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { services: data ?? [] },
    };
  },
});
