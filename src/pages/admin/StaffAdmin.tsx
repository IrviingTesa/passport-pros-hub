import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Loader2, Upload } from "lucide-react";

interface Staff {
  id: string;
  full_name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  whatsapp_number: string | null;
  email: string | null;
  display_order: number;
  is_active: boolean;
}

const emptyForm: Omit<Staff, "id"> = {
  full_name: "",
  position: "",
  bio: "",
  photo_url: "",
  whatsapp_number: "",
  email: "",
  display_order: 0,
  is_active: true,
};

export default function StaffAdmin() {
  const [items, setItems] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data as Staff[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    setForm({
      full_name: s.full_name,
      position: s.position,
      bio: s.bio ?? "",
      photo_url: s.photo_url ?? "",
      whatsapp_number: s.whatsapp_number ?? "",
      email: s.email ?? "",
      display_order: s.display_order,
      is_active: s.is_active,
    });
    setOpen(true);
  };

  const handlePhotoUpload = async (file: File) => {
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
    const { data: urlData } = supabase.storage
      .from("staff-photos")
      .getPublicUrl(path);
    setForm((f) => ({ ...f, photo_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Foto subida");
  };

  const save = async () => {
    if (!form.full_name.trim() || !form.position.trim()) {
      toast.error("Nombre y puesto son obligatorios");
      return;
    }
    setBusy(true);
    const payload = {
      ...form,
      full_name: form.full_name.trim(),
      position: form.position.trim(),
      bio: form.bio?.trim() || null,
      photo_url: form.photo_url?.trim() || null,
      whatsapp_number: form.whatsapp_number?.trim() || null,
      email: form.email?.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("staff").update(payload).eq("id", editing.id)
      : await supabase.from("staff").insert(payload);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Personal actualizado" : "Personal agregado");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este miembro del personal?")) return;
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminado");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">
            Personal del despacho
          </h1>
          <p className="text-muted-foreground mt-1">
            Quienes aparecerán en la sección "Conoce al equipo" del sitio público.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" /> Agregar persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar persona" : "Nueva persona"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={form.photo_url ?? undefined} />
                  <AvatarFallback>
                    {form.full_name.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handlePhotoUpload(f);
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
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG/PNG, máx 5MB
                  </p>
                </div>
              </div>
              <div>
                <Label>Nombre completo *</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Puesto *</Label>
                <Input
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="Ej: Abogada titular"
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Biografía corta</Label>
                <Textarea
                  value={form.bio ?? ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>WhatsApp (10 dígitos sin +52)</Label>
                  <Input
                    value={form.whatsapp_number ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, whatsapp_number: e.target.value })
                    }
                    placeholder="5512345678"
                    maxLength={20}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={150}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Orden</Label>
                  <Input
                    type="number"
                    value={form.display_order}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        display_order: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex items-end gap-2 pb-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <Label>Activo</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipo registrado</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Aún no hay personal registrado.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((s) => (
                <Card key={s.id} className={!s.is_active ? "opacity-60" : ""}>
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={s.photo_url ?? undefined} />
                        <AvatarFallback>
                          {s.full_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">
                          {s.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {s.position}
                        </div>
                        {!s.is_active && (
                          <span className="text-xs text-destructive">
                            Inactivo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-1 mt-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(s)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(s.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
