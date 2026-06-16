import { z } from "zod";

const trimmed = (max: number, msg = "Campo requerido") =>
  z.string().trim().min(1, msg).max(max, `Máximo ${max} caracteres`);

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .or(z.literal(""));

export const step1Schema = z
  .object({
    purpose_of_trip: trimmed(50, "Selecciona el propósito"),
    embassy: trimmed(50, "Selecciona la embajada o consulado"),
    first_name: trimmed(80, "Ingresa tu nombre"),
    last_name: trimmed(80, "Ingresa tus apellidos"),
    has_other_names: z.enum(["no", "yes"]),
    other_names: optionalTrimmed(200),
    email: z.string().trim().email("Correo inválido").max(255),
    email_confirm: z.string().trim().email("Correo inválido").max(255),
    has_other_emails: z.enum(["no", "yes"]),
    other_emails: optionalTrimmed(500),
    sex: z.enum(["male", "female"], { required_error: "Selecciona sexo" }),
    birth_date: trimmed(10, "Selecciona fecha de nacimiento"),
    birth_city: trimmed(100, "Ciudad de nacimiento"),
    birth_state: optionalTrimmed(100),
    birth_country: trimmed(80, "País de nacimiento"),
    nationality: trimmed(80, "Nacionalidad"),
  })
  .refine((d) => d.email === d.email_confirm, {
    message: "Los correos no coinciden",
    path: ["email_confirm"],
  })
  .refine((d) => d.has_other_names === "no" || (d.other_names && d.other_names.length > 0), {
    message: "Indica los otros nombres",
    path: ["other_names"],
  })
  .refine((d) => d.has_other_emails === "no" || (d.other_emails && d.other_emails.length > 0), {
    message: "Indica los otros correos",
    path: ["other_emails"],
  });

export const step2Schema = z
  .object({
    address_line1: trimmed(200, "Ingresa tu dirección"),
    address_line2: optionalTrimmed(200),
    city: trimmed(100, "Ciudad"),
    state: trimmed(100, "Estado o provincia"),
    postal_code: trimmed(20, "Código postal"),
    residence_country: trimmed(80, "País de residencia"),
    phone_country_code: trimmed(6, "Código país"),
    phone_number: trimmed(20, "Teléfono")
      .regex(/^[0-9\s-]+$/, "Solo números"),
    has_other_phones: z.enum(["no", "yes"]),
    other_phones: optionalTrimmed(300),
    traveling_with_others: z.enum(["no", "yes"]),
    travel_companions: optionalTrimmed(500),
  })
  .refine((d) => d.has_other_phones === "no" || (d.other_phones && d.other_phones.length > 0), {
    message: "Indica los otros teléfonos",
    path: ["other_phones"],
  })
  .refine(
    (d) => d.traveling_with_others === "no" || (d.travel_companions && d.travel_companions.length > 0),
    {
      message: "Indica con quién(es) viaja",
      path: ["travel_companions"],
    },
  );

// Paso 3 — Trabajo
export const step3Schema = z.object({
  work_place: trimmed(150, "Lugar donde trabaja"),
  work_position: trimmed(100, "Puesto"),
  work_address: trimmed(250, "Dirección de la empresa"),
  work_monthly_salary: trimmed(30, "Sueldo mensual aproximado"),
  work_phone: trimmed(25, "Teléfono de la empresa").regex(
    /^[0-9+\s()-]+$/,
    "Teléfono inválido",
  ),
  work_start_date: trimmed(10, "Fecha de ingreso"),
});

// Paso 4 — Viajes / Renovación
export const step4Schema = z
  .object({
    is_renewal: z.enum(["no", "yes"]),
    last_trip_date: optionalTrimmed(10),
    cities_visited: optionalTrimmed(300),
    stay_duration: optionalTrimmed(100),
  })
  .refine(
    (d) =>
      d.is_renewal === "no" ||
      (d.last_trip_date && d.last_trip_date.length > 0),
    { message: "Fecha del último viaje", path: ["last_trip_date"] },
  )
  .refine(
    (d) =>
      d.is_renewal === "no" ||
      (d.cities_visited && d.cities_visited.length > 0),
    { message: "Indica las ciudades visitadas", path: ["cities_visited"] },
  )
  .refine(
    (d) =>
      d.is_renewal === "no" ||
      (d.stay_duration && d.stay_duration.length > 0),
    { message: "Tiempo de estancia", path: ["stay_duration"] },
  );

// Paso 5 — Contacto en EE.UU.
export const step5Schema = z
  .object({
    us_contact_type: z.enum(["family", "hotel"], {
      required_error: "Selecciona tipo de contacto",
    }),
    // family
    us_family_full_name: optionalTrimmed(150),
    us_family_relationship: optionalTrimmed(80),
    us_family_address: optionalTrimmed(250),
    us_family_phone: optionalTrimmed(25),
    us_family_status: optionalTrimmed(80),
    // hotel
    us_hotel_name: optionalTrimmed(150),
    us_hotel_address: optionalTrimmed(250),
  })
  .superRefine((d, ctx) => {
    if (d.us_contact_type === "family") {
      const fields: Array<keyof typeof d> = [
        "us_family_full_name",
        "us_family_relationship",
        "us_family_address",
        "us_family_phone",
        "us_family_status",
      ];
      for (const f of fields) {
        if (!d[f] || (d[f] as string).length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [f],
            message: "Campo requerido",
          });
        }
      }
    } else if (d.us_contact_type === "hotel") {
      if (!d.us_hotel_name || d.us_hotel_name.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["us_hotel_name"],
          message: "Nombre del hotel",
        });
      }
      if (!d.us_hotel_address || d.us_hotel_address.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["us_hotel_address"],
          message: "Dirección del hotel",
        });
      }
    }
  });

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type DS160FormData = Partial<
  Step1Data & Step2Data & Step3Data & Step4Data & Step5Data
>;

export const defaultStep1: Step1Data = {
  purpose_of_trip: "",
  embassy: "",
  first_name: "",
  last_name: "",
  has_other_names: "no",
  other_names: "",
  email: "",
  email_confirm: "",
  has_other_emails: "no",
  other_emails: "",
  sex: "male",
  birth_date: "",
  birth_city: "",
  birth_state: "",
  birth_country: "México",
  nationality: "México",
};

export const defaultStep2: Step2Data = {
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  residence_country: "México",
  phone_country_code: "+52",
  phone_number: "",
  has_other_phones: "no",
  other_phones: "",
  traveling_with_others: "no",
  travel_companions: "",
};

export const defaultStep3: Step3Data = {
  work_place: "",
  work_position: "",
  work_address: "",
  work_monthly_salary: "",
  work_phone: "",
  work_start_date: "",
};

export const defaultStep4: Step4Data = {
  is_renewal: "no",
  last_trip_date: "",
  cities_visited: "",
  stay_duration: "",
};

export const defaultStep5: Step5Data = {
  us_contact_type: "family",
  us_family_full_name: "",
  us_family_relationship: "",
  us_family_address: "",
  us_family_phone: "",
  us_family_status: "",
  us_hotel_name: "",
  us_hotel_address: "",
};
