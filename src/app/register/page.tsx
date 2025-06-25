import RegisterForm from "@/components/Login/RegisterForm";
import Image from "next/image";
import React from "react";

const RegisterPage = () => {
  return (
    // He mantenido el fondo gradiente moderno que ya teníamos para la consistencia visual.
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex flex-col items-center justify-center p-4">
      {/* Si prefieres el diseño de dos columnas, podrías implementar ese layout aquí
        y colocar <RegisterForm /> en la columna derecha. 
        Por ahora, sigo la estructura simple que me proporcionaste.
      */}
      <div className="w-full max-w-lg">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/10 p-8 lg:p-10 border border-white/20">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-5GfpJfbkyd8HBavmpeBzzxfIkzUUbz.png"
            width={80}
            height={80}
            alt="AlivIA Logo"
            className="mx-auto"
          />
          <h2 className="text-3xl font-bold text-center my-4 text-gray-800">
            Regístrate en AlivIA
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Completa los siguientes pasos para crear tu cuenta.
          </p>

          {/* Aquí se renderiza el componente hijo con toda la lógica del formulario */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;