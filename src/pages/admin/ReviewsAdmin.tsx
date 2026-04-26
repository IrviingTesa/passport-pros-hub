import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  Check,
  X,
  Trash2,
  Star,
  EyeOff,
  Eye,
} from "lucide-react";

interface Review {
  id: string;
  client_name: string;
  photo_url: string | null;
  rating: number;
  comment: string;
  service_related: string | null;
  status: "pending" | "approved" | "rejected";
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const StatusBadge = ({ s }: { s: Review["status"] }) => {
  if (s === "approved")
    return <Badge className="bg-whatsapp text-white">Aprobada</Badge>;
  if (s === "rejected") return <Badge variant="destructive">Rechazada</Badge>;
  return <Badge variant="secondary">Pendiente</Badge>;
};

export default function ReviewsAdmin() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: Review["status"]) => {
    const { error } = await supabase
      .from("reviews")
      .update({ status })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(
      status === "approved"
        ? "Reseña aprobada y publicada"
        : status === "rejected"
        ? "Reseña rechazada"
        : "Estado actualizado",
    );
    load();
  };

  const toggleActive = async (r: Review) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_active: !r.is_active })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta reseña permanentemente?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminada");
    load();
  };

  const filtered = (status?: Review["status"]) =>
    status ? items.filter((r) => r.status === status) : items;

  const ReviewCard = ({ r }: { r: Review }) => (
    <Card className={!r.is_active ? "opacity-60" : ""}>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={r.photo_url ?? undefined} />
            <AvatarFallback>{initials(r.client_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="font-semibold truncate">{r.client_name}</div>
              <StatusBadge s={r.status} />
            </div>
            {r.service_related && (
              <div className="text-xs text-muted-foreground truncate">
                {r.service_related}
              </div>
            )}
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-accent text-accent"
                />
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-foreground italic border-l-2 border-accent/40 pl-3">
          "{r.comment}"
        </p>

        <p className="text-xs text-muted-foreground">
          {new Date(r.created_at).toLocaleString("es-MX")}
        </p>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {r.status !== "approved" && (
            <Button size="sm" onClick={() => updateStatus(r.id, "approved")}>
              <Check className="w-4 h-4" /> Aprobar
            </Button>
          )}
          {r.status !== "rejected" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus(r.id, "rejected")}
            >
              <X className="w-4 h-4" /> Rechazar
            </Button>
          )}
          {r.status === "approved" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleActive(r)}
            >
              {r.is_active ? (
                <>
                  <EyeOff className="w-4 h-4" /> Ocultar
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" /> Mostrar
                </>
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => remove(r.id)}
            className="ml-auto"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary">Reseñas</h1>
        <p className="text-muted-foreground mt-1">
          Aprueba o rechaza las reseñas que envían los clientes desde la
          landing.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pendientes ({filtered("pending").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprobadas ({filtered("approved").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rechazadas ({filtered("rejected").length})
            </TabsTrigger>
            <TabsTrigger value="all">Todas ({items.length})</TabsTrigger>
          </TabsList>

          {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {filtered(tab === "all" ? undefined : tab).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground text-sm">
                    Sin reseñas en esta categoría.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filtered(tab === "all" ? undefined : tab).map((r) => (
                    <ReviewCard key={r.id} r={r} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
