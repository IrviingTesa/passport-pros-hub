import { MessageCircle, FileText, Plane, Stamp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES, whatsappLink } from "@/config/site";

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  "pasaportes-visas": Plane,
  "actas-registros": FileText,
  "otros-servicios": Stamp,
};

export const Services = () => {
  return (
    <section id="servicios" className="section-padding bg-gradient-section">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold tracking-wider uppercase text-sm mb-3">
            Nuestros Servicios
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Soluciones integrales para tus trámites
          </h2>
          <p className="text-muted-foreground text-lg">
            Selecciona el servicio que necesitas y solicítalo directo por
            WhatsApp. Te respondemos en minutos.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {SERVICE_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id] ?? FileText;
            return (
              <Card
                key={category.id}
                className="p-8 shadow-card hover:shadow-elegant transition-all duration-300 border-border/60 hover:border-accent/40 flex flex-col"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-lg bg-gradient-navy flex items-center justify-center shadow-card">
                    <Icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-primary">
                    {category.title}
                  </h3>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {category.description}
                </p>

                <ul className="space-y-3 flex-1 mb-6">
                  {category.services.map((service) => (
                    <li
                      key={service.id}
                      className="flex items-start justify-between gap-3 group pb-3 border-b border-border/50 last:border-0"
                    >
                      <span className="text-foreground text-sm leading-snug pt-1">
                        {service.name}
                      </span>
                      <a
                        href={whatsappLink(service.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-whatsapp hover:bg-whatsapp/10 px-2.5 py-1.5 rounded-md transition-colors flex-shrink-0"
                        aria-label={`Solicitar ${service.name} por WhatsApp`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Solicitar
                      </a>
                    </li>
                  ))}
                </ul>

                <Button asChild variant="default" className="w-full mt-auto">
                  <a
                    href={whatsappLink(`Categoría: ${category.title}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Consultar esta categoría
                  </a>
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
