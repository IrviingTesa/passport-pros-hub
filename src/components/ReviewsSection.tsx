import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * Sección de Reseñas — placeholder Fase 1.
 * En Fase 3 (con auth) los clientes registrados podrán dejar reseñas reales
 * y el admin podrá agregar reseñas manualmente con foto.
 */
const PLACEHOLDER_REVIEWS = [
  {
    name: "María González",
    role: "Visa B1/B2 aprobada",
    rating: 5,
    text: "Excelente acompañamiento durante todo el proceso de mi visa americana. Muy profesionales y atentos. ¡Mi visa fue aprobada al primer intento!",
    initials: "MG",
  },
  {
    name: "Carlos Ramírez",
    role: "Apostilla de documentos",
    rating: 5,
    text: "Tramitaron la apostilla de mis documentos académicos rápido y sin complicaciones. Me ahorraron mucho tiempo y dolores de cabeza.",
    initials: "CR",
  },
  {
    name: "Lucía Hernández",
    role: "Pasaporte extemporáneo",
    rating: 5,
    text: "Pensé que sería imposible obtener mi pasaporte sin acta reciente. Ellos me asesoraron paso a paso y lo logramos. ¡Totalmente recomendados!",
    initials: "LH",
  },
];

export const ReviewsSection = () => {
  return (
    <section id="resenas" className="section-padding bg-gradient-section">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-accent font-semibold tracking-wider uppercase text-sm mb-3">
            Testimonios
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-muted-foreground text-lg">
            Cientos de trámites resueltos. Estas son algunas de sus historias.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLACEHOLDER_REVIEWS.map((review) => (
            <Card
              key={review.name}
              className="p-7 shadow-card hover:shadow-elegant transition-all duration-300 border-border/60 relative"
            >
              <Quote className="absolute top-4 right-4 w-10 h-10 text-accent/15" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-accent text-accent"
                  />
                ))}
              </div>

              <p className="text-foreground leading-relaxed mb-6 italic">
                "{review.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <Avatar className="h-11 w-11 bg-gradient-navy">
                  <AvatarFallback className="bg-gradient-navy text-accent font-semibold">
                    {review.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-primary text-sm">
                    {review.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {review.role}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10 italic">
          ✨ Pronto: los clientes podrán crear su cuenta y dejar reseñas verificadas.
        </p>
      </div>
    </section>
  );
};
