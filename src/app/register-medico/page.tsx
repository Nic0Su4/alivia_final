"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterMedicoRedirect() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/login");
    }, 2000);

  }, [router]); 

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-white/20">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Redirigiendo...</h2>
        <p className="text-gray-600 font-medium">
          El registro de médicos solo está disponible a través del panel de
          administración.
        </p>
        <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}