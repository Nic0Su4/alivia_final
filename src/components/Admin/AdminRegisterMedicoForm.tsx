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
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { Doctor, Specialty } from "@/utils/types";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { toast } from "sonner";

const FormSchema = z.object({
  email: z
    .string()
    .email("Ingresa un correo electrónico válido")
    .min(1, "Ingresa el correo electrónico"),
  password: z
    .string()
    .min(1, "Ingresa la contraseña")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(1, "Ingresa el nombre"),
  lastName: z.string().min(1, "Ingresa el apellido"),
  workplace: z.string().min(1, "Ingresa el lugar de trabajo"),
  contactNumber: z
    .string()
    .min(1, "Ingresa el número de contacto")
    .max(9, "Ingresa un número de contacto válido"),
  specialty: z
    .string({
      required_error: "Selecciona o ingresa una especialidad",
    })
    .min(1, "Selecciona o ingresa una especialidad"),
});

const AdminRegisterMedicoForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      workplace: "",
      contactNumber: "",
      specialty: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [newSpecialty, setNewSpecialty] = useState<string | null>(null);

  const fetchSpecialties = async () => {
    const specialtiesSnapshot = await getDocs(collection(db, "specialties"));
    const specialtiesData = specialtiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    })) as Specialty[];

    setSpecialties(specialtiesData);
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const onSubmit = async ({
    email,
    password,
    firstName,
    lastName,
    specialty,
    workplace,
    contactNumber,
  }: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential) {
        setIsLoading(false);
        return;
      }

      // Verificar si la especialidad existe o crear una nueva
      let specialtyId = specialties.find((s) => s.name === specialty)?.id;
      if (!specialtyId && newSpecialty) {
        const specialtyDoc = await addDoc(collection(db, "specialties"), {
          name: newSpecialty,
        });
        specialtyId = specialtyDoc.id;
        setSpecialties([
          ...specialties,
          { id: specialtyId, name: newSpecialty },
        ]);
      }

      // Crear el documento del médico en Firestore
      const doctorData: Doctor = {
        uid: userCredential.user.uid,
        firstName,
        lastName,
        specialty: { id: specialtyId!, name: specialty },
        email,
        workplace,
        contactNumber,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, "doctors", userCredential.user.uid), doctorData);

      // Mostrar mensaje de éxito
      toast.success("Médico registrado", {
        description: `El médico ${firstName} ${lastName} ha sido registrado correctamente.`,
      });

      // Limpiar el formulario
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al registrar médico:", error);
      toast.error("Error", {
        description: error.message || "Ocurrió un error al registrar el médico",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full overflow-auto p-4"
      >
        <div className="space-y-2 flex flex-col gap-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa el nombre" {...field} />
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
                  <Input placeholder="Ingresa el apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa el Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Ingresa la contraseña"
                    {...field}
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
              <FormItem className="flex flex-col">
                <FormLabel>Especialidad</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value || "Selecciona especialidad"}
                        <ChevronsUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar especialidad..." />
                      <CommandList>
                        <CommandEmpty>
                          No se encontró especialidad.
                          <Button
                            variant="ghost"
                            className="mt-2 w-full"
                            onClick={() => setNewSpecialty("")}
                          >
                            Crear nueva especialidad
                          </Button>
                        </CommandEmpty>
                        <CommandGroup>
                          {specialties.map((specialty) => (
                            <CommandItem
                              key={specialty.id}
                              onSelect={() => {
                                form.setValue("specialty", specialty.name);
                                setNewSpecialty(null);
                              }}
                            >
                              {specialty.name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  specialty.name === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {newSpecialty !== null && (
                  <Input
                    placeholder="Ingresa la nueva especialidad"
                    value={newSpecialty}
                    type="text"
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    className="mt-2"
                  />
                )}
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
                    type="text"
                    placeholder="Ingresa el lugar de trabajo"
                    {...field}
                  />
                </FormControl>
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
                    type="tel"
                    placeholder="Ingresa el número de contacto"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          className="w-full mt-6 bg-[#2eb893] hover:bg-[#269378] text-white font-bold"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner size="medium" className="mr-2" />
              Registrando médico...
            </>
          ) : (
            "Registrar médico"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AdminRegisterMedicoForm;
