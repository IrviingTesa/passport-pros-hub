import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Step3Data } from "@/lib/ds160-schema";

export const DS160Step3 = () => {
  const form = useFormContext<Step3Data>();

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-primary">
        Información laboral
      </h3>
      <p className="text-sm text-muted-foreground">
        Datos del lugar donde trabajas actualmente.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="work_place"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lugar donde trabaja *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre de la empresa" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="work_position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Puesto *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Cargo o puesto" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="work_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección de la empresa *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Calle, número, ciudad, estado" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="work_monthly_salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sueldo mensual aproximado *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej. $15,000 MXN" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="work_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono de la empresa *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+52 555 555 5555" inputMode="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="work_start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha de ingreso *</FormLabel>
            <FormControl>
              <Input {...field} type="date" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
