import { Facebook, Instagram, Youtube, Music2 } from "lucide-react";
import logo from "@/assets/logo-emblem.png";
import { SITE_CONFIG, SERVICE_CATEGORIES } from "@/config/site";

export const Footer = () => {
  return (
    <footer className="bg-gradient-navy text-primary-foreground">
      <div className="container-narrow py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt={SITE_CONFIG.brandName}
                width={48}
                height={48}
                loading="lazy"
                className="h-12 w-12 object-contain"
              />
              <div className="font-serif font-bold text-lg leading-tight">
                {SITE_CONFIG.brandName}
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Tu despacho de confianza para trámites legales y migratorios en
              México.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: SITE_CONFIG.socials.facebook, label: "Facebook" },
                { icon: Instagram, href: SITE_CONFIG.socials.instagram, label: "Instagram" },
                { icon: Music2, href: SITE_CONFIG.socials.tiktok, label: "TikTok" },
                { icon: Youtube, href: SITE_CONFIG.socials.youtube, label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
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
          {SERVICE_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <h4 className="font-serif font-bold text-accent mb-4">
                {cat.title}
              </h4>
              <ul className="space-y-2 text-sm">
                {cat.services.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <a
                      href="#servicios"
                      className="text-primary-foreground/70 hover:text-accent transition-colors"
                    >
                      {s.short || s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <div>
            © {new Date().getFullYear()} {SITE_CONFIG.brandName}. Todos los
            derechos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-accent transition-colors">
              Aviso de Privacidad
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
