"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useState } from "react";
import { UserStore, useUserStore } from "@/store/user";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/config";
import { User } from "@/utils/types";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const FormSchema = z.object({
  email: z
    .string()
    .email("Ingresa un correo electrónico válido")
    .min(1, "Ingresa tu correo electrónico"),
  password: z
    .string()
    .min(1, "Ingresa tu contraseña")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  displayName: z.string().min(1, "Ingresa tu nombre"),
  phoneNumber: z
    .string()
    .regex(/^9\d{8}$/, "Ingresa un número de celular válido de 9 dígitos"),
  birthDate: z.string().min(1, "Ingresa tu fecha de nacimiento"),
  gender: z.enum(["Masculino", "Femenino", "Otro"], {
    errorMap: () => ({ message: "Selecciona un género" }),
  }),
  summaryHistory: z.string().optional(), // Clave: es opcional
});

const RegisterForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      phoneNumber: "",
      birthDate: "",
      gender: undefined,
      summaryHistory: "",
    },
  });

  const setUser = useUserStore((state: UserStore) => state.setUser);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(
        data.email,
        data.password
      );
      const {
        displayName,
        email,
        birthDate,
        phoneNumber,
        gender,
        summaryHistory,
      } = data;

      if (!res) {
        setIsLoading(false);
        return;
      }

      const userData: User = {
        displayName,
        email,
        uid: res.user.uid,
        createdAt: Timestamp.now(),
        conversations: [],
        birthDate,
        phoneNumber,
        gender,
        summaryHistory: summaryHistory || "",
      };

      await setDoc(doc(db, "users", res.user.uid), userData);

      setUser(userData);
      router.push("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      form.setError("root", {
        type: "manual",
        message: "Ocurrió un error al registrar el usuario",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="space-y-2 flex flex-col gap-y-4">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa tu nombre" {...field} />
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
                  <Input placeholder="Ingresa tu Email" {...field} />
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
                    placeholder="Ingresa tu contraseña"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Celular</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="900000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- NUEVO CAMPO: GÉNERO (con Select) --- */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Género</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- NUEVO CAMPO: HISTORIAL RESUMIDO (con Textarea) --- */}
          <FormField
            control={form.control}
            name="summaryHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Historial Médico Relevante (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Soy alérgico a la penicilina, tengo asma..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Informa sobre condiciones o alergias importantes.
                </FormDescription>
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
              Registrando...
            </>
          ) : (
            "Registrarse"
          )}
        </Button>
      </form>
      <div className="mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400">
        o
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">
        Si ya tienes una cuenta,{" "}
        <Link className="text-[#3CDBB0] font-bold" href={"login"}>
          inicia sesión
        </Link>
        .
      </p>
    </Form>
  );
};

export default RegisterForm;
