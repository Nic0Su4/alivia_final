"use client";

import { useAdminStore } from "@/store/admin";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

export default function AdminDashboard() {
  const admin = useAdminStore((state) => state.admin);
  const logout = useAdminStore((state) => state.logout);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un admin en localStorage
    const storedAdmin = localStorage.getItem("admin");
    if (!admin && !storedAdmin) {
      redirect("/admin/login");
    }
    setLoading(false);
  }, [admin]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    Cookies.remove("admin"); // Eliminar la cookie
    logout();
    redirect("/admin/login");
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Cerrar sesión
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Crear médico */}
      </div>
    </div>
  );
}
