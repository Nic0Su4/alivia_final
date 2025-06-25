"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
})

interface LoginFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  isLoading: boolean
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campo Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-gray-700">Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  placeholder="ejemplo@correo.com"
                  {...field}
                  className="h-12 px-4 border border-gray-200 rounded-xl focus:border-[#1DB584] focus:ring-2 focus:ring-[#1DB584]/20 transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        {/* Campo Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-gray-700">Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  className="h-12 px-4 border border-gray-200 rounded-xl focus:border-[#1DB584] focus:ring-2 focus:ring-[#1DB584]/20 transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        {/* Botón de envío */}
        <Button
          className="w-full h-12 bg-[#1DB584] hover:bg-[#17a372] text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            "Iniciar sesión"
          )}
        </Button>

        {/* Separador */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">o</span>
          </div>
        </div>

        {/* Enlace de registro */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            ¿No tienes una cuenta?{" "}
            <Link
              className="text-[#1DB584] hover:text-[#17a372] font-semibold transition-colors duration-300 hover:underline"
              href={"/register"}
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </form>
    </Form>
  )
}
