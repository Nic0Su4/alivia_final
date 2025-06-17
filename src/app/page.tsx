import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#4EC7A2] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md space-y-6 w-96">
        <div className="flex justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-5GfpJfbkyd8HBavmpeBzzxfIkzUUbz.png"
            width={100}
            height={100}
            alt="AlivIA Logo"
          />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Bienvenido a AlivIA
        </h1>
        <p className="text-center text-gray-600">
          Tu asistente de salud inteligente
        </p>
        <div className="flex flex-col gap-4">
          <Link href={"/register"}>
            <Button className="w-full bg-[#2eb893] hover:bg-[#269378] text-white font-bold">
              Comenzar ahora
            </Button>
          </Link>
          {/* <Link href={"/register-medico"}>
            <Button
              variant="outline"
              className="w-full border-[#40E0D0] text-[#2eb893] hover:bg-[#E6FFFD] font-bold hover:text-[#269378]"
            >
              Soy médico
            </Button>
          </Link> */}
        </div>
        <div className="text-center">
          <span className="text-gray-600">¿Ya tienes una cuenta?</span>{" "}
          <Link
            href="/login"
            className="text-[#40E0D0] hover:underline font-bold"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
      <footer className="mt-8 text-white text-sm">
        © 2024 AlivIA. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default LandingPage;
