import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Loader2,
  ShieldAlert,
  KeyRound,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Upload,
  UserCog,
} from "lucide-react";

type Role = "admin" | "secretary";

interface InternalUser {
  id: string;
  email: string | null;
  full_name: string | null;
  roles: Role[];
  created_at: string;
  last_sign_in_at: string | null;
  is_active: boolean;
}

interface StaffProfile {
  id: string;
  user_id: string | null;
  full_name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  whatsapp_number: string | null;
  email: string | null;
  display_order: number;
  is_active: boolean;
}

const emptyCreate = {
  email: "",
  password: "",
  full_name: "",
  role: "secretary" as Role,
  create_profile: false,
  profile: {
    position: "",
    bio: "",
    photo_url: "",
    whatsapp_number: "",
    visible_email: "",
    display_order: 0,
    is_active: true,
  },
};

const emptyProfile = {
  position: "",
  bio: "",
  photo_url: "",
  whatsapp_number: "",
  visible_email: "",
  display_order: 0,
  is_active: true,
};

function genPwd() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    "!"
  );
}

export default function UsersAdmin() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [profiles, setProfiles] = useState<Record<string, StaffProfile>>({});
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [openCreate, setOpenCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyCreate);
  const [showCreatePwd, setShowCreatePwd] = useState(false);

  // Edit dialog
  const [editing, setEditing] = useState<InternalUser | null>(null);
  const [editForm, setEditForm] = useState({
    email: "",
    full_name: "",
    role: "secretary" as Role,
    is_active: true,
  });
  const [editProfile, setEditProfile] = useState(emptyProfile);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileEnabled, setProfileEnabled] = useState(false);

  // Password view/edit
  const [pwdValue, setPwdValue] = useState<string | null>(null);
  const [pwdStale, setPwdStale] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);

  const [resetResult, setResetResult] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: usersData, error: usersErr }, { data: staffData }] =
      await Promise.all([
        supabase.functions.invoke("manage-users", { body: { type: "list" } }),
        supabase.from("staff").select("*"),
      ]);
    if (usersErr) toast.error(usersErr.message);
    setUsers((usersData?.users as InternalUser[]) ?? []);
    const map: Record<string, StaffProfile> = {};
    (staffData as StaffProfile[] | null)?.forEach((s) => {
      if (s.user_id) map[s.user_id] = s;
    });
    setProfiles(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ============ Photo upload ============
  const uploadPhoto = async (file: File, onUrl: (url: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("staff-photos")
      .upload(path, file, { contentType: file.type });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("staff-photos").getPublicUrl(path);
    onUrl(data.publicUrl);
    setUploading(false);
    toast.success("Foto subida");
  };

  // ============ Create ============
  const create = async () => {
    if (
      !form.email.trim() ||
      !form.password ||
      !form.full_name.trim() ||
      !form.role
    ) {
      toast.error("Completa todos los campos");
      return;
    }
    if (form.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (form.create_profile && !form.profile.position.trim()) {
      toast.error("La ficha pública requiere el cargo");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: {
        type: "create",
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        role: form.role,
      },
    });
    if (error || data?.error) {
      setBusy(false);
      toast.error(error?.message ?? data?.error ?? "Error al crear");
      return;
    }
    const newUserId = data.user_id as string;

    if (form.create_profile) {
      const { error: pErr } = await supabase.from("staff").insert({
        user_id: newUserId,
        full_name: form.full_name.trim(),
        position: form.profile.position.trim(),
        bio: form.profile.bio?.trim() || null,
        photo_url: form.profile.photo_url?.trim() || null,
        whatsapp_number: form.profile.whatsapp_number?.trim() || null,
        email: form.profile.visible_email?.trim() || form.email.trim(),
        display_order: form.profile.display_order,
        is_active: form.profile.is_active,
      });
      if (pErr) toast.error("Cuenta creada, pero falló la ficha: " + pErr.message);
    }

    setBusy(false);
    toast.success("Cuenta creada");
    setOpenCreate(false);
    setForm(emptyCreate);
    setShowCreatePwd(false);
    load();
  };

  // ============ Edit ============
  const openEdit = (u: InternalUser) => {
    setEditing(u);
    setEditForm({
      email: u.email ?? "",
      full_name: u.full_name ?? "",
      role: (u.roles[0] as Role) ?? "secretary",
      is_active: u.is_active,
    });
    const p = profiles[u.id];
    if (p) {
      setHasProfile(true);
      setProfileEnabled(true);
      setEditProfile({
        position: p.position,
        bio: p.bio ?? "",
        photo_url: p.photo_url ?? "",
        whatsapp_number: p.whatsapp_number ?? "",
        visible_email: p.email ?? "",
        display_order: p.display_order,
        is_active: p.is_active,
      });
    } else {
      setHasProfile(false);
      setProfileEnabled(false);
      setEditProfile(emptyProfile);
    }
    setPwdValue(null);
    setPwdStale(false);
    setShowPwd(false);
    setNewPwd("");
    setShowNewPwd(false);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setBusy(true);

    // Account
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: {
        type: "update_account",
        user_id: editing.id,
        email: editForm.email.trim() !== editing.email ? editForm.email.trim() : undefined,
        full_name:
          editForm.full_name.trim() !== editing.full_name
            ? editForm.full_name.trim()
            : undefined,
        role:
          editForm.role !== (editing.roles[0] ?? "secretary")
            ? editForm.role
            : undefined,
        is_active:
          editForm.is_active !== editing.is_active ? editForm.is_active : undefined,
      },
    });
    if (error || data?.error) {
      setBusy(false);
      toast.error(error?.message ?? data?.error ?? "Error al actualizar");
      return;
    }

    // Public profile
    const existing = profiles[editing.id];
    if (profileEnabled) {
      if (!editProfile.position.trim()) {
        setBusy(false);
        toast.error("La ficha pública requiere el cargo");
        return;
      }
      const payload = {
        user_id: editing.id,
        full_name: editForm.full_name.trim(),
        position: editProfile.position.trim(),
        bio: editProfile.bio?.trim() || null,
        photo_url: editProfile.photo_url?.trim() || null,
        whatsapp_number: editProfile.whatsapp_number?.trim() || null,
        email: editProfile.visible_email?.trim() || editForm.email.trim(),
        display_order: editProfile.display_order,
        is_active: editProfile.is_active,
      };
      const { error: pErr } = existing
        ? await supabase.from("staff").update(payload).eq("id", existing.id)
        : await supabase.from("staff").insert(payload);
      if (pErr) {
        setBusy(false);
        toast.error("Cuenta guardada, pero falló la ficha: " + pErr.message);
        return;
      }
    } else if (existing) {
      // disabled -> delete the public profile
      const { error: dErr } = await supabase
        .from("staff")
        .delete()
        .eq("id", existing.id);
      if (dErr) {
        setBusy(false);
        toast.error("No se pudo eliminar la ficha pública: " + dErr.message);
        return;
      }
    }

    setBusy(false);
    toast.success("Cambios guardados");
    setEditing(null);
    load();
  };

  // ============ Password view/set ============
  const viewPwd = async () => {
    if (!editing) return;
    if (
      !confirm(
        `Vas a ver la contraseña de ${editing.email}. La acción quedará registrada en el historial. ¿Continuar?`,
      )
    )
      return;
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { type: "get_password", user_id: editing.id },
    });
    if (error || data?.error) {
      toast.error(error?.message ?? data?.error ?? "Error");
      return;
    }
    if (!data.password) {
      toast.message(
        data.message ?? "Sin registro de contraseña. Resetéala para obtener una nueva.",
      );
      return;
    }
    setPwdValue(data.password);
    setPwdStale(!!data.is_stale);
    setShowPwd(true);
  };

  const saveNewPwd = async () => {
    if (!editing) return;
    if (newPwd.length < 8) {
      toast.error("Mínimo 8 caracteres");
      return;
    }
    if (
      !confirm(
        `Vas a cambiar la contraseña de ${editing.email}. La contraseña anterior dejará de funcionar. ¿Continuar?`,
      )
    )
      return;
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { type: "set_password", user_id: editing.id, password: newPwd },
    });
    if (error || data?.error) {
      toast.error(error?.message ?? data?.error ?? "Error");
      return;
    }
    toast.success("Contraseña actualizada");
    setPwdValue(newPwd);
    setPwdStale(false);
    setNewPwd("");
    setShowNewPwd(false);
  };

  // ============ Delete + Reset (list-level) ============
  const remove = async (u: InternalUser) => {
    if (
      !confirm(
        `¿Eliminar la cuenta de ${u.email}? Esta acción no se puede deshacer.`,
      )
    )
      return;
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { type: "delete", user_id: u.id },
    });
    if (error || data?.error) {
      toast.error(error?.message ?? data?.error ?? "Error");
      return;
    }
    toast.success("Cuenta eliminada");
    load();
  };

  const resetPassword = async (u: InternalUser) => {
    if (
      !confirm(
        `Se generará una contraseña temporal para ${u.email}. La contraseña anterior dejará de funcionar. ¿Continuar?`,
      )
    )
      return;
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { type: "reset_password", user_id: u.id },
    });
    if (error || data?.error) {
      toast.error(error?.message ?? data?.error ?? "Error");
      return;
    }
    setResetResult({ email: u.email ?? "—", password: data.password });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">
            Cuentas internas
          </h1>
          <p className="text-muted-foreground mt-1">
            Accesos al sistema y ficha pública opcional del personal.
          </p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" /> Nueva cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear cuenta interna</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">
                  Datos de acceso
                </h3>
                <div>
                  <Label>Nombre completo</Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={150}
                  />
                </div>
                <div>
                  <Label>Contraseña</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showCreatePwd ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        placeholder="Mínimo 8 caracteres"
                        className="pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePwd((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showCreatePwd ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setForm({ ...form, password: genPwd() })}
                      title="Generar"
                    >
                      <KeyRound className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Rol</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm({ ...form, role: v as Role })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secretary">Secretaria</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <section className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="create_profile"
                    checked={form.create_profile}
                    onCheckedChange={(c) =>
                      setForm({ ...form, create_profile: c === true })
                    }
                  />
                  <Label htmlFor="create_profile" className="cursor-pointer">
                    Crear ficha pública del personal
                  </Label>
                </div>

                {form.create_profile && (
                  <div className="space-y-3 pl-6 border-l-2">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={form.profile.photo_url || undefined}
                        />
                        <AvatarFallback>
                          {form.full_name.slice(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f)
                              uploadPhoto(f, (url) =>
                                setForm((fm) => ({
                                  ...fm,
                                  profile: { ...fm.profile, photo_url: url },
                                })),
                              );
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Subir foto
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Cargo *</Label>
                      <Input
                        value={form.profile.position}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            profile: { ...form.profile, position: e.target.value },
                          })
                        }
                        placeholder="Ej: Abogada titular"
                      />
                    </div>
                    <div>
                      <Label>Descripción corta</Label>
                      <Textarea
                        rows={2}
                        value={form.profile.bio}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            profile: { ...form.profile, bio: e.target.value },
                          })
                        }
                        maxLength={500}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Teléfono visible</Label>
                        <Input
                          value={form.profile.whatsapp_number}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              profile: {
                                ...form.profile,
                                whatsapp_number: e.target.value,
                              },
                            })
                          }
                          placeholder="5512345678"
                        />
                      </div>
                      <div>
                        <Label>Correo visible</Label>
                        <Input
                          value={form.profile.visible_email}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              profile: {
                                ...form.profile,
                                visible_email: e.target.value,
                              },
                            })
                          }
                          placeholder="Usa email de acceso si lo dejas vacío"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Orden</Label>
                        <Input
                          type="number"
                          value={form.profile.display_order}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              profile: {
                                ...form.profile,
                                display_order: Number(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-end gap-2 pb-2">
                        <Switch
                          checked={form.profile.is_active}
                          onCheckedChange={(v) =>
                            setForm({
                              ...form,
                              profile: { ...form.profile, is_active: v },
                            })
                          }
                        />
                        <Label>Visible en sitio</Label>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>
                Cancelar
              </Button>
              <Button onClick={create} disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cuentas registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Sin cuentas internas.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ficha pública</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isMe = u.id === currentUser?.id;
                  const role = u.roles[0] ?? null;
                  const profile = profiles[u.id];
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">
                          {u.full_name ?? "—"}
                          {isMe && (
                            <Badge variant="outline" className="ml-2">
                              Tú
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        {role ? (
                          <Badge variant="secondary">
                            {role === "admin" ? "Administrador" : "Secretaria"}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <ShieldAlert className="w-3 h-3" /> Sin rol
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.is_active ? (
                          <Badge variant="outline" className="text-green-600 border-green-600/50">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-destructive border-destructive/50">
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {profile ? (
                          <Badge variant="outline">
                            {profile.position}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Editar"
                          onClick={() => openEdit(u)}
                        >
                          <UserCog className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Resetear contraseña"
                          onClick={() => resetPassword(u)}
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Eliminar"
                          onClick={() => remove(u)}
                          disabled={isMe}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar cuenta interna</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">
                  Datos de acceso
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      value={editForm.full_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <Select
                      value={editForm.role}
                      onValueChange={(v) =>
                        setEditForm({ ...editForm, role: v as Role })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="secretary">Secretaria</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2 pb-2">
                    <Switch
                      checked={editForm.is_active}
                      onCheckedChange={(v) =>
                        setEditForm({ ...editForm, is_active: v })
                      }
                      disabled={editing.id === currentUser?.id}
                    />
                    <Label>Cuenta activa</Label>
                  </div>
                </div>
              </section>

              <section className="space-y-3 border-t pt-4">
                <h3 className="text-sm font-semibold text-primary">
                  Contraseña
                </h3>
                {pwdValue ? (
                  <div>
                    <Label>Contraseña actual</Label>
                    <div className="relative">
                      <Input
                        type={showPwd ? "text" : "password"}
                        readOnly
                        value={pwdValue}
                        className="pr-20"
                      />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowPwd((s) => !s)}
                        >
                          {showPwd ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(pwdValue);
                            toast.success("Copiada");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {pwdStale && (
                      <p className="text-xs text-amber-600 mt-1">
                        El usuario pudo haberla cambiado después. Si no
                        funciona, resetéala.
                      </p>
                    )}
                  </div>
                ) : (
                  <Button type="button" variant="outline" onClick={viewPwd}>
                    <Eye className="w-4 h-4" /> Ver contraseña actual
                  </Button>
                )}

                <div>
                  <Label>Cambiar contraseña</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showNewPwd ? "text" : "password"}
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showNewPwd ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNewPwd(genPwd())}
                    >
                      <KeyRound className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={saveNewPwd}
                      disabled={!newPwd}
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              </section>

              <section className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={profileEnabled}
                    onCheckedChange={setProfileEnabled}
                  />
                  <Label className="cursor-pointer">
                    {hasProfile ? "Ficha pública activa" : "Crear ficha pública"}
                  </Label>
                </div>

                {profileEnabled && (
                  <div className="space-y-3 pl-6 border-l-2">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={editProfile.photo_url || undefined} />
                        <AvatarFallback>
                          {editForm.full_name.slice(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="edit-photo-input"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f)
                              uploadPhoto(f, (url) =>
                                setEditProfile((p) => ({ ...p, photo_url: url })),
                              );
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("edit-photo-input")?.click()
                          }
                          disabled={uploading}
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Subir foto
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Cargo *</Label>
                      <Input
                        value={editProfile.position}
                        onChange={(e) =>
                          setEditProfile({ ...editProfile, position: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Descripción corta</Label>
                      <Textarea
                        rows={2}
                        value={editProfile.bio}
                        onChange={(e) =>
                          setEditProfile({ ...editProfile, bio: e.target.value })
                        }
                        maxLength={500}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Teléfono visible</Label>
                        <Input
                          value={editProfile.whatsapp_number}
                          onChange={(e) =>
                            setEditProfile({
                              ...editProfile,
                              whatsapp_number: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Correo visible</Label>
                        <Input
                          value={editProfile.visible_email}
                          onChange={(e) =>
                            setEditProfile({
                              ...editProfile,
                              visible_email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Orden</Label>
                        <Input
                          type="number"
                          value={editProfile.display_order}
                          onChange={(e) =>
                            setEditProfile({
                              ...editProfile,
                              display_order: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-end gap-2 pb-2">
                        <Switch
                          checked={editProfile.is_active}
                          onCheckedChange={(v) =>
                            setEditProfile({ ...editProfile, is_active: v })
                          }
                        />
                        <Label>Visible en sitio</Label>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cerrar
            </Button>
            <Button onClick={saveEdit} disabled={busy}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset result */}
      <Dialog
        open={!!resetResult}
        onOpenChange={(o) => !o && setResetResult(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contraseña temporal generada</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Compártela con <strong>{resetResult?.email}</strong> de forma
              segura. La contraseña anterior ya no funciona.
            </p>
            <div className="flex gap-2">
              <Input readOnly value={resetResult?.password ?? ""} />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (resetResult?.password) {
                    navigator.clipboard.writeText(resetResult.password);
                    toast.success("Copiada");
                  }
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setResetResult(null)}>Listo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
