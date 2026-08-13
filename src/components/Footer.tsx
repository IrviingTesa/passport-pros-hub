import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Music2 } from "lucide-react";
import logo from "@/assets/logo-emblem.png";
import { SITE_CONFIG } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface FooterCategory {
  id: string;
  name: string;
  items: { id: string; name: string; short_description: string | null }[];
}

export const Footer = () => {
  const { settings } = useSiteSettings();
  const [categories, setCategories] = useState<FooterCategory[]>([]);

  useEffect(() => {
    (async () => {
      const [catRes, svcRes] = await Promise.all([
        supabase
          .from("service_categories" as never)
          .select("id, name, display_order, is_active")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
        supabase
          .from("services")
          .select("id, name, category_id, short_description, display_order, is_active")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
      ]);
      const cats = ((catRes.data as unknown) as FooterCategory[]) ?? [];
      const svcs =
        ((svcRes.data as unknown) as {
          id: string;
          name: string;
          category_id: string | null;
          short_description: string | null;
        }[]) ?? [];
      setCategories(
        cats
          .map((c) => ({ ...c, items: svcs.filter((s) => s.category_id === c.id) }))
          .filter((c) => c.items.length > 0),
      );
    })();
  }, []);

  return (
    <footer className="bg-gradient-navy text-primary-foreground">
      <div className="container-narrow py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt={SITE_CONFIG.brandName} width={48} height={48} loading="lazy" className="h-12 w-12 object-contain" />
              <div className="font-serif font-bold text-lg leading-tight">{SITE_CONFIG.brandName}</div>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Tus asesores migratorios de confianza para trámites legales y migratorios en México.
            </p>
            <ul className="text-primary-foreground/70 text-sm space-y-1 mb-4">
              <li>📞 {settings.phone_number}</li>
              <li>✉️ {settings.contact_email}</li>
            </ul>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: settings.facebook_url, label: "Facebook" },
                { icon: Instagram, href: settings.instagram_url, label: "Instagram" },
                { icon: Music2, href: settings.tiktok_url, label: "TikTok" },
                { icon: Youtube, href: settings.youtube_url, label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-md bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          {categories.map((cat) => (
            <div key={cat.id}>
              <h4 className="font-serif font-bold text-accent mb-4">{cat.name}</h4>
              <ul className="space-y-2 text-sm">
                {cat.items.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <a href="/#servicios" className="text-primary-foreground/70 hover:text-accent transition-colors">
                      {s.short_description || s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <div>
            © {new Date().getFullYear()} {SITE_CONFIG.brandName}. Todos los derechos reservados.
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link to="/aviso-de-privacidad" className="hover:text-accent transition-colors">
              Aviso de Privacidad
            </Link>
            <Link to="/terminos-y-condiciones" className="hover:text-accent transition-colors">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
