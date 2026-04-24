import { Youtube, Music2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Sección de Videos — versión placeholder de Fase 1.
 *
 * En la Fase 2 conectaremos:
 *  - YouTube Data API v3 para traer los últimos 10 videos del canal automáticamente
 *  - Una tabla en la base de datos donde el admin pegará los links de TikTok manualmente
 *
 * Por ahora se muestran tarjetas placeholder.
 */
const PLACEHOLDER_VIDEOS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  title: `Video próximamente #${i + 1}`,
}));

export const VideosSection = () => {
  return (
    <section id="videos" className="section-padding bg-background">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-accent font-semibold tracking-wider uppercase text-sm mb-3">
            Multimedia
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Conoce nuestro contenido
          </h2>
          <p className="text-muted-foreground text-lg">
            Tutoriales, casos reales y consejos sobre trámites legales y
            migratorios.
          </p>
        </div>

        {/* YouTube */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary">
                Últimos en YouTube
              </h3>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="#" target="_blank" rel="noopener noreferrer">
                Ver canal <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {PLACEHOLDER_VIDEOS.map((v) => (
              <Card
                key={v.id}
                className="aspect-video bg-secondary border-dashed border-2 flex items-center justify-center text-muted-foreground text-xs p-4 text-center"
              >
                {v.title}
              </Card>
            ))}
          </div>
        </div>

        {/* TikTok */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary">
                Últimos en TikTok
              </h3>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="#" target="_blank" rel="noopener noreferrer">
                Ver perfil <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {PLACEHOLDER_VIDEOS.map((v) => (
              <Card
                key={v.id}
                className="aspect-[9/16] bg-secondary border-dashed border-2 flex items-center justify-center text-muted-foreground text-xs p-4 text-center"
              >
                {v.title}
              </Card>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10 italic">
          ✨ Pronto: los videos se cargarán automáticamente desde YouTube y los
          de TikTok se administrarán desde el panel.
        </p>
      </div>
    </section>
  );
};
