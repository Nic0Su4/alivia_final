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
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/config";
import { User } from "@/utils/types";
import { doc, setDoc, Timestamp } from "firebase/firestore";

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
});

const RegisterForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  const setUser = useUserStore((state: UserStore) => state.setUser);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

  const onSubmit = async ({
    email,
    password,
    displayName,
  }: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(email, password);

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
      };

      await setDoc(doc(db, "users", res.user.uid), userData);

      setUser(userData);
      router.push("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      form.setError("email", {
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
