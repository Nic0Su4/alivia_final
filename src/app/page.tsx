import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-16 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-8 w-16 h-16 bg-white/8 rounded-full blur-lg"></div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/10 p-8 max-w-md space-y-8 w-96 border border-white/20 relative z-10">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-lg opacity-30 scale-110"></div>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-5GfpJfbkyd8HBavmpeBzzxfIkzUUbz.png"
              width={100}
              height={100}
              alt="AlivIA Logo"
              className="relative z-10"
            />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Bienvenido a AlivIA
          </h1>
          <p className="text-gray-500 font-medium">Tu asistente de salud inteligente</p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href={"/register"}>
            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-[1.02]">
              Comenzar ahora
            </Button>
          </Link>
          <Link href={"/register-medico"}>
            <Button
              variant="outline"
              className="w-full border-2 border-emerald-500/50 bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-600 font-semibold py-3 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Soy médico
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <span className="text-gray-500">¿Ya tienes una cuenta?</span>{" "}
          <Link
            href="/login"
            className="text-transparent bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text hover:from-emerald-600 hover:to-teal-700 font-semibold transition-all duration-300 hover:underline"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>

      <footer className="mt-8 text-white/90 text-sm font-medium backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
        © 2024 AlivIA. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default LandingPage
