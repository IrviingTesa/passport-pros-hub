import { useEffect, useState } from "react";
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
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

interface Service {
  id: string;
  category: string;
  category_id: string | null;
  name: string;
  short_description: string | null;
  display_order: number;
  is_active: boolean;
}

const emptyForm = {
  category_id: "",
  name: "",
  short_description: "",
  display_order: 0,
  is_active: true,
};

export default function ServicesAdmin() {
  const [items, setItems] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [svcRes, catRes] = await Promise.all([
      supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("service_categories" as never)
        .select("id, name, is_active")
        .order("display_order", { ascending: true }),
    ]);
    if (svcRes.error) toast.error(svcRes.error.message);
    if (catRes.error) toast.error(catRes.error.message);
    setItems(((svcRes.data as unknown) as Service[]) ?? []);
    setCategories(((catRes.data as unknown) as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" });
    setOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      category_id: s.category_id ?? "",
      name: s.name,
      short_description: s.short_description ?? "",
      display_order: s.display_order,
      is_active: s.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Nombre obligatorio");
      return;
    }
    if (!form.category_id) {
      toast.error("Selecciona una categoría");
      return;
    }
    const cat = categories.find((c) => c.id === form.category_id);
    if (!cat) {
      toast.error("Categoría inválida");
      return;
    }
    setBusy(true);
    const payload = {
      category: cat.name, // legacy text column
      category_id: form.category_id,
      name: form.name.trim(),
      short_description: form.short_description?.trim() || null,
      display_order: form.display_order,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Servicio actualizado" : "Servicio creado");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Servicio eliminado");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Servicios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el catálogo de servicios.{" "}
            <Link
              to="/admin/categorias"
              className="text-accent underline underline-offset-2"
            >
              Administrar categorías
            </Link>
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} disabled={categories.length === 0}>
              <Plus className="w-4 h-4" /> Nuevo servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar servicio" : "Nuevo servicio"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Categoría</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {!c.is_active && "(inactiva)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nombre del servicio</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Trámite de pasaporte"
                  maxLength={150}
                />
              </div>
              <div>
                <Label>Descripción corta (opcional)</Label>
                <Textarea
                  value={form.short_description}
                  onChange={(e) =>
                    setForm({ ...form, short_description: e.target.value })
                  }
                  rows={3}
                  maxLength={300}
                />
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
                  <Label>Activo (visible en sitio)</Label>
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

      {categories.length === 0 && !loading && (
        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="pt-4 pb-4 text-sm">
            Primero crea al menos una <strong>categoría</strong> desde{" "}
            <Link to="/admin/categorias" className="text-accent underline">
              Categorías
            </Link>{" "}
            para poder agregar servicios.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Aún no hay servicios.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead className="text-center">Orden</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => {
                  const cat = categories.find((c) => c.id === s.category_id);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {cat?.name ?? s.category ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{s.name}</div>
                        {s.short_description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {s.short_description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {s.display_order}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={s.is_active ? "default" : "secondary"}>
                          {s.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
