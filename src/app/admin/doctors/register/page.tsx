"use client";

import AdminRegisterMedicoForm from "@/components/Admin/AdminRegisterMedicoForm";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/store/admin";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterDoctorPage() {
  const admin = useAdminStore((state) => state.admin);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un admin en localStorage
    const storedAdmin = localStorage.getItem("admin");
    if (!admin && !storedAdmin) {
      router.push("/admin/login");
    }
    setLoading(false);
  }, [admin, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Registrar Nuevo Médico</h1>
        <Button
          onClick={() => router.push("/admin/doctors")}
          className="bg-gray-500 hover:bg-gray-600 text-white"
        >
          Volver a la lista
        </Button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <AdminRegisterMedicoForm />
      </div>
    </div>
  );
}
