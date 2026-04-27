import { supabase } from "@/integrations/supabase/client";

/**
 * Dispara el registro anónimo de la visita a la página principal.
 * Falla silenciosamente: nunca debe romper el render.
 */
export const trackPageVisit = async () => {
  try {
    await supabase.functions.invoke("track-visit", { body: {} });
  } catch (_e) {
    // ignore
  }
};
