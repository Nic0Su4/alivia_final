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
import { useState } from "react";
import { UserStore, useUserStore } from "@/store/user";
import { Spinner } from "../ui/spinner";
import Link from "next/link";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Doctor, User } from "@/utils/types";
import { DoctorStore, useDoctorStore } from "@/store/doctor";

const FormSchema = z.object({
  email: z
    .string()
    .email("Ingresa un correo electrónico válido")
    .min(1, "Ingresa tu correo electrónico"),
  password: z
    .string()
    .min(1, "Ingresa tu contraseña")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const LoginForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const setUser = useUserStore((state: UserStore) => state.setUser);
  const setDoctor = useDoctorStore((state: DoctorStore) => state.setDoctor);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

  const onSubmit = async ({ email, password }: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(email, password);

      if (!res) {
        form.setError("email", {
          type: "manual",
          message: "Usuario o contraseña incorrectos",
        });
        return;
      }

      const userDoc = await getDoc(doc(db, "users", res.user.uid));
      if (userDoc.exists()) {
        // Si el usuario existe en la colección "users"
        const userData = userDoc.data() as User;
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        router.push("/dashboard");
      } else {
        // Si no existe en "users", buscar en la colección "doctors"
        const doctorDoc = await getDoc(doc(db, "doctors", res.user.uid));
        if (doctorDoc.exists()) {
          const doctorData = doctorDoc.data() as Doctor;
          localStorage.setItem("doctor", JSON.stringify(doctorData));
          setDoctor(doctorData);
          router.push("/doctor-dashboard");
        } else {
          form.setError("email", {
            type: "manual",
            message: "Usuario no encontrado",
          });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      form.setError("email", {
        type: "manual",
        message: "Ocurrió un error al iniciar sesión",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="space-y-2 flex flex-col gap-y-4">
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
        </div>

        <Button
          className="w-full mt-6 bg-[#2eb893] hover:bg-[#269378] text-white font-bold"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner size="medium" className="mr-2" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>
      <div className="mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400">
        o
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">
        ¿No tienes una cuenta?{" "}
        <Link className="text-[#3CDBB0] font-bold" href={"/register"}>
          Regístrate
        </Link>
        .
      </p>
    </Form>
  );
};

export default LoginForm;
