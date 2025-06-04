"use client";

import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/store/admin";
import { Doctor } from "@/utils/types";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/firebase/config";

export default function DoctorsListPage() {
  const admin = useAdminStore((state) => state.admin);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    // Verificar si hay un admin en localStorage
    const storedAdmin = localStorage.getItem("admin");
    if (!admin && !storedAdmin) {
      router.push("/admin/login");
    } else {
      fetchDoctors();
    }
  }, [admin, router]);

  const fetchDoctors = async () => {
    try {
      const doctorsSnapshot = await getDocs(collection(db, "doctors"));
      const doctorsData = doctorsSnapshot.docs.map(
        (doc) => doc.data() as Doctor
      );
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Error al obtener médicos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Lista de Médicos</h1>
        <div className="flex space-x-4">
          <Button
            onClick={() => router.push("/admin/dashboard")}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            Volver al dashboard
          </Button>
          <Button
            onClick={() => router.push("/admin/doctors/register")}
            className="bg-[#2eb893] hover:bg-[#269378] text-white"
          >
            Registrar nuevo médico
          </Button>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">No hay médicos registrados.</p>
          <Button
            onClick={() => router.push("/admin/doctors/register")}
            className="bg-[#2eb893] hover:bg-[#269378] text-white"
          >
            Registrar nuevo médico
          </Button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Especialidad
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Lugar de trabajo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contacto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {doctor.firstName} {doctor.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {doctor.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {doctor.specialty.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {doctor.workplace}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {doctor.contactNumber}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
