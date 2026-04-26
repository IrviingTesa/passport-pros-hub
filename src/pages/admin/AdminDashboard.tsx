import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Video, Star, ClipboardList } from "lucide-react";

interface Counts {
  services: number;
  staff: number;
  ytConfigured: boolean;
  pendingReviews: number;
  pendingDS160: number;
}

export default function AdminDashboard() {
  const { roles, isAdmin } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("staff").select("*", { count: "exact", head: true }),
      supabase
        .from("video_channels")
        .select("youtube_channel_id")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("ds160_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted"),
    ]).then(([s, st, yt, rev, ds]) => {
      setCounts({
        services: s.count ?? 0,
        staff: st.count ?? 0,
        ytConfigured: !!yt.data?.youtube_channel_id,
        pendingReviews: rev.count ?? 0,
        pendingDS160: ds.count ?? 0,
      });
    });
  }, []);

  const cards = [
    {
      icon: ClipboardList,
      label: "DS-160 por revisar",
      value: counts?.pendingDS160 ?? "—",
      color: "text-primary",
    },
    {
      icon: Briefcase,
      label: "Servicios registrados",
      value: counts?.services ?? "—",
      color: "text-accent",
    },
    {
      icon: Users,
      label: "Miembros del personal",
      value: counts?.staff ?? "—",
      color: "text-primary",
    },
    {
      icon: Video,
      label: "Canal YouTube",
      value: counts?.ytConfigured ? "Configurado" : "Sin configurar",
      color: "text-destructive",
    },
    {
      icon: Star,
      label: "Reseñas pendientes",
      value: counts?.pendingReviews ?? "—",
      color: "text-accent",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary">Inicio</h1>
        <p className="text-muted-foreground mt-1">
          Resumen general del despacho.&nbsp;
          {roles.length > 0 && (
            <>
              Tu rol:&nbsp;
              {roles.map((r) => (
                <Badge key={r} variant="secondary" className="mr-1">
                  {r === "admin" ? "Administrador" : "Secretaria"}
                </Badge>
              ))}
            </>
          )}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <Icon className={`w-7 h-7 ${color} mb-3`} />
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isAdmin && (
        <Card className="border-accent/40 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-base">Acceso de secretaria</CardTitle>
            <CardDescription>
              Como secretaria puedes ver y gestionar servicios, personal y
              videos. Solo el administrador puede crear o eliminar cuentas
              internas.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
