import { useEffect, useState } from "react";
import { Youtube, Music2, ExternalLink, Play } from "lucide-react";
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

interface VideoChannelsRow {
  tiktok_profile_url: string | null;
  tiktok_video_urls: string[] | null;
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

const TikTokCard = ({ url }: { url: string }) => {
  // Extraer ID si es posible para mostrar miniatura/embed simple
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="group block">
      <Card className="aspect-[9/16] overflow-hidden border-border/60 hover:border-accent/40 hover:shadow-elegant transition-all duration-300 bg-gradient-navy flex flex-col items-center justify-center text-primary-foreground p-4 relative">
        <Music2 className="w-10 h-10 text-accent mb-3" />
        <p className="text-xs text-center text-primary-foreground/80 font-medium">
          Ver en TikTok
        </p>
        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors" />
      </Card>
    </a>
  );
};

const PlaceholderCard = ({ aspect }: { aspect: "video" | "tiktok" }) => (
  <Card
    className={`${
      aspect === "video" ? "aspect-video" : "aspect-[9/16]"
    } bg-secondary border-dashed border-2 flex items-center justify-center text-muted-foreground text-xs p-4 text-center`}
  >
    Próximamente
  </Card>
);

export const VideosSection = () => {
  const [youtubeData, setYoutubeData] = useState<YouTubePayload | null>(null);
  const [youtubeLoading, setYoutubeLoading] = useState(true);
  const [tiktok, setTiktok] = useState<VideoChannelsRow | null>(null);
  const [tiktokLoading, setTiktokLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // YouTube via edge function
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke<YouTubePayload>(
          "youtube-videos",
          { body: {} },
        );
        if (cancelled) return;
        if (error) {
          console.error("youtube-videos invoke error:", error);
          setYoutubeData({ videos: [], channelUrl: null });
        } else {
          setYoutubeData(data ?? { videos: [], channelUrl: null });
        }
      } catch (e) {
        if (!cancelled) setYoutubeData({ videos: [], channelUrl: null });
      } finally {
        if (!cancelled) setYoutubeLoading(false);
      }
    })();

    // TikTok directo desde la BD
    (async () => {
      const { data } = await supabase
        .from("video_channels")
        .select("tiktok_profile_url, tiktok_video_urls")
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      const urls = Array.isArray(data?.tiktok_video_urls)
        ? (data!.tiktok_video_urls as unknown as string[])
        : [];
      setTiktok({
        tiktok_profile_url: data?.tiktok_profile_url ?? null,
        tiktok_video_urls: urls,
      });
      setTiktokLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const ytVideos = youtubeData?.videos ?? [];
  const ytChannelUrl = youtubeData?.channelUrl ?? null;
  const ttVideos = tiktok?.tiktok_video_urls ?? [];
  const ttProfileUrl = tiktok?.tiktok_profile_url ?? null;

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
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary">
                Últimos en YouTube
              </h3>
            </div>
            {ytChannelUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={ytChannelUrl} target="_blank" rel="noopener noreferrer">
                  Ver canal completo <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {youtubeLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-video rounded-lg" />
                ))
              : ytVideos.length > 0
              ? ytVideos.map((v) => <YouTubeCard key={v.videoId} video={v} />)
              : Array.from({ length: 5 }).map((_, i) => (
                  <PlaceholderCard key={i} aspect="video" />
                ))}
          </div>
          {!youtubeLoading && ytVideos.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-6 italic">
              Configura el canal de YouTube desde el panel admin para mostrar
              videos automáticamente.
            </p>
          )}
        </div>

        {/* TikTok */}
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary">
                Últimos en TikTok
              </h3>
            </div>
            {ttProfileUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={ttProfileUrl} target="_blank" rel="noopener noreferrer">
                  Ver perfil completo <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tiktokLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[9/16] rounded-lg" />
                ))
              : ttVideos.length > 0
              ? ttVideos.slice(0, 10).map((url, i) => (
                  <TikTokCard key={`${url}-${i}`} url={url} />
                ))
              : Array.from({ length: 5 }).map((_, i) => (
                  <PlaceholderCard key={i} aspect="tiktok" />
                ))}
          </div>
          {!tiktokLoading && ttVideos.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-6 italic">
              Agrega los enlaces de TikTok desde el panel admin para mostrarlos
              aquí.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
