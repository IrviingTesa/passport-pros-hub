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
import { DS160Step3 } from "@/components/ds160/DS160Step3";
import { DS160Step4 } from "@/components/ds160/DS160Step4";
import { DS160Step5 } from "@/components/ds160/DS160Step5";
import { DS160Payment } from "@/components/ds160/DS160Payment";
import { SEO } from "@/components/SEO";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  defaultStep1,
  defaultStep2,
  defaultStep3,
  defaultStep4,
  defaultStep5,
  type Step1Data,
  type Step2Data,
  type Step3Data,
  type Step4Data,
  type Step5Data,
  type DS160FormData,
} from "@/lib/ds160-schema";

const STORAGE_KEY = "ds160_draft";
const TOTAL_STEPS = 6;

type StepNum = 1 | 2 | 3 | 4 | 5 | 6;

const STEP_LABELS: Record<StepNum, string> = {
  1: "Datos personales",
  2: "Contacto",
  3: "Trabajo",
  4: "Viajes",
  5: "Contacto EE.UU.",
  6: "Pago",
};

interface DraftRef {
  id: string;
  edit_token: string;
}

export default function DS160Form() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [step, setStep] = useState<StepNum>(1);
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
  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: defaultStep3,
    mode: "onBlur",
  });
  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: defaultStep4,
    mode: "onBlur",
  });
  const step5Form = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: defaultStep5,
    mode: "onBlur",
  });

  // Cargar borrador existente
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
          step3Form.reset({ ...defaultStep3, ...fd });
          step4Form.reset({ ...defaultStep4, ...fd });
          step5Form.reset({ ...defaultStep5, ...fd });
          setDraftRef(ref);
          const s = (data.current_step as StepNum) ?? 1;
          let initial: StepNum = s >= 1 && s <= TOTAL_STEPS ? s : 1;
          // If user returns from Mercado Pago redirect, jump to payment step.
          if (urlId && urlToken && initial === 5) initial = 6;
          setStep(initial);
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

  const collectFormData = (): DS160FormData => {
    const data: DS160FormData = {
      ...step1Form.getValues(),
      ...step2Form.getValues(),
      ...step3Form.getValues(),
      ...step4Form.getValues(),
      ...step5Form.getValues(),
    };
    delete (data as { email_confirm?: string }).email_confirm;
    return data;
  };

  const persistDraft = async (nextStep: StepNum, finalize = false) => {
    setSavingDraft(true);
    const s1 = step1Form.getValues();
    const formData = collectFormData();

    // DB trigger caps current_step at 5; payment step (6) is UI-only.
    const dbStep = Math.min(nextStep, 5);
    const payload = {
      email: s1.email || "",
      full_name: `${s1.first_name || ""} ${s1.last_name || ""}`.trim(),
      purpose_of_trip: s1.purpose_of_trip || null,
      embassy: s1.embassy || null,
      form_data: formData as never,
      current_step: dbStep,
      status: finalize ? "submitted" : "draft",
    };

    try {
      if (draftRef) {
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
        const { data, error } = await supabase.rpc("create_ds160_application", {
          _email: payload.email,
          _full_name: payload.full_name,
          _purpose_of_trip: payload.purpose_of_trip,
          _embassy: payload.embassy,
          _form_data: payload.form_data,
          _current_step: payload.current_step,
          _status: payload.status,
          _user_id: user?.id ?? null,
        });
        if (error) throw error;
        const row = data as { id: string; edit_token: string };
        const ref = { id: row.id, edit_token: row.edit_token };
        setDraftRef(ref);
        if (!user) localStorage.setItem(STORAGE_KEY, JSON.stringify(ref));
        return row;
      }
    } catch (err) {
      console.error("DS-160 save error:", err);
      toast.error("No se pudo guardar el borrador. Intenta de nuevo.");
      throw err;
    } finally {
      setSavingDraft(false);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (step) {
      case 1:
        return step1Form.trigger();
      case 2:
        return step2Form.trigger();
      case 3:
        return step3Form.trigger();
      case 4:
        return step4Form.trigger();
      case 5:
        return step5Form.trigger();
      case 6:
        return true;
    }
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) {
      toast.error(`Revisa los campos del paso ${step}`);
      return;
    }
    const next = (step + 1) as StepNum;
    try {
      await persistDraft(next);
      setStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // toast already shown
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((step - 1) as StepNum);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    const valid = await validateCurrentStep();
    if (!valid) {
      toast.error(`Revisa los campos del paso ${step}`);
      return;
    }
    setSubmitting(true);
    try {
      await persistDraft(step, true);
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

  const progress = (step / TOTAL_STEPS) * 100;
  const isLast = step === TOTAL_STEPS;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <FormProvider {...step1Form}>
            <Form {...step1Form}>
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
                <DS160Step1 />
                <StepNav onPrev={null} loading={savingDraft} isLast={false} />
              </form>
            </Form>
          </FormProvider>
        );
      case 2:
        return (
          <FormProvider {...step2Form}>
            <Form {...step2Form}>
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
                <DS160Step2 />
                <StepNav onPrev={handlePrev} loading={savingDraft} isLast={false} />
              </form>
            </Form>
          </FormProvider>
        );
      case 3:
        return (
          <FormProvider {...step3Form}>
            <Form {...step3Form}>
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
                <DS160Step3 />
                <StepNav onPrev={handlePrev} loading={savingDraft} isLast={false} />
              </form>
            </Form>
          </FormProvider>
        );
      case 4:
        return (
          <FormProvider {...step4Form}>
            <Form {...step4Form}>
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
                <DS160Step4 />
                <StepNav onPrev={handlePrev} loading={savingDraft} isLast={false} />
              </form>
            </Form>
          </FormProvider>
        );
      case 5:
        return (
          <FormProvider {...step5Form}>
            <Form {...step5Form}>
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
                <DS160Step5 />
                <StepNav onPrev={handlePrev} loading={savingDraft} isLast={false} nextLabel="Continuar al pago" />
              </form>
            </Form>
          </FormProvider>
        );
      case 6:
        if (!draftRef) {
          return (
            <p className="text-sm text-center text-muted-foreground py-8">
              Completa los pasos anteriores para continuar al pago.
            </p>
          );
        }
        return (
          <div className="space-y-6">
            <DS160Payment
              applicationId={draftRef.id}
              editToken={draftRef.edit_token}
              onPaid={() => { if (!submitting && !submitted) handleSubmit(); }}
            />
            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="outline" onClick={handlePrev} disabled={submitting}>
                <ArrowLeft className="w-4 h-4" /> Anterior
              </Button>
              <span />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 section-padding">
      <SEO
        title="Pre-registro DS-160 | Visa Americana B1/B2"
        description="Inicia tu pre-registro DS-160 para visa americana. Guardado automático y atención personalizada."
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
            Completa los pasos. Tu progreso se guarda automáticamente.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs sm:text-sm font-medium text-muted-foreground mb-2 gap-1">
            {([1, 2, 3, 4, 5] as StepNum[]).map((n) => (
              <span
                key={n}
                className={`flex-1 text-center truncate ${
                  step === n ? "text-primary font-bold" : ""
                }`}
              >
                {n}. {STEP_LABELS[n]}
              </span>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardContent className="pt-6">{renderStep()}</CardContent>
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

function StepNav({
  onPrev,
  loading,
  isLast,
  nextLabel,
}: {
  onPrev: (() => void) | null;
  loading: boolean;
  isLast: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex justify-between pt-4 border-t">
      {onPrev ? (
        <Button type="button" variant="outline" onClick={onPrev} disabled={loading}>
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit" variant={isLast ? "gold" : "default"} disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLast ? "Enviar solicitud" : (
          <>
            {nextLabel ?? "Siguiente"} <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}
