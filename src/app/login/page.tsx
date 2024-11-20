import LoginForm from "@/components/Login/LoginForm";
import Image from "next/image";
import React from "react";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-[#4EC7A2]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-5GfpJfbkyd8HBavmpeBzzxfIkzUUbz.png"
          width={100}
          height={100}
          alt="AlivIA Logo"
          className="mx-auto mb-6"
        />
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Inicia sesión en AlivIA
        </h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
