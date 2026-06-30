import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "@/config/site";

export interface SiteSettings {
  whatsapp_number: string;
  phone_number: string;
  contact_email: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
}

interface ContextValue {
  settings: SiteSettings;
  loading: boolean;
  whatsappHref: (serviceName?: string) => string;
  reload: () => Promise<void>;
}

const FALLBACK: SiteSettings = {
  whatsapp_number: SITE_CONFIG.whatsappNumber,
  phone_number: SITE_CONFIG.phone,
  contact_email: SITE_CONFIG.email,
  facebook_url: SITE_CONFIG.socials.facebook,
  instagram_url: SITE_CONFIG.socials.instagram,
  tiktok_url: SITE_CONFIG.socials.tiktok,
  youtube_url: SITE_CONFIG.socials.youtube,
};

const SiteSettingsContext = createContext<ContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("site_settings" as never)
      .select("*")
      .limit(1)
      .maybeSingle();
    if (data) {
      const d = data as unknown as Partial<SiteSettings>;
      setSettings({
        whatsapp_number: d.whatsapp_number?.trim() || FALLBACK.whatsapp_number,
        phone_number: d.phone_number?.trim() || FALLBACK.phone_number,
        contact_email: d.contact_email?.trim() || FALLBACK.contact_email,
        facebook_url: d.facebook_url?.trim() || FALLBACK.facebook_url,
        instagram_url: d.instagram_url?.trim() || FALLBACK.instagram_url,
        tiktok_url: d.tiktok_url?.trim() || FALLBACK.tiktok_url,
        youtube_url: d.youtube_url?.trim() || FALLBACK.youtube_url,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const value = useMemo<ContextValue>(() => {
    const cleanNumber = settings.whatsapp_number.replace(/[^\d]/g, "");
    return {
      settings,
      loading,
      whatsappHref: (serviceName?: string) => {
        const text = serviceName
          ? `Hola, me interesa el servicio: *${serviceName}*. ¿Me pueden dar más información?`
          : `Hola, quiero recibir información sobre los servicios de Asesores Migratorios.`;
        return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
      },
      reload: load,
    };
  }, [settings, loading]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    // Safe fallback so components that render outside provider don't crash.
    return {
      settings: FALLBACK,
      loading: false,
      whatsappHref: (serviceName?: string) => {
        const text = serviceName
          ? `Hola, me interesa el servicio: *${serviceName}*.`
          : `Hola, quiero recibir información sobre los servicios de Asesores Migratorios.`;
        return `https://wa.me/${FALLBACK.whatsapp_number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
      },
      reload: async () => {},
    } as ContextValue;
  }
  return ctx;
}
