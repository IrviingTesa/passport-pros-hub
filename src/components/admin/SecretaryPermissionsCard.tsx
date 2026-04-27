import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Check, X, Clock, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PendingRequest {
  id: string;
  secretary_id: string;
  reason: string | null;
  hours_requested: number;
  created_at: string;
  secretary_email?: string;
}

interface ActivePermission {
  id: string;
  secretary_id: string;
  expires_at: string;
  granted_at: string;
  notes: string | null;
  secretary_email?: string;
}

interface SecretaryUser {
  user_id: string;
  email: string;
}

export default function SecretaryPermissionsCard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [active, setActive] = useState<ActivePermission[]>([]);
  const [secretaries, setSecretaries] = useState<SecretaryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantSecretary, setGrantSecretary] = useState<string>("");
  const [grantHours, setGrantHours] = useState(24);
  const [grantNotes, setGrantNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [reqRes, permRes, rolesRes] = await Promise.all([
      supabase
        .from("ds160_edit_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("secretary_edit_permissions")
        .select("*")
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false }),
      supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "secretary"),
    ]);

    const userIds = new Set<string>();
    (reqRes.data ?? []).forEach((r) => userIds.add(r.secretary_id));
    (permRes.data ?? []).forEach((p) => userIds.add(p.secretary_id));
    (rolesRes.data ?? []).forEach((r) => userIds.add(r.user_id));

    let profileMap = new Map<string, string>();
    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", Array.from(userIds));
      (profiles ?? []).forEach((p) => profileMap.set(p.id, p.email ?? ""));
    }

    setRequests(
      (reqRes.data ?? []).map((r) => ({
        ...r,
        secretary_email: profileMap.get(r.secretary_id) ?? "—",
      })),
    );
    setActive(
      (permRes.data ?? []).map((p) => ({
        ...p,
        secretary_email: profileMap.get(p.secretary_id) ?? "—",
      })),
    );
    setSecretaries(
      (rolesRes.data ?? []).map((r) => ({
        user_id: r.user_id,
        email: profileMap.get(r.user_id) ?? r.user_id.slice(0, 8),
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const grantPermission = async (
    secretaryId: string,
    hours: number,
    notes: string | null,
    requestId?: string,
  ) => {
    if (!user) return;
    setSubmitting(true);
    const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("secretary_edit_permissions")
      .insert({
        secretary_id: secretaryId,
        granted_by: user.id,
        expires_at: expires,
        notes,
      });
    if (error) {
      setSubmitting(false);
      toast.error("No se pudo otorgar el permiso");
      return;
    }
    if (requestId) {
      await supabase
        .from("ds160_edit_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);
    }
    toast.success(`Permiso otorgado por ${hours}h`);
    setSubmitting(false);
    setGrantOpen(false);
    setGrantNotes("");
    load();
  };

  const rejectRequest = async (id: string) => {
    if (!user) return;
    await supabase
      .from("ds160_edit_requests")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    toast.success("Solicitud rechazada");
    load();
  };

  const revoke = async (id: string) => {
    if (!confirm("¿Revocar este permiso? La secretaria perderá acceso de inmediato."))
      return;
    await supabase
      .from("secretary_edit_permissions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    toast.success("Permiso revocado");
    load();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Permisos de edición — Secretaría
            </CardTitle>
            <CardDescription>
              Solo los administradores pueden habilitar la edición de DS-160 a
              la secretaria de forma temporal.
            </CardDescription>
          </div>
          <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={secretaries.length === 0}>
                <KeyRound className="w-4 h-4" /> Otorgar permiso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Otorgar permiso de edición</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Secretaria</Label>
                  <select
                    className="w-full border rounded-md h-10 px-3 bg-background"
                    value={grantSecretary}
                    onChange={(e) => setGrantSecretary(e.target.value)}
                  >
                    <option value="">— Selecciona —</option>
                    {secretaries.map((s) => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Duración (horas)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={grantHours}
                    onChange={(e) => setGrantHours(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Notas (opcional)</Label>
                  <Textarea
                    value={grantNotes}
                    onChange={(e) => setGrantNotes(e.target.value)}
                    placeholder="Motivo o contexto"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() =>
                    grantPermission(grantSecretary, grantHours, grantNotes || null)
                  }
                  disabled={!grantSecretary || submitting}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Otorgar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Solicitudes pendientes
                {requests.length > 0 && (
                  <Badge variant="destructive">{requests.length}</Badge>
                )}
              </h3>
              {requests.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Sin solicitudes pendientes.
                </p>
              ) : (
                <div className="space-y-2">
                  {requests.map((r) => (
                    <div
                      key={r.id}
                      className="border rounded-md p-3 flex flex-wrap items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">
                          {r.secretary_email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pide {r.hours_requested}h ·{" "}
                          {format(new Date(r.created_at), "PPp", { locale: es })}
                        </div>
                        {r.reason && (
                          <p className="text-xs mt-1 italic">"{r.reason}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            grantPermission(
                              r.secretary_id,
                              r.hours_requested,
                              r.reason,
                              r.id,
                            )
                          }
                        >
                          <Check className="w-4 h-4" /> Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRequest(r.id)}
                        >
                          <X className="w-4 h-4" /> Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Permisos activos
              </h3>
              {active.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Ninguna secretaria tiene permiso de edición ahora mismo.
                </p>
              ) : (
                <div className="space-y-2">
                  {active.map((p) => (
                    <div
                      key={p.id}
                      className="border rounded-md p-3 flex flex-wrap items-center justify-between gap-3 bg-accent/5"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {p.secretary_email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expira{" "}
                          {format(new Date(p.expires_at), "PPp", { locale: es })}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => revoke(p.id)}
                      >
                        <X className="w-4 h-4" /> Revocar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
