import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { DS160Step1 } from "@/components/ds160/DS160Step1";
import { DS160Step2 } from "@/components/ds160/DS160Step2";
import { SEO } from "@/components/SEO";
import {
  step1Schema,
  step2Schema,
  defaultStep1,
  defaultStep2,
  type Step1Data,
  type Step2Data,
  type DS160FormData,
} from "@/lib/ds160-schema";

const STORAGE_KEY = "ds160_draft";

interface DraftRef {
  id: string;
  edit_token: string;
}

export default function DS160Form() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [draftRef, setDraftRef] = useState<DraftRef | null>(null);
  const [loaded, setLoaded] = useState(false);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: defaultStep1,
    mode: "onBlur",
  });
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: defaultStep2,
    mode: "onBlur",
  });

  // Cargar borrador existente (token en URL o localStorage)
  useEffect(() => {
    const loadDraft = async () => {
      const urlId = params.get("id");
      const urlToken = params.get("token");
      let ref: DraftRef | null = null;

      if (urlId && urlToken) {
        ref = { id: urlId, edit_token: urlToken };
      } else if (!user) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            ref = JSON.parse(stored);
          } catch {
            // ignore
          }
        }
      }

      if (ref) {
        const { data, error } = await supabase.rpc("get_ds160_with_token", {
          _id: ref.id,
          _edit_token: ref.edit_token,
        });
        if (!error && data) {
          const fd = (data.form_data as DS160FormData) || {};
          step1Form.reset({
            ...defaultStep1,
            ...fd,
            purpose_of_trip: data.purpose_of_trip || "",
            embassy: data.embassy || "",
            email: data.email || "",
            email_confirm: data.email || "",
          });
          step2Form.reset({ ...defaultStep2, ...fd });
          setDraftRef(ref);
          setStep((data.current_step as 1 | 2) ?? 1);
          if (data.status === "submitted" || data.status === "in_review" || data.status === "completed") {
            setSubmitted(true);
          }
        }
      }
      setLoaded(true);
    };
    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistDraft = async (
    s1: Partial<Step1Data>,
    s2: Partial<Step2Data>,
    nextStep: 1 | 2,
    finalize = false,
  ) => {
    setSavingDraft(true);
    const formData: DS160FormData = { ...s1, ...s2 };
    delete (formData as { email_confirm?: string }).email_confirm;

    const payload = {
      email: s1.email || "",
      full_name: `${s1.first_name || ""} ${s1.last_name || ""}`.trim(),
      purpose_of_trip: s1.purpose_of_trip || null,
      embassy: s1.embassy || null,
      form_data: formData as never,
      current_step: nextStep,
      status: finalize ? "submitted" : "draft",
    };

    try {
      if (draftRef) {
        // Actualizar via RPC con token (funciona para invitado y usuario)
        const { data, error } = await supabase.rpc("update_ds160_with_token", {
          _id: draftRef.id,
          _edit_token: draftRef.edit_token,
          _form_data: payload.form_data,
          _current_step: payload.current_step,
          _status: payload.status,
          _email: payload.email,
          _full_name: payload.full_name,
          _purpose_of_trip: payload.purpose_of_trip,
          _embassy: payload.embassy,
        });
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("ds160_applications")
          .insert({
            ...payload,
            user_id: user?.id ?? null,
          })
          .select("id, edit_token")
          .single();
        if (error) throw error;
        const ref = { id: data.id, edit_token: data.edit_token };
        setDraftRef(ref);
        if (!user) localStorage.setItem(STORAGE_KEY, JSON.stringify(ref));
        return data;
      }
    } catch (err) {
      console.error("DS-160 save error:", err);
      toast.error("No se pudo guardar el borrador. Intenta de nuevo.");
      throw err;
    } finally {
      setSavingDraft(false);
    }
  };

  const handleNext = async () => {
    const valid = await step1Form.trigger();
    if (!valid) {
      toast.error("Revisa los campos del paso 1");
      return;
    }
    try {
      await persistDraft(step1Form.getValues(), step2Form.getValues(), 2);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // toast already shown
    }
  };

  const handleSubmit = async () => {
    const valid = await step2Form.trigger();
    if (!valid) {
      toast.error("Revisa los campos del paso 2");
      return;
    }
    setSubmitting(true);
    try {
      await persistDraft(step1Form.getValues(), step2Form.getValues(), 2, true);
      setSubmitted(true);
      if (!user) localStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // toast already shown
    } finally {
      setSubmitting(false);
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-secondary/30 section-padding">
        <div className="container max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-10 pb-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-primary">
                ¡Solicitud enviada!
              </h1>
              <p className="text-muted-foreground">
                Hemos recibido tu pre-registro DS-160. Nuestro equipo lo revisará
                y se pondrá en contacto contigo a la brevedad por correo o
                WhatsApp para continuar con el proceso.
              </p>
              {draftRef && (
                <p className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">
                  Folio de seguimiento: <strong>{draftRef.id.slice(0, 8).toUpperCase()}</strong>
                </p>
              )}
              <Button asChild variant="default">
                <Link to="/">Volver al inicio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = step === 1 ? 50 : 100;

  return (
    <div className="min-h-screen bg-secondary/30 section-padding">
      <SEO
        title="Pre-registro DS-160 | Visa Americana B1/B2"
        description="Inicia tu pre-registro DS-160 para visa americana. Guardado automático y atención personalizada por nuestro despacho."
        canonical="/ds160"
      />
      <div className="container max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/30 mb-4">
            <ClipboardList className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-medium">Pre-registro DS-160</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-2">
            Visa Americana
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Completa solo lo esencial. Nuestro equipo se encarga del resto del
            formulario oficial DS-160 y te contactará para revisar tu solicitud.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
            <span className={step === 1 ? "text-primary font-bold" : ""}>
              1. Datos personales
            </span>
            <span className={step === 2 ? "text-primary font-bold" : ""}>
              2. Datos de contacto
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 1 ? (
              <FormProvider {...step1Form}>
                <Form {...step1Form}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleNext();
                    }}
                    className="space-y-6"
                  >
                    <DS160Step1 />
                    <div className="flex justify-end pt-4 border-t">
                      <Button type="submit" variant="default" disabled={savingDraft}>
                        {savingDraft && <Loader2 className="w-4 h-4 animate-spin" />}
                        Siguiente <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </FormProvider>
            ) : (
              <FormProvider {...step2Form}>
                <Form {...step2Form}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                    className="space-y-6"
                  >
                    <DS160Step2 />
                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        disabled={submitting}
                      >
                        <ArrowLeft className="w-4 h-4" /> Anterior
                      </Button>
                      <Button type="submit" variant="gold" disabled={submitting}>
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Enviar solicitud
                      </Button>
                    </div>
                  </form>
                </Form>
              </FormProvider>
            )}
          </CardContent>
        </Card>

        {!user && (
          <p className="text-xs text-center text-muted-foreground mt-6 max-w-lg mx-auto">
            💡 Tu progreso se guarda automáticamente. Si quieres recuperar esta
            solicitud desde otro dispositivo,&nbsp;
            <Link to="/auth" className="underline text-primary">
              crea una cuenta
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
