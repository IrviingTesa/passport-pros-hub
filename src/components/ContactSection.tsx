import { useMemo } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export const ContactSection = () => {
  const { settings, whatsappHref } = useSiteSettings();

  const items = useMemo(() => [
    { icon: MessageCircle, label: "WhatsApp", value: settings.phone_number, href: whatsappHref(), accent: true, external: true },
    { icon: Phone, label: "Teléfono", value: settings.phone_number, href: `tel:${settings.phone_number.replace(/\s/g, "")}` },
    { icon: Mail, label: "Correo", value: settings.contact_email, href: `mailto:${settings.contact_email}` },
    { icon: MapPin, label: "Oficina", value: SITE_CONFIG.address, href: "#" },
    { icon: Clock, label: "Horario", value: SITE_CONFIG.hours, href: "#" },
  ], [settings, whatsappHref]);

  return (
    <section id="contacto" className="section-padding bg-background">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-accent font-semibold tracking-wider uppercase text-sm mb-3">Contáctanos</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">Estamos aquí para ayudarte</h2>
          <p className="text-muted-foreground text-lg">Comunícate por el medio que prefieras. WhatsApp es nuestro canal más rápido.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {items.map(({ icon: Icon, label, value, href, accent, external }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="block group"
            >
              <Card className={`p-6 h-full transition-all duration-300 border ${accent ? "bg-gradient-navy text-primary-foreground border-accent/30 hover:shadow-elegant" : "shadow-card hover:shadow-elegant border-border/60 hover:border-accent/40"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? "bg-accent/20" : "bg-secondary"}`}>
                    <Icon className={`w-6 h-6 ${accent ? "text-accent" : "text-primary"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${accent ? "text-accent" : "text-muted-foreground"}`}>{label}</div>
                    <div className={`font-medium ${accent ? "text-primary-foreground" : "text-foreground group-hover:text-accent"} transition-colors break-words`}>{value}</div>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="whatsapp" size="lg">
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Escríbenos por WhatsApp ahora
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
