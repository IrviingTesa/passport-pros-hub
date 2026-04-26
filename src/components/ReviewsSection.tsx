import { useEffect, useState } from "react";
import { Star, Quote, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ReviewSubmitDialog } from "@/components/ReviewSubmitDialog";

interface Review {
  id: string;
  client_name: string;
  photo_url: string | null;
  rating: number;
  comment: string;
  service_related: string | null;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, client_name, photo_url, rating, comment, service_related")
      .eq("status", "approved")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(12);
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

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

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-lg" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground italic">
            Aún no hay reseñas publicadas. ¡Sé el primero en compartir tu
            experiencia!
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <Card
                key={r.id}
                className="p-7 shadow-card hover:shadow-elegant transition-all duration-300 border-border/60 relative"
              >
                <Quote className="absolute top-4 right-4 w-10 h-10 text-accent/15" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-accent text-accent"
                    />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed mb-6 italic line-clamp-6">
                  "{r.comment}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <Avatar className="h-11 w-11 bg-gradient-navy">
                    <AvatarImage src={r.photo_url ?? undefined} />
                    <AvatarFallback className="bg-gradient-navy text-accent font-semibold">
                      {initials(r.client_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-semibold text-primary text-sm truncate">
                      {r.client_name}
                    </div>
                    {r.service_related && (
                      <div className="text-xs text-muted-foreground truncate">
                        {r.service_related}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button onClick={() => setOpen(true)} variant="outline">
            <Plus className="w-4 h-4" />
            Comparte tu experiencia
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Las reseñas se publican tras una breve revisión.
          </p>
        </div>

        <ReviewSubmitDialog open={open} onOpenChange={setOpen} />
      </div>
    </section>
  );
};
