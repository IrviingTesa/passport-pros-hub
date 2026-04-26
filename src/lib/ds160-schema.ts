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

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type DS160FormData = Partial<Step1Data & Step2Data>;

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
