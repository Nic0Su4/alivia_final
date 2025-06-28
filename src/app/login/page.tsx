"use client"

import { LoginForm } from "@/components/Login/LoginForm"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type LoginFormData = z.infer<typeof formSchema>

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (values: LoginFormData) => {
    setIsLoading(true)

    try {
      console.log("Datos del formulario:", values)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert("¡Inicio de sesión exitoso!")
    } catch (error) {
      console.error("Error en el inicio de sesión:", error)
      alert("Error en el inicio de sesión. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1DB584] relative overflow-hidden">
      {/* Elementos decorativos geométricos */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Rectángulo superior derecho */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-white/20 rounded-bl-3xl"></div>

        {/* Rectángulo inferior izquierdo */}
        <div className="absolute bottom-0 left-0 w-96 h-64 bg-white/15 rounded-tr-3xl"></div>

        {/* Rectángulo medio izquierdo */}
        <div className="absolute top-1/2 left-0 w-72 h-48 bg-white/10 rounded-r-3xl transform -translate-y-1/2"></div>

        {/* Rectángulo superior izquierdo pequeño */}
        <div className="absolute top-20 left-20 w-48 h-32 bg-white/20 rounded-2xl"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Columna izquierda - Branding */}
          <div className="text-center lg:text-left space-y-6">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center shadow-lg">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-5GfpJfbkyd8HBavmpeBzzxfIkzUUbz.png"
                  width={80}
                  height={80}
                  alt="AlivIA Logo"
                />
              </div>
            </div>

            {/* Títulos */}
            <div className="space-y-5">
              <h1 className="text-5xl lg:text-6xl font-bold text-white">Bienvenido</h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-white/90">Inicia sesión en AlivIA</h2>
              <p className="text-lg text-white/80 max-w-md mx-auto lg:mx-0">Accede a tu cuenta para continuar</p>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <p className="text-white/80 text-sm">© 2024 AlivIA. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}

export default LoginPage
