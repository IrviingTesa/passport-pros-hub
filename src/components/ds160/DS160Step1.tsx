import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  PURPOSES_OF_TRIP,
  EMBASSIES,
  COUNTRIES,
} from "@/lib/ds160-options";
import type { Step1Data } from "@/lib/ds160-schema";

export const DS160Step1 = () => {
  const form = useFormContext<Step1Data>();
  const hasOtherNames = form.watch("has_other_names");
  const hasOtherEmails = form.watch("has_other_emails");

  return (
    <div className="space-y-8">
      {/* Propósito y embajada */}
      <section className="space-y-4">
        <FormField
          control={form.control}
          name="purpose_of_trip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Propósito de su viaje *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el propósito del viaje" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PURPOSES_OF_TRIP.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="embassy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Embajada / Consulado donde solicitará la visa *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione embajada / consulado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EMBASSIES.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      <div className="border-t pt-6">
        <h3 className="font-serif text-xl font-bold text-primary mb-1">
          Datos personales del solicitante
        </h3>
        <p className="text-sm text-muted-foreground mb-6 bg-accent/10 border border-accent/30 rounded-md px-3 py-2">
          <strong>Importante:</strong> Los datos personales deben coincidir con los
          datos que figuran en el pasaporte del solicitante.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre(s) *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Como aparece en pasaporte" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido(s) *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Como aparece en pasaporte" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="has_other_names"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>¿Alguna vez ha utilizado otros nombres? *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="other-names-no" />
                    <Label htmlFor="other-names-no">No</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="other-names-yes" />
                    <Label htmlFor="other-names-yes">Sí</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {hasOtherNames === "yes" && (
          <FormField
            control={form.control}
            name="other_names"
            render={({ field }) => (
              <FormItem className="mt-3">
                <FormLabel>Indique otros nombres utilizados</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nombres y apellidos completos" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico *</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="ej. juanperez@email.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email_confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar correo electrónico *</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Repite el correo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="has_other_emails"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>
                ¿En los últimos cinco años utilizó otras direcciones de correo
                electrónico? *
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="other-emails-no" />
                    <Label htmlFor="other-emails-no">No</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="other-emails-yes" />
                    <Label htmlFor="other-emails-yes">Sí</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {hasOtherEmails === "yes" && (
          <FormField
            control={form.control}
            name="other_emails"
            render={({ field }) => (
              <FormItem className="mt-3">
                <FormLabel>Indique otros correos usados (separados por coma)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ejemplo1@mail.com, ejemplo2@mail.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Sexo *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="male" id="sex-male" />
                    <Label htmlFor="sex-male">Hombre</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="female" id="sex-female" />
                    <Label htmlFor="sex-female">Mujer</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birth_date"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Fecha de nacimiento *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  min="1900-01-01"
                />
              </FormControl>
              <FormDescription>Formato: día / mes / año</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <FormField
            control={form.control}
            name="birth_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad de nacimiento *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ej. Chilpancingo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birth_state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado o Provincia de nacimiento</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Opcional" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <FormField
            control={form.control}
            name="birth_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País de nacimiento *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Escriba o seleccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-72">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalidad *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Escriba o seleccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-72">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
