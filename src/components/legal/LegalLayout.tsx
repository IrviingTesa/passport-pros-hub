import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface Props {
  title: string;
  lastUpdated: string;
  description: string;
  children: React.ReactNode;
  canonical: string;
}

export function LegalLayout({ title, lastUpdated, description, children, canonical }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${title} | Asesores Migratorios`} description={description} canonical={canonical} />
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container max-w-3xl mx-auto px-4">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </Link>
          </Button>
          <header className="mb-8 text-center">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2">{title}</h1>
            <p className="text-sm text-muted-foreground">Última actualización: {lastUpdated}</p>
          </header>
          <Card className="p-6 sm:p-10">
            <article className="legal-prose space-y-5 text-foreground leading-relaxed">
              {children}
            </article>
          </Card>
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

export function useLegalContacts() {
  const { settings } = useSiteSettings();
  return useMemo(
    () => ({
      email: settings.contact_email,
      phone: settings.phone_number,
      whatsapp: settings.phone_number || settings.whatsapp_number,
      legalName: "Lic.Bernardo Balanzar",
      address: "Isaac Newton, Centro, 40900 Técpan de Galeana, Gro.",
    }),
    [settings],
  );
}
