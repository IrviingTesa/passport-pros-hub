import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  Video,
  Star,
  ClipboardList,
  TrendingUp,
  Eye,
  ShieldCheck,
} from "lucide-react";
import VisitsAnalyticsCard from "@/components/admin/VisitsAnalyticsCard";
import SecretaryPermissionsCard from "@/components/admin/SecretaryPermissionsCard";
import SecretaryDashboard from "@/components/admin/SecretaryDashboard";

interface AdminCounts {
  services: number;
  staff: number;
  pendingReviews: number;
  pendingDS160: number;
  totalDS160: number;
  visitsThisMonth: number;
  pendingPermRequests: number;
}

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
};

export default function AdminDashboard() {
  const { roles, isAdmin, isSecretary } = useAuth();
  const [counts, setCounts] = useState<AdminCounts | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("staff").select("*", { count: "exact", head: true }),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("ds160_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted")
        .is("deleted_at", null),
      supabase
        .from("ds160_applications")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null),
      supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true })
        .gte("visited_at", startOfMonth()),
      supabase
        .from("ds160_edit_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]).then(([s, st, rev, ds, dsAll, pv, perm]) => {
      setCounts({
        services: s.count ?? 0,
        staff: st.count ?? 0,
        pendingReviews: rev.count ?? 0,
        pendingDS160: ds.count ?? 0,
        totalDS160: dsAll.count ?? 0,
        visitsThisMonth: pv.count ?? 0,
        pendingPermRequests: perm.count ?? 0,
      });
    });
  }, [isAdmin]);

  // SECRETARIA → vista propia
  if (isSecretary && !isAdmin) {
    return <SecretaryDashboard />;
  }

  const cards = [
    {
      icon: ClipboardList,
      label: "DS-160 por revisar",
      value: counts?.pendingDS160 ?? "—",
      color: "text-primary",
      to: "/admin/ds160",
    },
    {
      icon: TrendingUp,
      label: "Visitas este mes",
      value: counts?.visitsThisMonth ?? "—",
      color: "text-accent",
    },
    {
      icon: Star,
      label: "Reseñas pendientes",
      value: counts?.pendingReviews ?? "—",
      color: "text-accent",
      to: "/admin/resenas",
    },
    {
      icon: ShieldCheck,
      label: "Solicitudes de edición",
      value: counts?.pendingPermRequests ?? "—",
      color: "text-destructive",
    },
    {
      icon: Eye,
      label: "DS-160 totales",
      value: counts?.totalDS160 ?? "—",
      color: "text-primary",
    },
    {
      icon: Briefcase,
      label: "Servicios activos",
      value: counts?.services ?? "—",
      color: "text-primary",
      to: "/admin/servicios",
    },
    {
      icon: Users,
      label: "Personal",
      value: counts?.staff ?? "—",
      color: "text-accent",
      to: "/admin/personal",
    },
    {
      icon: Video,
      label: "Videos",
      value: "—",
      color: "text-primary",
      to: "/admin/videos",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary">Inicio</h1>
        <p className="text-muted-foreground mt-1">
          Resumen general de Asesores Migratorios.&nbsp;
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
        {cards.map(({ icon: Icon, label, value, color, to }) => {
          const Inner = (
            <Card className={to ? "hover:shadow-md transition-shadow cursor-pointer h-full" : "h-full"}>
              <CardContent className="pt-6">
                <Icon className={`w-7 h-7 ${color} mb-3`} />
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </CardContent>
            </Card>
          );
          return to ? (
            <Link key={label} to={to}>
              {Inner}
            </Link>
          ) : (
            <div key={label}>{Inner}</div>
          );
        })}
      </div>

      <VisitsAnalyticsCard />

      <SecretaryPermissionsCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accesos rápidos</CardTitle>
          <CardDescription>Las gestiones más frecuentes.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/ds160">
              <ClipboardList className="w-4 h-4" /> Solicitudes DS-160
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/resenas">
              <Star className="w-4 h-4" /> Aprobar reseñas
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/servicios">
              <Briefcase className="w-4 h-4" /> Servicios
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/personal">
              <Users className="w-4 h-4" /> Personal
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
