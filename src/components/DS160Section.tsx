import { Link } from "react-router-dom";
import { ClipboardList, ShieldCheck, Clock, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

/** Control temporal para suspender/reactivar el pre-registro DS-160. */
const PREREGISTRO_SUSPENDIDO = false;

/** Sección DS-160 — CTA al wizard del pre-registro. */
export const DS160Section = () => {
  const { whatsappHref } = useSiteSettings();

  return (
    <section
      id="ds160"
      className="section-padding bg-gradient-navy text-primary-foreground relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
      </div>

      <div className="container-narrow relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 border border-accent/40 backdrop-blur-sm mb-6">
            <ClipboardList className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-medium tracking-wide">
              Visa Americana
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Pre-registro DS-160 simplificado
          </h2>

          <p className="text-lg text-primary-foreground/85 mb-10 leading-relaxed">
            Tú llenas solo lo básico (datos de contacto, información personal,
            tu pasaporte y plan de viaje) y nuestro equipo se encarga del resto:
            historial laboral completo, viajes anteriores, redacción en inglés y
            todos los detalles técnicos.{" "}
            <strong>Tiempo estimado: 6-8 minutos.</strong>
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Clock, label: "6-8 minutos", desc: "Solo lo esencial" },
              {
                icon: Users,
                label: "Equipo experto",
                desc: "Nosotros completamos el resto",
              },
              {
                icon: ShieldCheck,
                label: "100% Seguro",
                desc: "Tus datos protegidos",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-lg p-5"
              >
                <Icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="font-semibold mb-1">{label}</div>
                <div className="text-sm text-primary-foreground/70">
                  {desc}
                </div>
              </div>
            ))}
          </div>

          {PREREGISTRO_SUSPENDIDO && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-yellow-400/40 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-100">
              <Lock className="w-4 h-4" />
              <span>
                El pre-registro DS-160 está temporalmente suspendido.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {PREREGISTRO_SUSPENDIDO ? (
              <Button
                variant="secondary"
                size="lg"
                disabled
                aria-disabled="true"
                title="Pre-registro temporalmente suspendido"
                className="cursor-not-allowed opacity-70 grayscale border border-dashed"
              >
                <Lock className="w-4 h-4 mr-2" />
                Pre-registro suspendido
              </Button>
            ) : (
              <Button asChild variant="gold" size="lg">
                <Link to="/ds160">Iniciar pre-registro</Link>
              </Button>
            )}

            <Button asChild variant="outlineLight" size="lg">
              <a
                href={whatsappHref("Pre-registro DS-160 - Visa Americana")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Consultar por WhatsApp
              </a>
            </Button>
          </div>

          <p className="text-xs text-primary-foreground/60 mt-6 italic">
            ✨ Sin necesidad de crear cuenta. Tu progreso se guarda automáticamente.
          </p>
        </div>
      </div>
    </section>
  );
};