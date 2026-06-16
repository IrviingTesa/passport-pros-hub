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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Step5Data } from "@/lib/ds160-schema";

export const DS160Step5 = () => {
  const form = useFormContext<Step5Data>();
  const contactType = form.watch("us_contact_type");

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-primary">
        Contacto en Estados Unidos
      </h3>
      <p className="text-sm text-muted-foreground">
        Indica con quién o dónde te hospedarás durante tu viaje.
      </p>

      <FormField
        control={form.control}
        name="us_contact_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de contacto *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col gap-3 sm:flex-row sm:gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="family" id="ct-family" />
                  <Label htmlFor="ct-family">Familiar / conocido</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="hotel" id="ct-hotel" />
                  <Label htmlFor="ct-hotel">Hotel</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {contactType === "family" && (
        <div className="space-y-4 border-l-2 border-accent/40 pl-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="us_family_full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="us_family_relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parentesco *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej. hermano, tío" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="us_family_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección *</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="us_family_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono *</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="tel" placeholder="+1 555 555 5555" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="us_family_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estatus migratorio *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. ciudadano, residente, visa"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {contactType === "hotel" && (
        <div className="space-y-4 border-l-2 border-accent/40 pl-4">
          <FormField
            control={form.control}
            name="us_hotel_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del hotel *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="us_hotel_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección del hotel *</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
