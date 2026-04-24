import { useEffect, useState } from "react";
import { Youtube, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface YouTubeVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
}

interface YouTubePayload {
  videos: YouTubeVideo[];
  channelUrl: string | null;
  error?: string;
}

const YouTubeCard = ({ video }: { video: YouTubeVideo }) => (
  <a
    href={video.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group block"
  >
    <Card className="overflow-hidden border-border/60 hover:border-accent/40 hover:shadow-elegant transition-all duration-300">
      <div className="relative aspect-video bg-secondary overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-destructive/95 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
          {video.title}
        </p>
      </div>
    </Card>
  </a>
);

const PlaceholderCard = () => (
  <Card className="aspect-video bg-secondary border-dashed border-2 flex items-center justify-center text-muted-foreground text-xs p-4 text-center">
    Próximamente
  </Card>
);

export const VideosSection = () => {
  const [data, setData] = useState<YouTubePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: payload, error } =
          await supabase.functions.invoke<YouTubePayload>("youtube-videos", {
            body: {},
          });
        if (cancelled) return;
        if (error) {
          console.error("youtube-videos invoke error:", error);
          setData({ videos: [], channelUrl: null });
        } else {
          setData(payload ?? { videos: [], channelUrl: null });
        }
      } catch (e) {
        if (!cancelled) setData({ videos: [], channelUrl: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const videos = data?.videos ?? [];
  const channelUrl = data?.channelUrl ?? null;

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

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Youtube className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary">
              Últimos videos en YouTube
            </h3>
          </div>
          {channelUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={channelUrl} target="_blank" rel="noopener noreferrer">
                Ver canal completo <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
              ))
            : videos.length > 0
            ? videos.map((v) => <YouTubeCard key={v.videoId} video={v} />)
            : Array.from({ length: 5 }).map((_, i) => <PlaceholderCard key={i} />)}
        </div>

        {!loading && videos.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-6 italic">
            Aún no hay videos disponibles.
          </p>
        )}
      </div>
    </section>
  );
};
