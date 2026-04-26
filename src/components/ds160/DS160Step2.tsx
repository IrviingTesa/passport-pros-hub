import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { COUNTRIES, COUNTRY_CODES } from "@/lib/ds160-options";
import type { Step2Data } from "@/lib/ds160-schema";

export const DS160Step2 = () => {
  const form = useFormContext<Step2Data>();
  const hasOtherPhones = form.watch("has_other_phones");
  const travelingWithOthers = form.watch("traveling_with_others");

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-primary">
        Datos de contacto
      </h3>

      <FormField
        control={form.control}
        name="address_line1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Calle y número" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address_line2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección línea 2 (Opcional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Colonia, departamento, etc." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciudad *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado/Provincia *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Postal *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="residence_country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>País de residencia *</FormLabel>
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

      <div>
        <Label>Número de teléfono principal *</Label>
        <div className="grid grid-cols-[120px_1fr] gap-2 mt-2">
          <FormField
            control={form.control}
            name="phone_country_code"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
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
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="ej. 5544332211" inputMode="numeric" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="has_other_phones"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              ¿Ha tenido otros números de teléfono en los últimos cinco años? *
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="other-phones-no" />
                  <Label htmlFor="other-phones-no">No</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="other-phones-yes" />
                  <Label htmlFor="other-phones-yes">Sí</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {hasOtherPhones === "yes" && (
        <FormField
          control={form.control}
          name="other_phones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Indique otros teléfonos (separados por coma)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} placeholder="+52 5544332211, +52 7471234567" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="traveling_with_others"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Está viajando con más personas? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="travel-no" />
                  <Label htmlFor="travel-no">No</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="travel-yes" />
                  <Label htmlFor="travel-yes">Sí</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {travelingWithOthers === "yes" && (
        <FormField
          control={form.control}
          name="travel_companions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acompañantes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Nombre completo y relación (esposo, hijo, amigo, etc.)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
