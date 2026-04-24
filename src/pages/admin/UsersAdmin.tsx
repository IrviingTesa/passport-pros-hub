import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, Loader2, ShieldAlert, KeyRound } from "lucide-react";

interface InternalUser {
  id: string;
  email: string | null;
  full_name: string | null;
  roles: ("admin" | "secretary")[];
  created_at: string;
  last_sign_in_at: string | null;
}

export default function UsersAdmin() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "secretary" as "admin" | "secretary",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { type: "list" },
    });
    if (error) toast.error(error.message);
    setUsers((data?.users as InternalUser[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

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
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { type: "create", ...form, email: form.email.trim() },
    });
    setBusy(false);
    if (error || data?.error) {
      toast.error(error?.message ?? data?.error ?? "Error al crear");
      return;
    }
    toast.success("Cuenta creada");
    setOpen(false);
    setForm({ email: "", password: "", full_name: "", role: "secretary" });
    load();
  };

  const updateRole = async (
    user_id: string,
    role: "admin" | "secretary",
  ) => {
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { type: "update_role", user_id, role },
    });
    if (error || data?.error) {
      toast.error(error?.message ?? data?.error ?? "Error");
      return;
    }
    toast.success("Rol actualizado");
    load();
  };

  const remove = async (user_id: string, email: string | null) => {
    if (
      !confirm(
        `¿Eliminar la cuenta de ${email}? Esta acción no se puede deshacer.`,
      )
    )
      return;
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { type: "delete", user_id },
    });
    if (error || data?.error) {
      toast.error(error?.message ?? data?.error ?? "Error");
      return;
    }
    toast.success("Cuenta eliminada");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">
            Cuentas internas
          </h1>
          <p className="text-muted-foreground mt-1">
            Administradores y secretarias con acceso al panel.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" /> Nueva cuenta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear cuenta interna</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
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
                <Label>Contraseña inicial</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Mínimo 8 caracteres"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setForm({
                        ...form,
                        password:
                          Math.random().toString(36).slice(2, 10) +
                          Math.random().toString(36).slice(2, 6).toUpperCase() +
                          "!",
                      })
                    }
                  >
                    <KeyRound className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Compártela con la persona y pídele cambiarla en su primer
                  acceso.
                </p>
              </div>
              <div>
                <Label>Rol</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm({ ...form, role: v as "admin" | "secretary" })
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
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
          <CardTitle className="text-base">Usuarios registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Sin usuarios.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isMe = u.id === currentUser?.id;
                  const role = u.roles[0] ?? null;
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
                          <Select
                            value={role}
                            onValueChange={(v) =>
                              updateRole(u.id, v as "admin" | "secretary")
                            }
                            disabled={isMe}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="secretary">Secretaria</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="destructive">
                            <ShieldAlert className="w-3 h-3" /> Sin rol
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {u.last_sign_in_at
                          ? new Date(u.last_sign_in_at).toLocaleDateString()
                          : "Nunca"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => remove(u.id, u.email)}
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
    </div>
  );
}
