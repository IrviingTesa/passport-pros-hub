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
import type { Step4Data } from "@/lib/ds160-schema";

export const DS160Step4 = () => {
  const form = useFormContext<Step4Data>();
  const isRenewal = form.watch("is_renewal");

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-primary">
        Viajes anteriores / Renovación
      </h3>
      <p className="text-sm text-muted-foreground">
        Si es la primera vez que solicitas la visa, selecciona "No".
      </p>

      <FormField
        control={form.control}
        name="is_renewal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              ¿Es renovación de visa o ha viajado antes a Estados Unidos? *
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="renewal-no" />
                  <Label htmlFor="renewal-no">No</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="renewal-yes" />
                  <Label htmlFor="renewal-yes">Sí</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isRenewal === "yes" && (
        <div className="space-y-4 border-l-2 border-accent/40 pl-4">
          <FormField
            control={form.control}
            name="last_trip_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha aproximada del último viaje a EE.UU. *</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cities_visited"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudades visitadas *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    placeholder="Ej. Los Angeles, Las Vegas"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stay_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiempo de estancia *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej. 2 semanas, 3 meses"
                  />
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
