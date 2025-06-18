import RegisterForm from "@/components/Login/RegisterForm";
import Image from "next/image";
import React from "react";

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center h-[100dvh] bg-[#4EC7A2]">
      <div className="bg-white p-8 my-4 rounded-lg shadow-md w-96 overflow-auto h-[calc(100dvh)]">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-5GfpJfbkyd8HBavmpeBzzxfIkzUUbz.png"
          width={100}
          height={100}
          alt="AlivIA Logo"
          className="mx-auto mb-6"
        />
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Regístrate en AlivIA
        </h2>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
