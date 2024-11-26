"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Doctor, Specialty } from "@/utils/types";
import { updateDoctor } from "@/utils/doctorUtils";
import { useEffect, useState } from "react";
import { getSpecialties } from "@/utils/specialtiesUtils";
import { Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const FormSchema = z.object({
  firstName: z.string().min(1, "Ingresa un nombre válido"),
  lastName: z.string().min(1, "Ingresa un apellido válido"),
  specialty: z.string().min(1, "Selecciona o ingresa una especialidad"),
  contactNumber: z
    .string()
    .min(1, "Ingresa un número de contacto válido")
    .max(10, "El número de contacto no debe exceder 10 dígitos"),
  workplace: z.string().min(1, "Ingresa el lugar de trabajo"),
  email: z.string().email("Ingresa un email válido"),
});

type EditDoctorFormProps = {
  doctor: Doctor;
  onUpdate: (updatedDoctor: Doctor) => void;
  isEditable?: boolean;
};

const EditDoctorForm = ({
  doctor,
  onUpdate,
  isEditable = true,
}: EditDoctorFormProps) => {
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  const fetchSpecialties = async () => {
    const specialtiesData = await getSpecialties();
    setSpecialties(specialtiesData);
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialty: doctor.specialty.name,
      contactNumber: doctor.contactNumber,
      workplace: doctor.workplace,
      email: doctor.email,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    try {
      const updatedDoctor = {
        ...doctor,
        ...data,
        specialty: { id: doctor.specialty.id, name: data.specialty },
      };

      await updateDoctor(doctor.uid, updatedDoctor);
      console.log("Doctor actualizado correctamente.");
      onUpdate(updatedDoctor);
    } catch (error) {
      console.error("Error al actualizar el doctor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4 bg-white rounded-md shadow w-full"
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresa el nombre"
                  {...field}
                  disabled={!isEditable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresa el apellido"
                  {...field}
                  disabled={!isEditable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidad</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isEditable}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem value={specialty.name} key={specialty.id}>
                      {specialty.name}
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
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de contacto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresa el número de contacto"
                  {...field}
                  disabled={!isEditable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="workplace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lugar de trabajo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresa el lugar de trabajo"
                  {...field}
                  disabled={!isEditable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Email</FormLabel>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <Input
              value={doctor.email}
              readOnly
              className="cursor-default bg-gray-100"
            />
          </div>
        </div>

        {isEditable && (
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="medium" className="mr-2" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        )}
      </form>
    </Form>
  );
};

export default EditDoctorForm;
