import { useEffect, useState } from "react";
import { MessageCircle, FileText, Plane, Stamp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface ServiceRow {
  id: string;
  name: string;
  short_description: string | null;
  display_order: number;
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  items: ServiceRow[];
}

const ICON_BY_SLUG: Record<string, typeof FileText> = {
  "pasaportes-visas": Plane,
  "actas-registros": FileText,
  "otros-servicios": Stamp,
};

export const Services = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { whatsappHref } = useSiteSettings();

  useEffect(() => {
    (async () => {
      const [catRes, svcRes] = await Promise.all([
        supabase
          .from("service_categories" as never)
          .select("id, name, slug, description, display_order, is_active")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
        supabase
          .from("services")
          .select("id, name, category_id, short_description, display_order, is_active")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
      ]);

      const cats = ((catRes.data as unknown) as CategoryRow[]) ?? [];
      const svcs =
        ((svcRes.data as unknown) as (ServiceRow & { category_id: string | null })[]) ?? [];

      setCategories(
        cats
          .map((c) => ({
            ...c,
            items: svcs.filter((s) => s.category_id === c.id),
          }))
          // No mostrar categorías sin servicios activos
          .filter((c) => c.items.length > 0),
      );
      setLoading(false);
    })();
  }, []);

  // Rejilla adaptativa según cuántas categorías estén activas
  const gridClass =
    categories.length === 1
      ? "grid grid-cols-1 gap-8 max-w-xl mx-auto"
      : categories.length === 2
        ? "grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto"
        : "grid sm:grid-cols-2 lg:grid-cols-3 gap-8";

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

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Próximamente publicaremos nuestros servicios.
          </p>
        ) : (
          <div className={gridClass}>
            {categories.map((category) => {
              const Icon = ICON_BY_SLUG[category.slug] ?? FileText;
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
                      {category.name}
                    </h3>
                  </div>

                  {category.description && (
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {category.description}
                    </p>
                  )}

                  <ul className="space-y-3 flex-1 mb-6">
                    {category.items.map((service) => (
                      <li
                        key={service.id}
                        className="flex items-start justify-between gap-3 group pb-3 border-b border-border/50 last:border-0"
                      >
                        <span className="text-foreground text-sm leading-snug pt-1">
                          {service.name}
                        </span>
                        <a
                          href={whatsappHref(service.name)}
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
                      href={whatsappHref(`Categoría: ${category.name}`)}
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
        )}
      </div>
    </section>
  );
};
