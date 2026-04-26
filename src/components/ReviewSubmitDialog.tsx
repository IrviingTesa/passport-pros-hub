import { useState } from "react";
import { z } from "zod";
import { Star, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const reviewSchema = z.object({
  client_name: z
    .string()
    .trim()
    .min(2, "Tu nombre es muy corto")
    .max(100, "Máx 100 caracteres"),
  comment: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mín. 10 caracteres)")
    .max(1000, "Máx 1000 caracteres"),
  service_related: z.string().trim().max(150).optional().nullable(),
  rating: z.number().int().min(1).max(5),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const ReviewSubmitDialog = ({ open, onOpenChange }: Props) => {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [service, setService] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName("");
    setComment("");
    setService("");
    setRating(5);
    setHover(0);
  };

  const submit = async () => {
    const parsed = reviewSchema.safeParse({
      client_name: name,
      comment,
      service_related: service || null,
      rating,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({
      client_name: parsed.data.client_name,
      comment: parsed.data.comment,
      service_related: parsed.data.service_related ?? null,
      rating: parsed.data.rating,
      status: "pending",
      is_active: true,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      "¡Gracias! Tu reseña fue enviada y aparecerá pronto tras revisión.",
    );
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">
            Comparte tu experiencia
          </DialogTitle>
          <DialogDescription>
            Tu testimonio nos ayuda a seguir mejorando. Será revisado antes de
            publicarse.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Tu nombre *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María González"
              maxLength={100}
            />
          </div>

          <div>
            <Label>Servicio recibido (opcional)</Label>
            <Input
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Ej: Visa B1/B2"
              maxLength={150}
            />
          </div>

          <div>
            <Label>Calificación *</Label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1"
                  aria-label={`${n} estrellas`}
                >
                  <Star
                    className={cn(
                      "w-7 h-7 transition-colors",
                      (hover || rating) >= n
                        ? "fill-accent text-accent"
                        : "text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Tu comentario *</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Cuéntanos cómo fue tu experiencia con nosotros…"
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {comment.length}/1000
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar reseña
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
