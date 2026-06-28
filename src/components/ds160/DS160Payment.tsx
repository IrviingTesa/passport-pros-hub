import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CreditCard, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const BASE_PRICE = 600;
const ADDON_PRICE = 200;

interface Props {
  applicationId: string;
  editToken: string;
  onPaid: () => void;
}

interface PaymentRow {
  id: string;
  status: string;
  amount: number;
  addon_live_advisory: boolean;
  mp_payment_id: string | null;
}

export function DS160Payment({ applicationId, editToken, onPaid }: Props) {
  const [addon, setAddon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [payment, setPayment] = useState<PaymentRow | null>(null);

  const total = BASE_PRICE + (addon ? ADDON_PRICE : 0);

  const refreshPayment = async () => {
    setChecking(true);
    const { data, error } = await supabase.rpc("get_ds160_payment_with_token", {
      _application_id: applicationId,
      _edit_token: editToken,
    });
    if (!error && data) {
      const p = data as unknown as PaymentRow;
      setPayment(p);
      if (p.status === "approved") onPaid();
    }
    setChecking(false);
  };

  useEffect(() => {
    refreshPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mp-create-preference", {
        body: {
          application_id: applicationId,
          edit_token: editToken,
          addon_live_advisory: addon,
          success_url: `${window.location.origin}/ds160?id=${applicationId}&token=${editToken}`,
        },
      });
      if (error) throw error;
      const url = (data as { init_point?: string; sandbox_init_point?: string }).init_point
        || (data as { sandbox_init_point?: string }).sandbox_init_point;
      if (!url) throw new Error("No se recibió el link de pago");
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toast.error("No se pudo iniciar el pago. Intenta de nuevo.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (payment?.status === "approved") {
    return (
      <Card className="border-green-300 bg-green-50/50">
        <CardContent className="pt-6 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-primary">Pago confirmado</h3>
          <p className="text-sm text-muted-foreground">
            Recibimos tu pago de ${Number(payment.amount).toFixed(2)} MXN. Puedes enviar tu solicitud.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (payment?.status === "pending" && payment.mp_payment_id) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-3">
          <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
          <h3 className="font-serif text-xl font-bold text-primary">Pago en revisión</h3>
          <p className="text-sm text-muted-foreground">
            Mercado Pago está procesando tu pago. Esto puede tardar unos minutos.
          </p>
          <Button variant="outline" onClick={refreshPayment}>
            <RefreshCw className="w-4 h-4" /> Actualizar estado
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <CreditCard className="w-10 h-10 text-accent mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-primary">Paso 6 — Pago del trámite</h2>
        <p className="text-sm text-muted-foreground">
          Completa el pago para enviar tu solicitud DS-160 a nuestro equipo.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Pre-registro DS-160</span>
            <span className="font-semibold">${BASE_PRICE} MXN</span>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-secondary/40 transition">
            <Checkbox checked={addon} onCheckedChange={(v) => setAddon(!!v)} className="mt-0.5" />
            <div className="flex-1 text-sm">
              <div className="flex justify-between items-center gap-2">
                <strong className="text-primary">Asesoría en vivo</strong>
                <span className="font-semibold">+${ADDON_PRICE} MXN</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sesión 1-a-1 con un asesor migratorio para repasar tus respuestas y entrevista consular.
              </p>
            </div>
          </label>

          <div className="flex justify-between items-center pt-3 border-t">
            <span className="font-semibold text-primary">Total a pagar</span>
            <span className="text-2xl font-bold text-accent">${total} MXN</span>
          </div>

          <Button onClick={handlePay} disabled={loading} className="w-full" variant="gold" size="lg">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Pagar con Mercado Pago
          </Button>

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Pago seguro procesado por Mercado Pago. Acepta tarjeta, OXXO y SPEI.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
