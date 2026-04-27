import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
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
  const legalServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: SITE_CONFIG.brandName,
    description:
      "Despacho profesional en México: pasaportes, visas B1/B2, DS-160, apostillas, actas y traducciones certificadas.",
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chilpancingo",
      addressRegion: "Guerrero",
      addressCountry: "MX",
    },
    areaServed: { "@type": "Country", name: "México" },
    openingHours: "Mo-Fr 09:00-18:00, Sa 09:00-14:00",
    priceRange: "$$",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.brandName,
    inLanguage: "es-MX",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Trámites Legales y Visas | Pasaportes, DS-160, Apostillas"
        description="Despacho profesional en México: pasaportes, visas B1/B2, DS-160, apostillas, actas y traducciones certificadas. Atención por WhatsApp."
        canonical="/"
        jsonLd={[legalServiceJsonLd, websiteJsonLd]}
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
