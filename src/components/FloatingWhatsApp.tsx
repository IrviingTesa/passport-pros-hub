import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export const FloatingWhatsApp = () => {
  const { whatsappHref } = useSiteSettings();
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-whatsapp text-whatsapp-foreground shadow-elegant hover:scale-110 transition-transform flex items-center justify-center group"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-card">
        ¿Necesitas ayuda?
      </span>
      <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-25" />
    </a>
  );
};
