import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Lock,
  Trash2,
  RotateCcw,
  Trash,
} from "lucide-react";
import { STATUS_LABELS } from "@/lib/ds160-options";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSecretaryEditPermission } from "@/hooks/useSecretaryEditPermission";

interface Application {
  id: string;
  email: string;
  full_name: string;
  purpose_of_trip: string | null;
  embassy: string | null;
  status: string;
  current_step: number;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  form_data: Record<string, unknown>;
  user_id: string | null;
  deleted_at: string | null;
  previous_status: string | null;
}

const STATUS_TABS = [
  { value: "submitted", label: "Enviadas" },
  { value: "in_review", label: "En revisión" },
  { value: "completed", label: "Completadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "draft", label: "Borradores" },
  { value: "trash", label: "Papelera" },
];

export default function DS160Admin() {
  const { user, isAdmin, isSecretary } = useAuth();
  const { hasActive: secretaryCanEdit } = useSecretaryEditPermission();
  const canEdit = isAdmin || (isSecretary && secretaryCanEdit);

  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("submitted");
  const [selected, setSelected] = useState<Application | null>(null);
  const [updating, setUpdating] = useState(false);
  const [confirmSoftDelete, setConfirmSoftDelete] = useState<Application | null>(null);
  const [confirmHardDelete, setConfirmHardDelete] = useState<Application | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ds160_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Error al cargar solicitudes");
      setItems([]);
    } else {
      setItems((data ?? []) as unknown as Application[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) =>
    tab === "trash" ? i.deleted_at !== null : i.deleted_at === null && i.status === tab,
  );

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("ds160_applications")
      .update({ status: newStatus })
      .eq("id", id);
    setUpdating(false);
    if (error) {
      toast.error("No se pudo actualizar el estado");
      return;
    }
    toast.success("Estado actualizado");
    setSelected((s) => (s ? { ...s, status: newStatus } : s));
    load();
  };

  const softDelete = async (app: Application) => {
    setUpdating(true);
    const { error } = await supabase.rpc("soft_delete_ds160", { _id: app.id });
    setUpdating(false);
    setConfirmSoftDelete(null);
    if (error) return toast.error(error.message);
    toast.success("Solicitud enviada a papelera");
    load();
  };

  const restore = async (app: Application) => {
    setUpdating(true);
    const { error } = await supabase.rpc("restore_ds160", { _id: app.id });
    setUpdating(false);
    if (error) return toast.error(error.message);
    toast.success("Solicitud restaurada");
    load();
  };

  const hardDelete = async (app: Application) => {
    setUpdating(true);
    const { error } = await supabase.rpc("hard_delete_ds160", { _id: app.id });
    setUpdating(false);
    setConfirmHardDelete(null);
    if (error) return toast.error(error.message);
    toast.success("Solicitud eliminada definitivamente");
    load();
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary">Solicitudes DS-160</h1>
        <p className="text-muted-foreground mt-1">
          Pre-registros de visa americana enviados por los clientes.
        </p>
      </div>

      {!canEdit && (
        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="pt-4 pb-4 flex items-center gap-3 text-sm">
            <Lock className="w-4 h-4 text-accent flex-shrink-0" />
            <span>
              Estás en modo <strong>solo lectura</strong>. Para editar el
              estado de una solicitud, pide autorización al administrador
              desde el panel de inicio.
            </span>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          {STATUS_TABS.map((t) => {
            const count =
              t.value === "trash"
                ? items.filter((i) => i.deleted_at !== null).length
                : items.filter(
                    (i) => i.deleted_at === null && i.status === t.value,
                  ).length;
            return (
              <TabsTrigger key={t.value} value={t.value} className="gap-2">
                {t.value === "trash" && <Trash2 className="w-3.5 h-3.5" />}
                {t.label}
                {count > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {STATUS_TABS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-4">
            {t.value === "trash" && (
              <div className="mb-3 rounded-md border border-accent/40 bg-accent/5 px-3 py-2 text-xs text-muted-foreground">
                Las solicitudes en la papelera se eliminan definitivamente de forma automática después de 6 meses.
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No hay solicitudes en esta categoría.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((app) => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">
                              {app.full_name || "(Sin nombre)"}
                            </h3>
                            <Badge
                              className={cn(
                                "text-xs",
                                STATUS_LABELS[app.status]?.color,
                              )}
                              variant="outline"
                            >
                              {STATUS_LABELS[app.status]?.label ?? app.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3" /> {app.email}
                            </div>
                            <div>
                              {app.purpose_of_trip && (
                                <span className="mr-3">📍 {app.purpose_of_trip}</span>
                              )}
                              {app.embassy && <span>🏛️ {app.embassy}</span>}
                            </div>
                            <div className="text-xs">
                              Folio: <strong>{app.id.slice(0, 8).toUpperCase()}</strong> ·{" "}
                              {new Date(app.created_at).toLocaleString("es-MX")}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 items-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelected(app);
                              if (user) {
                                supabase
                                  .from("ds160_access_log")
                                  .insert({
                                    user_id: user.id,
                                    ds160_id: app.id,
                                    ds160_full_name: app.full_name,
                                  })
                                  .then(() => {});
                              }
                            }}
                          >
                            <Eye className="w-4 h-4" /> Ver detalle
                          </Button>
                          {tab === "trash" ? (
                            <>
                              {canEdit && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => restore(app)}
                                  disabled={updating}
                                >
                                  <RotateCcw className="w-4 h-4" /> Restaurar
                                </Button>
                              )}
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setConfirmHardDelete(app)}
                                  disabled={updating}
                                >
                                  <Trash className="w-4 h-4" /> Eliminar
                                </Button>
                              )}
                            </>
                          ) : (
                            canEdit && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirmSoftDelete(app)}
                                disabled={updating}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" /> A papelera
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">
                  {selected.full_name || "Sin nombre"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Folio: {selected.id.slice(0, 8).toUpperCase()}
                </p>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex items-center justify-between border rounded-md p-3 bg-muted/30">
                  <span className="text-sm font-medium">Estado:</span>
                  <Select
                    value={selected.status}
                    onValueChange={(v) => updateStatus(selected.id, v)}
                    disabled={updating || !canEdit}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DetailSection title="Información del trámite" icon={Calendar}>
                  <DetailRow label="Propósito" value={selected.purpose_of_trip} />
                  <DetailRow label="Embajada/Consulado" value={selected.embassy} />
                  <DetailRow
                    label="Enviada"
                    value={
                      selected.submitted_at
                        ? new Date(selected.submitted_at).toLocaleString("es-MX")
                        : "—"
                    }
                  />
                </DetailSection>

                <DetailSection title="Datos personales" icon={User}>
                  <DetailRow label="Nombre(s)" value={fd(selected, "first_name")} />
                  <DetailRow label="Apellido(s)" value={fd(selected, "last_name")} />
                  <DetailRow label="Otros nombres" value={fd(selected, "other_names")} />
                  <DetailRow
                    label="Sexo"
                    value={fd(selected, "sex") === "female" ? "Mujer" : fd(selected, "sex") === "male" ? "Hombre" : null}
                  />
                  <DetailRow label="Fecha de nacimiento" value={fd(selected, "birth_date")} />
                  <DetailRow label="Ciudad de nacimiento" value={fd(selected, "birth_city")} />
                  <DetailRow label="Estado de nacimiento" value={fd(selected, "birth_state")} />
                  <DetailRow label="País de nacimiento" value={fd(selected, "birth_country")} />
                  <DetailRow label="Nacionalidad" value={fd(selected, "nationality")} />
                </DetailSection>

                <DetailSection title="Contacto" icon={Mail}>
                  <DetailRow label="Email principal" value={selected.email} />
                  <DetailRow label="Otros emails" value={fd(selected, "other_emails")} />
                  <DetailRow
                    label="Teléfono"
                    value={
                      fd(selected, "phone_country_code") && fd(selected, "phone_number")
                        ? `${fd(selected, "phone_country_code")} ${fd(selected, "phone_number")}`
                        : null
                    }
                  />
                  <DetailRow label="Otros teléfonos" value={fd(selected, "other_phones")} />
                </DetailSection>

                <DetailSection title="Domicilio" icon={MapPin}>
                  <DetailRow label="Dirección" value={fd(selected, "address_line1")} />
                  <DetailRow label="Línea 2" value={fd(selected, "address_line2")} />
                  <DetailRow label="Ciudad" value={fd(selected, "city")} />
                  <DetailRow label="Estado" value={fd(selected, "state")} />
                  <DetailRow label="CP" value={fd(selected, "postal_code")} />
                  <DetailRow label="País de residencia" value={fd(selected, "residence_country")} />
                </DetailSection>

                <DetailSection title="Viaje" icon={Phone}>
                  <DetailRow
                    label="¿Viaja con otros?"
                    value={fd(selected, "traveling_with_others") === "yes" ? "Sí" : "No"}
                  />
                  <DetailRow label="Acompañantes" value={fd(selected, "travel_companions")} />
                </DetailSection>

                <DetailSection title="Trabajo" icon={User}>
                  <DetailRow label="Lugar donde trabaja" value={fd(selected, "work_place")} />
                  <DetailRow label="Puesto" value={fd(selected, "work_position")} />
                  <DetailRow label="Dirección de la empresa" value={fd(selected, "work_address")} />
                  <DetailRow label="Sueldo mensual" value={fd(selected, "work_monthly_salary")} />
                  <DetailRow label="Teléfono empresa" value={fd(selected, "work_phone")} />
                  <DetailRow label="Fecha de ingreso" value={fd(selected, "work_start_date")} />
                </DetailSection>

                <DetailSection title="Viajes / Renovación" icon={Calendar}>
                  <DetailRow
                    label="¿Es renovación?"
                    value={fd(selected, "is_renewal") === "yes" ? "Sí" : "No"}
                  />
                  <DetailRow label="Fecha último viaje" value={fd(selected, "last_trip_date")} />
                  <DetailRow label="Ciudades visitadas" value={fd(selected, "cities_visited")} />
                  <DetailRow label="Tiempo de estancia" value={fd(selected, "stay_duration")} />
                </DetailSection>

                <DetailSection title="Contacto en EE.UU." icon={MapPin}>
                  <DetailRow
                    label="Tipo de contacto"
                    value={
                      fd(selected, "us_contact_type") === "family"
                        ? "Familiar / conocido"
                        : fd(selected, "us_contact_type") === "hotel"
                          ? "Hotel"
                          : null
                    }
                  />
                  {fd(selected, "us_contact_type") === "family" ? (
                    <>
                      <DetailRow label="Nombre completo" value={fd(selected, "us_family_full_name")} />
                      <DetailRow label="Parentesco" value={fd(selected, "us_family_relationship")} />
                      <DetailRow label="Dirección" value={fd(selected, "us_family_address")} />
                      <DetailRow label="Teléfono" value={fd(selected, "us_family_phone")} />
                      <DetailRow label="Estatus migratorio" value={fd(selected, "us_family_status")} />
                    </>
                  ) : (
                    <>
                      <DetailRow label="Nombre del hotel" value={fd(selected, "us_hotel_name")} />
                      <DetailRow label="Dirección del hotel" value={fd(selected, "us_hotel_address")} />
                    </>
                  )}
                </DetailSection>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmSoftDelete}
        onOpenChange={(o) => !o && setConfirmSoftDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar a papelera</AlertDialogTitle>
            <AlertDialogDescription>
              La solicitud de <strong>{confirmSoftDelete?.full_name}</strong> se
              moverá a la papelera. Podrás restaurarla o eliminarla
              definitivamente después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmSoftDelete && softDelete(confirmSoftDelete)}
            >
              Enviar a papelera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmHardDelete}
        onOpenChange={(o) => !o && setConfirmHardDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar definitivamente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La solicitud de{" "}
              <strong>{confirmHardDelete?.full_name}</strong> se borrará
              permanentemente de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmHardDelete && hardDelete(confirmHardDelete)}
            >
              Eliminar definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function fd(app: Application, key: string): string | null {
  const v = app.form_data?.[key];
  if (v == null || v === "") return null;
  return String(v);
}

function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="font-semibold text-primary flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" /> {title}
      </h4>
      <div className="border rounded-md divide-y">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium break-words">{value || "—"}</span>
    </div>
  );
}
