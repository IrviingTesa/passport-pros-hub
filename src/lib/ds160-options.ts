/** Opciones para el formulario DS-160 */

export const PURPOSES_OF_TRIP = [
  { value: "B1-B2", label: "Turismo o Negocios (B1/B2)" },
  { value: "F1", label: "Estudios (F1)" },
  { value: "J1", label: "Intercambio cultural (J1)" },
  { value: "H1B", label: "Trabajo temporal (H1B / H2B)" },
  { value: "C1", label: "Tránsito (C1)" },
  { value: "M1", label: "Estudios técnicos (M1)" },
  { value: "Otro", label: "Otro propósito" },
] as const;

export const EMBASSIES = [
  { value: "CDMX", label: "Embajada de EE.UU. en Ciudad de México" },
  { value: "GDL", label: "Consulado en Guadalajara, Jalisco" },
  { value: "MTY", label: "Consulado en Monterrey, Nuevo León" },
  { value: "TIJ", label: "Consulado en Tijuana, Baja California" },
  { value: "HMO", label: "Consulado en Hermosillo, Sonora" },
  { value: "MID", label: "Consulado en Mérida, Yucatán" },
  { value: "MAT", label: "Consulado en Matamoros, Tamaulipas" },
  { value: "NOG", label: "Consulado en Nogales, Sonora" },
  { value: "NLD", label: "Consulado en Nuevo Laredo, Tamaulipas" },
  { value: "CJS", label: "Consulado en Ciudad Juárez, Chihuahua" },
] as const;

export const COUNTRIES = [
  "México",
  "Estados Unidos",
  "Guatemala",
  "Belice",
  "Honduras",
  "El Salvador",
  "Nicaragua",
  "Costa Rica",
  "Panamá",
  "Cuba",
  "República Dominicana",
  "Colombia",
  "Venezuela",
  "Ecuador",
  "Perú",
  "Bolivia",
  "Chile",
  "Argentina",
  "Uruguay",
  "Paraguay",
  "Brasil",
  "España",
  "Francia",
  "Alemania",
  "Italia",
  "Reino Unido",
  "Canadá",
  "China",
  "Japón",
  "Corea del Sur",
  "Otro",
];

export const COUNTRY_CODES = [
  { value: "+52", label: "🇲🇽 +52" },
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+34", label: "🇪🇸 +34" },
  { value: "+57", label: "🇨🇴 +57" },
  { value: "+54", label: "🇦🇷 +54" },
  { value: "+56", label: "🇨🇱 +56" },
  { value: "+51", label: "🇵🇪 +51" },
  { value: "+58", label: "🇻🇪 +58" },
  { value: "+593", label: "🇪🇨 +593" },
  { value: "+502", label: "🇬🇹 +502" },
  { value: "+503", label: "🇸🇻 +503" },
  { value: "+504", label: "🇭🇳 +504" },
  { value: "+505", label: "🇳🇮 +505" },
  { value: "+506", label: "🇨🇷 +506" },
];

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "bg-muted text-muted-foreground" },
  submitted: { label: "Enviada", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  in_review: { label: "En revisión", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  completed: { label: "Completada", color: "bg-green-500/10 text-green-700 dark:text-green-300" },
  rejected: { label: "Rechazada", color: "bg-destructive/10 text-destructive" },
};
