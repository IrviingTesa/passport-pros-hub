import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export default defineTool({
  name: "submit_review",
  title: "Enviar reseña",
  description:
    "Envía una reseña del cliente para su aprobación por un administrador. Requiere sesión.",
  inputSchema: {
    client_name: z.string().trim().min(1).max(100),
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(1).max(1000),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ client_name, rating, comment }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("reviews")
      .insert({
        client_name,
        rating,
        comment,
        status: "pending",
      })
      .select()
      .maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [
        {
          type: "text",
          text: `Reseña enviada (id ${data?.id}). Queda pendiente de aprobación por un administrador.`,
        },
      ],
      structuredContent: { review: data },
    };
  },
});
