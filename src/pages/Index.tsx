import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { trackPageVisit } from "@/lib/track-visit";
import { Services } from "@/components/Services";
import { TeamSection } from "@/components/TeamSection";
import { VideosSection } from "@/components/VideosSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { DS160Section } from "@/components/DS160Section";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SEO } from "@/components/SEO";
import { SITE_CONFIG } from "@/config/site";

const Index = () => {
  useEffect(() => {
    if (sessionStorage.getItem("visit_tracked")) return;
    sessionStorage.setItem("visit_tracked", "1");
    trackPageVisit();
  }, []);

  const professionalServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE_CONFIG.brandName,
    url: "https://asesoresmigratoriosmx.com/",
    description:
      "Asesoría profesional para visa americana B1/B2, DS-160, pasaporte mexicano, apostillas, actas y trámites migratorios en Guerrero, México.",
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    image: "https://asesoresmigratoriosmx.com/logovisas.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tecpán de Galeana",
      addressRegion: "Guerrero",
      addressCountry: "MX",
    },
    areaServed: [
      { "@type": "City", name: "Tecpán de Galeana" },
      { "@type": "City", name: "Petatlán" },
      { "@type": "City", name: "Acapulco" },
      { "@type": "AdministrativeArea", name: "Guerrero" },
      { "@type": "Country", name: "México" },
    ],
    openingHours: "Mo-Fr 09:00-18:00, Sa 09:00-14:00",
    priceRange: "$$",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.brandName,
    url: "https://asesoresmigratoriosmx.com/",
    inLanguage: "es-MX",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué es el formulario DS-160?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El DS-160 es la solicitud electrónica que exige la embajada de Estados Unidos para tramitar la visa de no inmigrante (turismo, negocios, estudios). Te ayudamos a llenarlo correctamente para evitar errores.",
        },
      },
      {
        "@type": "Question",
        name: "¿Ofrecen asesoría para la visa americana en Guerrero?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Atendemos a personas de Tecpán de Galeana, Petatlán, Acapulco y toda la Costa Grande de Guerrero, con asesoría personalizada por WhatsApp y en oficina.",
        },
      },
      {
        "@type": "Question",
        name: "¿Pueden ayudarme a tramitar mi pasaporte mexicano?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, brindamos asesoría para pasaporte mexicano, incluyendo registros extemporáneos, aclaración de actas y toda la documentación necesaria.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Visa Americana y Pasaporte en Guerrero | Asesores Migratorios"
        description="Asesoría profesional para visa americana B1/B2, DS-160, pasaporte mexicano, apostillas y trámites migratorios en Tecpán, Petatlán y Acapulco."
        canonical="/"
        jsonLd={[professionalServiceJsonLd, websiteJsonLd, faqJsonLd]}
      />
      <Navbar />
      <main>
        <Hero />
        <Services />
        <TeamSection />
        <VideosSection />
        <ReviewsSection />
        <DS160Section />
        <ContactSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
