// Configuración central — luego se podrá administrar desde el panel admin (Fase 3)
// Por ahora, edita aquí el número de WhatsApp y los servicios.

export const SITE_CONFIG = {
  brandName: "Asesores Migratorios",
  brandTagline: "Pasaportes · Visas · Apostillas · Actas",
  // Número de WhatsApp en formato internacional sin "+", sin espacios.
  // Ej: México 52 + 10 dígitos -> "5217471234567"
  whatsappNumber: "525555555555",
  email: "asesoresmigratorios@gmail.com",
  phone: "+52 555 555 5555",
  address: "Isaac Newton, Centro, 40900 Técpan de Galeana, Gro.",
  hours: "Lun – Vie: 9:00 – 18:00 · Sáb: 9:00 – 14:00",
  socials: {
    facebook: "#",
    instagram: "#",
    tiktok: "#",
    youtube: "#",
  },
};

export type ServiceCategory = {
  id: string;
  title: string;
  description: string;
  services: ServiceItem[];
};

export type ServiceItem = {
  id: string;
  name: string;
  short?: string;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "pasaportes-visas",
    title: "Pasaporte y Visas",
    description: "Tramitamos tu pasaporte mexicano y americano, además de visas de turismo y negocios.",
    services: [
      { id: "pasaporte-extemporaneo", name: "Trámite de pasaporte con registro extemporáneo", short: "Pasaporte extemporáneo" },
      { id: "visa-b1-b2", name: "Visas B-1 / B-2 (Turismo y Negocios)", short: "Visa B1/B2" },
      { id: "pasaporte-americano", name: "Pasaporte americano", short: "Pasaporte USA" },
    ],
  },
  {
    id: "actas-registros",
    title: "Actas y Registros",
    description: "Aclaraciones, rectificaciones, nulidades y registros de actas del Registro Civil.",
    services: [
      { id: "aclaracion-actas", name: "Aclaraciones y rectificaciones de actas (nacimiento, matrimonio, defunción)" },
      { id: "nulidad-registros", name: "Nulidad de registros" },
      { id: "registros-extemporaneos", name: "Registros extemporáneos" },
      { id: "doble-nacionalidad", name: "Inscripción de doble nacionalidad" },
    ],
  },
  {
    id: "otros-servicios",
    title: "Otros Servicios",
    description: "Apostillas, traducciones, CURP, RFC y certificaciones oficiales.",
    services: [
      { id: "apostilla", name: "Apostilla de documentos" },
      { id: "traducciones", name: "Traducciones certificadas" },
      { id: "actas-linea", name: "Actas en línea" },
      { id: "curp", name: "Impresión de CURP (nuevo formato)" },
      { id: "rfc", name: "RFC" },
      { id: "constancia-extravio", name: "Constancia de extravío" },
      { id: "copias-certificados", name: "Copias y certificados" },
    ],
  },
];

/** Construye el link de WhatsApp con mensaje pre-llenado para un servicio específico */
export function whatsappLink(serviceName?: string): string {
  const text = serviceName
    ? `Hola, me interesa el servicio: *${serviceName}*. ¿Me pueden dar más información?`
    : `Hola, me gustaría más información sobre sus servicios.`;
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
