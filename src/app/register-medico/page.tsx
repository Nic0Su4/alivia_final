"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterMedicoRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al usuario al login normal
    router.push("/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#4EC7A2]">
      <div className="bg-white p-8 rounded-lg shadow-md w-150 text-center">
        <h2 className="text-2xl font-bold mb-4">Redirigiendo...</h2>
        <p className="text-gray-600">
          El registro de médicos solo está disponible a través del panel de
          administración.
        </p>
      </div>
    </div>
  );
}
