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
    { icon: MapPin, label: "Oficina", value: SITE_CONFIG.address, href: "https://www.google.com.mx/maps/place/Isaac+Newton,+Centro,+40900+T%C3%A9cpan+de+Galeana,+Gro./@17.2224619,-100.632526,3a,75y,133.66h,85.79t/data=!3m7!1e1!3m5!1s5HP0I51ApXx3G2t1Fb3WaQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D4.211622789229608%26panoid%3D5HP0I51ApXx3G2t1Fb3WaQ%26yaw%3D133.66357456323846!7i16384!8i8192!4m15!1m8!3m7!1s0x8434cd384463f6cb:0x8f70e9d14f42f7df!2sIsaac+Newton,+Centro,+40900+T%C3%A9cpan+de+Galeana,+Gro.!3b1!8m2!3d17.22248!4d-100.6327139!16s%2Fg%2F1v6qhz2k!3m5!1s0x8434cd384463f6cb:0x8f70e9d14f42f7df!8m2!3d17.22248!4d-100.6327139!16s%2Fg%2F1v6qhz2k?entry=ttu&g_ep=EgoyMDI2MDcwNy4wIKXMDSoASAFQAw%3D%3D" },
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
