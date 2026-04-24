import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, Award } from "lucide-react";
import heroImage from "@/assets/hero-passports.jpg";
import { whatsappLink } from "@/config/site";

export const Hero = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Pasaportes y documentos legales"
          width={1920}
          height={1280}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="container-narrow relative z-10 py-16">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/30 backdrop-blur-sm mb-6">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-medium tracking-wide">
              Despacho con experiencia comprobada
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
            Trámites legales y migratorios{" "}
            <span className="text-accent">resueltos con seriedad</span>
          </h1>

          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 leading-relaxed max-w-2xl">
            Pasaportes, visas americanas B1/B2, DS-160, apostillas, actas y
            certificaciones. Te acompañamos en cada paso con asesoría personalizada
            y atención inmediata por WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button asChild variant="gold" size="lg">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                Solicitar asesoría gratuita
              </a>
            </Button>
            <Button asChild variant="outlineLight" size="lg">
              <a href="#servicios">Ver todos los servicios</a>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
            {[
              { icon: Award, label: "+10 años de experiencia" },
              { icon: ShieldCheck, label: "100% Confidencial" },
              { icon: Clock, label: "Respuesta en 24 hrs" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 text-primary-foreground/90"
              >
                <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
