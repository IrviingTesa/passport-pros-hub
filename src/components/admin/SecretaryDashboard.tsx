import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSecretaryEditPermission } from "@/hooks/useSecretaryEditPermission";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ClipboardList,
  Star,
  History,
  ShieldCheck,
  KeyRound,
  Loader2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Stats {
  totalDS160: number;
  pendingDS160: number;
  pendingReviews: number;
  accessesThisMonth: number;
}

interface AccessRow {
  id: string;
  ds160_id: string;
  ds160_full_name: string | null;
  accessed_at: string;
}

interface MyRequest {
  id: string;
  status: string;
  hours_requested: number;
  reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
}

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
};

export default function SecretaryDashboard() {
  const { user } = useAuth();
  const { hasActive, expiresAt, refresh } = useSecretaryEditPermission();
  const [stats, setStats] = useState<Stats | null>(null);
  const [accesses, setAccesses] = useState<AccessRow[]>([]);
  const [myRequests, setMyRequests] = useState<MyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog request edit
  const [reqOpen, setReqOpen] = useState(false);
  const [reqHours, setReqHours] = useState(24);
  const [reqReason, setReqReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [ds, dsP, rev, accThisMonth, accRecent, reqs] = await Promise.all([
      supabase.from("ds160_applications").select("*", { count: "exact", head: true }),
      supabase
        .from("ds160_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted"),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("ds160_access_log")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("accessed_at", startOfMonth()),
      supabase
        .from("ds160_access_log")
        .select("*")
        .eq("user_id", user.id)
        .order("accessed_at", { ascending: false })
        .limit(15),
      supabase
        .from("ds160_edit_requests")
        .select("*")
        .eq("secretary_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    setStats({
      totalDS160: ds.count ?? 0,
      pendingDS160: dsP.count ?? 0,
      pendingReviews: rev.count ?? 0,
      accessesThisMonth: accThisMonth.count ?? 0,
    });
    setAccesses((accRecent.data ?? []) as AccessRow[]);
    setMyRequests((reqs.data ?? []) as MyRequest[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submitRequest = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("ds160_edit_requests").insert({
      secretary_id: user.id,
      hours_requested: reqHours,
      reason: reqReason || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("No se pudo enviar la solicitud");
      return;
    }
    toast.success("Solicitud enviada al administrador");
    setReqOpen(false);
    setReqReason("");
    setReqHours(24);
    load();
  };

  const cards = [
    {
      icon: ClipboardList,
      label: "DS-160 totales",
      value: stats?.totalDS160 ?? "—",
      color: "text-primary",
    },
    {
      icon: Eye,
      label: "DS-160 por revisar",
      value: stats?.pendingDS160 ?? "—",
      color: "text-accent",
    },
    {
      icon: Star,
      label: "Reseñas pendientes",
      value: stats?.pendingReviews ?? "—",
      color: "text-accent",
    },
    {
      icon: History,
      label: "Tus accesos este mes",
      value: stats?.accessesThisMonth ?? "—",
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary">
          Panel de Secretaría
        </h1>
        <p className="text-muted-foreground mt-1">
          Consulta los DS-160 y aprueba reseñas de clientes.
        </p>
      </div>

      {/* Estado del permiso */}
      <Card
        className={
          hasActive
            ? "border-whatsapp/40 bg-whatsapp/5"
            : "border-accent/40 bg-accent/5"
        }
      >
        <CardContent className="pt-5 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck
              className={`w-8 h-8 ${
                hasActive ? "text-whatsapp" : "text-accent"
              }`}
            />
            <div>
              <div className="font-semibold">
                {hasActive
                  ? "Tienes permiso para editar DS-160"
                  : "Acceso solo de lectura"}
              </div>
              <div className="text-sm text-muted-foreground">
                {hasActive && expiresAt
                  ? `Expira ${formatDistanceToNow(new Date(expiresAt), {
                      addSuffix: true,
                      locale: es,
                    })}`
                  : "Solicita autorización al administrador para poder modificar solicitudes."}
              </div>
            </div>
          </div>
          {!hasActive && (
            <Dialog open={reqOpen} onOpenChange={setReqOpen}>
              <DialogTrigger asChild>
                <Button>
                  <KeyRound className="w-4 h-4" /> Solicitar edición
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar permiso de edición</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Duración (horas)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={72}
                      value={reqHours}
                      onChange={(e) => setReqHours(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Motivo (opcional)</Label>
                    <Textarea
                      value={reqReason}
                      onChange={(e) => setReqReason(e.target.value)}
                      placeholder="Ej. corregir datos del cliente Pérez"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={submitRequest} disabled={submitting}>
                    {submitting && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Enviar solicitud
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {hasActive && (
            <Button asChild variant="outline">
              <Link to="/admin/ds160">Ir a DS-160</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
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

      {/* Accesos directos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accesos directos</CardTitle>
          <CardDescription>Lo que puedes hacer desde aquí.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          <Button
            asChild
            variant="outline"
            className="h-auto py-4 justify-start"
          >
            <Link to="/admin/ds160">
              <ClipboardList className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Solicitudes DS-160</div>
                <div className="text-xs text-muted-foreground">
                  Consultar información de clientes
                </div>
              </div>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto py-4 justify-start"
          >
            <Link to="/admin/resenas">
              <Star className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Aprobar reseñas</div>
                <div className="text-xs text-muted-foreground">
                  {stats?.pendingReviews ?? 0} pendientes
                </div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Dos columnas: historial y solicitudes */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Historial reciente de accesos
            </CardTitle>
            <CardDescription>
              Últimos DS-160 que consultaste.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
              </div>
            ) : accesses.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Aún no has consultado ningún DS-160.
              </p>
            ) : (
              <ul className="divide-y">
                {accesses.map((a) => (
                  <li
                    key={a.id}
                    className="py-2 flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {a.ds160_full_name || "(Sin nombre)"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Folio {a.ds160_id.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(a.accessed_at), "Pp", { locale: es })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Tus solicitudes de edición
            </CardTitle>
            <CardDescription>Estado de tus peticiones al admin.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
              </div>
            ) : myRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No has enviado solicitudes todavía.
              </p>
            ) : (
              <ul className="divide-y">
                {myRequests.map((r) => (
                  <li key={r.id} className="py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{r.hours_requested}h</span>
                      {r.status === "pending" && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" /> Pendiente
                        </Badge>
                      )}
                      {r.status === "approved" && (
                        <Badge className="bg-whatsapp text-white gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aprobada
                        </Badge>
                      )}
                      {r.status === "rejected" && (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="w-3 h-3" /> Rechazada
                        </Badge>
                      )}
                    </div>
                    {r.reason && (
                      <p className="text-xs italic text-muted-foreground mt-1">
                        "{r.reason}"
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(r.created_at), "PPp", { locale: es })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
