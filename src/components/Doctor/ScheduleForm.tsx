"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Doctor, WorkDay } from "@/utils/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { updateDoctor } from "@/utils/doctorUtils";
import { useDoctorStore } from "@/store/doctor";
import { toast } from "sonner";

// Esquema de validación para el formulario
const FormSchema = z.object({
  workingHours: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      isActive: z.boolean(),
      slots: z.array(
        z.object({
          start: z.string().min(1, "La hora de inicio es requerida."),
          end: z.string().min(1, "La hora de fin es requerida."),
        })
      ),
    })
  ),
});

type ScheduleFormValues = z.infer<typeof FormSchema>;

const daysOfWeek = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
  { id: 0, label: "Domingo" },
];

export const ScheduleForm = ({ doctor }: { doctor: Doctor }) => {
  const [loading, setLoading] = useState(false);
  const { setDoctor } = useDoctorStore();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      // Mapeamos los días de la semana para generar el formulario
      workingHours: daysOfWeek.map((day) => {
        const existingDay = doctor.workingHours?.find(
          (h) => h.dayOfWeek === day.id
        );
        return {
          dayOfWeek: day.id,
          isActive: !!existingDay,
          slots: existingDay
            ? existingDay.slots
            : [{ start: "09:00", end: "17:00" }],
        };
      }),
    },
  });

  const { fields, update: _update } = useFieldArray({
    control: form.control,
    name: "workingHours",
  });

  const onSubmit = async (data: ScheduleFormValues) => {
    setLoading(true);
    try {
      // Filtramos solo los días activos y con el formato correcto para guardar
      const activeWorkingHours: WorkDay[] = data.workingHours
        .filter((day) => day.isActive)
        .map((day) => ({
          dayOfWeek: day.dayOfWeek as WorkDay["dayOfWeek"],
          slots: day.slots,
        }));

      // Llamamos a la función de utilidad para actualizar el doctor
      await updateDoctor(doctor.uid, { workingHours: activeWorkingHours });

      // Actualizamos el estado global del doctor
      const updatedDoctor = { ...doctor, workingHours: activeWorkingHours };
      setDoctor(updatedDoctor);
      localStorage.setItem("doctor", JSON.stringify(updatedDoctor)); // Actualizamos localStorage

      toast.success("Horario guardado", {
        description: "Tu horario de trabajo ha sido actualizado correctamente.",
      });
    } catch (error) {
      console.error("Error al guardar el horario:", error);
      toast.error("Error al guardar", {
        description: "No se pudo actualizar el horario.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Define tus Horarios de Trabajo</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {fields.map((field, index) => {
              const dayLabel = daysOfWeek.find(
                (d) => d.id === field.dayOfWeek
              )?.label;
              return (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <FormField
                    control={form.control}
                    name={`workingHours.${index}.isActive`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <FormLabel className="text-lg font-semibold">
                          {dayLabel}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch(`workingHours.${index}.isActive`) && (
                    <DayScheduleControl
                      control={form.control}
                      dayIndex={index}
                    />
                  )}
                </div>
              );
            })}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#49deb8] hover:bg-[#3bc4a3]"
            >
              {loading ? "Guardando..." : "Guardar Horario"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Componente hijo para manejar los slots de un día
const DayScheduleControl = ({
  control,
  dayIndex,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  dayIndex: number;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `workingHours.${dayIndex}.slots`,
  });

  return (
    <div className="space-y-4 pl-4 border-l-2">
      {fields.map((slot, slotIndex) => (
        <div key={slot.id} className="flex items-end gap-4">
          <FormField
            control={control}
            name={`workingHours.${dayIndex}.slots.${slotIndex}.start`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inicio</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`workingHours.${dayIndex}.slots.${slotIndex}.end`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fin</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => remove(slotIndex)}
            disabled={fields.length <= 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ start: "14:00", end: "18:00" })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Añadir bloque
      </Button>
    </div>
  );
};
