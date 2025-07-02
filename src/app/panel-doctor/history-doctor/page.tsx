"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { useDoctorStore } from "@/store/doctor";
import { Doctor, User as UserType } from "@/utils/types";
import { fetchUserListForDoctor } from "@/utils/doctorUtils";

export default function DoctorPatientHistory() {
  const doctor = useDoctorStore((state) => state.doctor) as Doctor | null;
  const setDoctor = useDoctorStore((state) => state.setDoctor);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDoctor = localStorage.getItem("doctor");
      if (storedDoctor && !doctor) {
        setDoctor(JSON.parse(storedDoctor));
      } else if (!storedDoctor && !doctor) {
        redirect("/");
      }
    }
  }, [doctor, setDoctor]);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [patients, setPatients] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearchPatients = async () => {
    if (!doctor) return;
    console.log("hola");
    setLoading(true);
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const fetchedPatients = await fetchUserListForDoctor(
        doctor.uid,
        start,
        end
      );

      setPatients(fetchedPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      alert("No se pudieron cargar los pacientes. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ml-64 p-8">
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Historial de Pacientes Recomendados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm">Fecha Inicio:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm">Fecha Fin:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSearchPatients}
                disabled={loading}
                className="bg-[#49deb8] hover:bg-[#3bc4a3]"
              >
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.uid}>
                    <TableCell className="font-medium">
                      {patient.displayName}
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>
                      {patient.createdAt
                        ? patient.createdAt instanceof Date
                          ? patient.createdAt.toLocaleDateString() // Ya es un objeto Date
                          : patient.createdAt.toDate().toLocaleDateString() // Es un Timestamp
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {patients.length === 0 && !loading && (
              <div className="text-center text-gray-500 py-4">
                No se encontraron pacientes en el rango de fechas seleccionado.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
