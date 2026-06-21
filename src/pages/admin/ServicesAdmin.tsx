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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Loader2, FolderTree, Briefcase } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

const emptyCat = {
  name: "",
  slug: "",
  description: "",
  display_order: 0,
  is_active: true,
};

const emptySvc = {
  category_id: "",
  name: "",
  short_description: "",
  display_order: 0,
  is_active: true,
};

export default function ServicesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Category dialog
  const [catOpen, setCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState(emptyCat);
  const [catBusy, setCatBusy] = useState(false);

  // Service dialog
  const [svcOpen, setSvcOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState<Service | null>(null);
  const [svcForm, setSvcForm] = useState(emptySvc);
  const [svcBusy, setSvcBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [svcRes, catRes] = await Promise.all([
      supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("service_categories" as never)
        .select("*")
        .order("display_order", { ascending: true }),
    ]);
    if (svcRes.error) toast.error(svcRes.error.message);
    if (catRes.error) toast.error(catRes.error.message);
    setServices(((svcRes.data as unknown) as Service[]) ?? []);
    setCategories(((catRes.data as unknown) as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ---------- Category CRUD ----------
  const openCatCreate = () => {
    setEditingCat(null);
    setCatForm(emptyCat);
    setCatOpen(true);
  };
  const openCatEdit = (c: Category) => {
    setEditingCat(c);
    setCatForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      display_order: c.display_order,
      is_active: c.is_active,
    });
    setCatOpen(true);
  };
  const saveCat = async () => {
    if (!catForm.name.trim()) return toast.error("El nombre es obligatorio");
    setCatBusy(true);
    const payload = {
      name: catForm.name.trim(),
      slug: (catForm.slug.trim() || slugify(catForm.name)).slice(0, 80),
      description: catForm.description?.trim() || null,
      display_order: catForm.display_order,
      is_active: catForm.is_active,
    };
    const { error } = editingCat
      ? await supabase
          .from("service_categories" as never)
          .update(payload as never)
          .eq("id", editingCat.id)
      : await supabase
          .from("service_categories" as never)
          .insert(payload as never);
    setCatBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editingCat ? "Categoría actualizada" : "Categoría creada");
    setCatOpen(false);
    load();
  };
  const removeCat = async (id: string) => {
    if (
      !confirm(
        "¿Eliminar esta categoría? Los servicios asociados quedarán sin categoría.",
      )
    )
      return;
    const { error } = await supabase
      .from("service_categories" as never)
      .delete()
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Categoría eliminada");
    load();
  };
  const toggleCatActive = async (c: Category) => {
    const { error } = await supabase
      .from("service_categories" as never)
      .update({ is_active: !c.is_active } as never)
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    load();
  };

  // ---------- Service CRUD ----------
  const openSvcCreate = (categoryId?: string) => {
    setEditingSvc(null);
    setSvcForm({ ...emptySvc, category_id: categoryId ?? categories[0]?.id ?? "" });
    setSvcOpen(true);
  };
  const openSvcEdit = (s: Service) => {
    setEditingSvc(s);
    setSvcForm({
      category_id: s.category_id ?? "",
      name: s.name,
      short_description: s.short_description ?? "",
      display_order: s.display_order,
      is_active: s.is_active,
    });
    setSvcOpen(true);
  };
  const saveSvc = async () => {
    if (!svcForm.name.trim()) return toast.error("Nombre obligatorio");
    if (!svcForm.category_id) return toast.error("Selecciona una categoría");
    const cat = categories.find((c) => c.id === svcForm.category_id);
    if (!cat) return toast.error("Categoría inválida");
    setSvcBusy(true);
    const payload = {
      category: cat.name,
      category_id: svcForm.category_id,
      name: svcForm.name.trim(),
      short_description: svcForm.short_description?.trim() || null,
      display_order: svcForm.display_order,
      is_active: svcForm.is_active,
    };
    const { error } = editingSvc
      ? await supabase.from("services").update(payload).eq("id", editingSvc.id)
      : await supabase.from("services").insert(payload);
    setSvcBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editingSvc ? "Servicio actualizado" : "Servicio creado");
    setSvcOpen(false);
    load();
  };
  const removeSvc = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Servicio eliminado");
    load();
  };
  const toggleSvcActive = async (s: Service) => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary">Servicios</h1>
        <p className="text-muted-foreground mt-1">
          Administra las categorías y los servicios que ofreces.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : (
        <Tabs defaultValue="catalog" className="space-y-4">
          <TabsList>
            <TabsTrigger value="catalog">
              <Briefcase className="w-4 h-4 mr-1" /> Catálogo
            </TabsTrigger>
            <TabsTrigger value="categories">
              <FolderTree className="w-4 h-4 mr-1" /> Categorías
            </TabsTrigger>
          </TabsList>

          {/* ----------- CATALOG TAB: grouped view ----------- */}
          <TabsContent value="catalog" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => openSvcCreate()}
                disabled={categories.length === 0}
              >
                <Plus className="w-4 h-4" /> Nuevo servicio
              </Button>
            </div>

            {categories.length === 0 ? (
              <Card className="border-accent/40 bg-accent/5">
                <CardContent className="pt-4 pb-4 text-sm">
                  Primero crea al menos una <strong>categoría</strong> en la
                  pestaña “Categorías”.
                </CardContent>
              </Card>
            ) : (
              categories.map((cat) => {
                const catServices = services.filter(
                  (s) => s.category_id === cat.id,
                );
                return (
                  <Card key={cat.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-lg">{cat.name}</CardTitle>
                            <Badge
                              variant={cat.is_active ? "default" : "secondary"}
                            >
                              {cat.is_active ? "Activa" : "Inactiva"}
                            </Badge>
                          </div>
                          {cat.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {cat.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openSvcCreate(cat.id)}
                          >
                            <Plus className="w-4 h-4" /> Servicio
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openCatEdit(cat)}
                            title="Editar categoría"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {catServices.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-3 text-center">
                          Sin servicios en esta categoría.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Servicio</TableHead>
                              <TableHead className="text-center w-20">
                                Orden
                              </TableHead>
                              <TableHead className="text-center w-24">
                                Estado
                              </TableHead>
                              <TableHead className="text-right w-28">
                                Acciones
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {catServices.map((s) => (
                              <TableRow key={s.id}>
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
                                  <Switch
                                    checked={s.is_active}
                                    onCheckedChange={() => toggleSvcActive(s)}
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => openSvcEdit(s)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeSvc(s.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}

            {/* Orphan services (no category) */}
            {services.filter((s) => !s.category_id).length > 0 && (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">
                    Servicios sin categoría
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      {services
                        .filter((s) => !s.category_id)
                        .map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.name}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openSvcEdit(s)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeSvc(s.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ----------- CATEGORIES TAB ----------- */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openCatCreate}>
                <Plus className="w-4 h-4" /> Nueva categoría
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                {categories.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    Aún no hay categorías.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-center w-20">Orden</TableHead>
                        <TableHead className="text-center w-24">Estado</TableHead>
                        <TableHead className="text-right w-28">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-md">
                            {c.description ?? "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {c.display_order}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={c.is_active}
                              onCheckedChange={() => toggleCatActive(c)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openCatEdit(c)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeCat(c.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* ---------- Category Dialog ---------- */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCat ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={catForm.name}
                onChange={(e) =>
                  setCatForm({
                    ...catForm,
                    name: e.target.value,
                    slug: editingCat ? catForm.slug : slugify(e.target.value),
                  })
                }
                maxLength={80}
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={catForm.description}
                onChange={(e) =>
                  setCatForm({ ...catForm, description: e.target.value })
                }
                rows={3}
                maxLength={300}
                placeholder="Texto visible debajo del título de la categoría."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={catForm.display_order}
                  onChange={(e) =>
                    setCatForm({
                      ...catForm,
                      display_order: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch
                  checked={catForm.is_active}
                  onCheckedChange={(v) =>
                    setCatForm({ ...catForm, is_active: v })
                  }
                />
                <Label>Activa</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveCat} disabled={catBusy}>
              {catBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Service Dialog ---------- */}
      <Dialog open={svcOpen} onOpenChange={setSvcOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSvc ? "Editar servicio" : "Nuevo servicio"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Categoría</Label>
              <Select
                value={svcForm.category_id}
                onValueChange={(v) => setSvcForm({ ...svcForm, category_id: v })}
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
                value={svcForm.name}
                onChange={(e) =>
                  setSvcForm({ ...svcForm, name: e.target.value })
                }
                maxLength={150}
              />
            </div>
            <div>
              <Label>Descripción corta (opcional)</Label>
              <Textarea
                value={svcForm.short_description}
                onChange={(e) =>
                  setSvcForm({ ...svcForm, short_description: e.target.value })
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
                  value={svcForm.display_order}
                  onChange={(e) =>
                    setSvcForm({
                      ...svcForm,
                      display_order: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch
                  checked={svcForm.is_active}
                  onCheckedChange={(v) =>
                    setSvcForm({ ...svcForm, is_active: v })
                  }
                />
                <Label>Activo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSvcOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveSvc} disabled={svcBusy}>
              {svcBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
