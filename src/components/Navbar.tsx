import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-emblem.png";
import { SITE_CONFIG } from "@/config/site";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#videos", label: "Videos" },
  { href: "#resenas", label: "Reseñas" },
  { href: "#ds160", label: "Visa DS-160" },
  { href: "#contacto", label: "Contacto" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { whatsappHref } = useSiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-card border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container-narrow flex items-center justify-between h-20">
        <a href="#inicio" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt={SITE_CONFIG.brandName}
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
          <div className="hidden sm:block leading-tight">
            <div
              className={`font-serif font-bold text-lg ${
                scrolled ? "text-primary" : "text-primary-foreground"
              }`}
            >
              {SITE_CONFIG.brandName}
            </div>
            <div
              className={`text-xs ${
                scrolled ? "text-muted-foreground" : "text-primary-foreground/80"
              }`}
            >
              {SITE_CONFIG.brandTagline}
            </div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                scrolled ? "text-foreground" : "text-primary-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button asChild variant="gold" size="sm">
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
        </div>

        <button
          className={`lg:hidden p-2 rounded-md ${
            scrolled ? "text-foreground" : "text-primary-foreground"
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-background border-t border-border shadow-card animate-fade-in">
          <nav className="container-narrow py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-md text-foreground hover:bg-secondary text-base font-medium"
              >
                {link.label}
              </a>
            ))}
            <Button asChild variant="gold" className="mt-2">
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                Contactar por WhatsApp
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
