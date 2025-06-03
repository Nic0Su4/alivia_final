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
import { AdminStore, useAdminStore } from "@/store/admin";
import { Spinner } from "../ui/spinner";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Admin } from "@/utils/types";
import Cookies from "js-cookie";

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

const AdminLoginForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const setAdmin = useAdminStore((state: AdminStore) => state.setAdmin);
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

      console.log(res.user);

      // Verificar si el usuario es un administrador
      const adminDoc = await getDoc(doc(db, "admins", res.user.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data() as Admin;

        // Verificar que el usuario tenga el rol de administrador
        if (adminData.role === "admin") {
          // Guardar en localStorage
          localStorage.setItem("admin", JSON.stringify(adminData));

          // Guardar en cookie para el middleware
          Cookies.set("admin", "true", { expires: 7 }); // Expira en 7 días

          setAdmin(adminData);
          router.push("/admin/dashboard");
        } else {
          form.setError("email", {
            type: "manual",
            message: "No tienes permisos de administrador",
          });
        }
      } else {
        form.setError("email", {
          type: "manual",
          message: "No tienes permisos de administrador",
        });
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
    </Form>
  );
};

export default AdminLoginForm;
