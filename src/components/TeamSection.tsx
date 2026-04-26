import { useEffect, useState } from "react";
import { MessageCircle, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface StaffMember {
  id: string;
  full_name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  whatsapp_number: string | null;
  email: string | null;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const waLink = (num: string, name: string) => {
  const clean = num.replace(/\D/g, "");
  const text = encodeURIComponent(
    `Hola ${name}, me gustaría más información sobre sus servicios.`,
  );
  return `https://wa.me/${clean}?text=${text}`;
};

export const TeamSection = () => {
  const [team, setTeam] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("staff")
        .select(
          "id, full_name, position, bio, photo_url, whatsapp_number, email",
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      setTeam((data as StaffMember[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (!loading && team.length === 0) return null;

  return (
    <section id="equipo" className="section-padding bg-background">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-accent font-semibold tracking-wider uppercase text-sm mb-3">
            Nuestro equipo
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Conoce al equipo del despacho
          </h2>
          <p className="text-muted-foreground text-lg">
            Profesionales comprometidos con resolver tus trámites de forma ágil
            y confiable.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((m) => (
              <Card
                key={m.id}
                className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 border-border/60 flex flex-col items-center text-center"
              >
                <Avatar className="w-24 h-24 mb-4 ring-2 ring-accent/20">
                  <AvatarImage src={m.photo_url ?? undefined} />
                  <AvatarFallback className="bg-gradient-navy text-accent font-semibold text-lg">
                    {initials(m.full_name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-serif text-xl font-bold text-primary">
                  {m.full_name}
                </h3>
                <p className="text-accent text-sm font-semibold mb-3">
                  {m.position}
                </p>
                {m.bio && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-4">
                    {m.bio}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-2 mt-auto pt-3">
                  {m.whatsapp_number && (
                    <Button asChild size="sm" variant="default">
                      <a
                        href={waLink(m.whatsapp_number, m.full_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  {m.email && (
                    <Button asChild size="sm" variant="outline">
                      <a href={`mailto:${m.email}`}>
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
