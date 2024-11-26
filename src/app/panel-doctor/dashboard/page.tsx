"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, User as User1 } from "lucide-react";
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
import { Doctor, User } from "@/utils/types";
import {
  fetchConversationsForDoctor,
  fetchUniqueUsersForDoctor,
  fetchLastUserForDoctor,
  fetchUserListForDoctor,
} from "@/utils/doctorUtils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PanelDoctor() {
  const doctor = useDoctorStore((state) => state.doctor) as Doctor | null;
  const setDoctor = useDoctorStore((state) => state.setDoctor);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [lastPatient, setLastPatient] = useState<string | null>(null);
  const [totalConversations, setTotalConversations] = useState(0);
  const [recentPatients, setRecentPatients] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDoctor = localStorage.getItem("doctor");
      if (storedDoctor && !doctor) {
        setDoctor(JSON.parse(storedDoctor));
      } else if (!storedDoctor && !doctor) {
        redirect("/");
      }

      if (!doctor) return;

      setLoading(true);
      // Cargar los datos usando las funciones
      Promise.all([
        fetchConversationsForDoctor(doctor.uid),
        fetchUniqueUsersForDoctor(doctor.uid),
        fetchLastUserForDoctor(doctor.uid),
        fetchUserListForDoctor(doctor.uid, undefined, undefined, 10),
      ])
        .then(([conversations, users, lastUser, userList]) => {
          setTotalConversations(conversations);
          setTotalPatients(users);
          setLastPatient(lastUser ? lastUser.displayName : "N/A");
          setRecentPatients(userList);
        })
        .catch((error) => {
          console.error("Error al cargar los datos del doctor:", error);
          alert(
            "Hubo un problema al cargar los datos. Intenta nuevamente más tarde."
          );
        })
        .finally(() => setLoading(false));
    }
  }, [doctor, setDoctor]);

  return (
    <main className="ml-64 p-8">
      {/* Dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Número de recomendaciones
            </CardTitle>
            <Users className="h-5 w-5 text-[#49deb8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {!loading ? (
                totalConversations
              ) : (
                <Skeleton className="h-6 w-16 bg-[#aef1e1]" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ultimo Paciente Recomendado
            </CardTitle>
            <User1 className="h-5 w-5 text-[#49deb8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {!loading ? (
                lastPatient
              ) : (
                <Skeleton className="h-6 w-16 bg-[#aef1e1]" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Número de recomendaciones a usuarios únicos
            </CardTitle>
            <BarChart className="h-5 w-5 text-[#49deb8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {!loading ? (
                totalPatients
              ) : (
                <Skeleton className="h-6 w-16 bg-[#aef1e1]" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional content can be added here */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Últimos 10 Pacientes Recomendados</CardTitle>
          </CardHeader>
          <CardContent>
            {!loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPatients.map((patient) => (
                    <TableRow key={patient.uid}>
                      <TableCell className="font-medium">
                        {patient.displayName}
                      </TableCell>
                      <TableCell>
                        {patient.createdAt
                          ? patient.createdAt instanceof Date
                            ? patient.createdAt.toLocaleDateString() // Ya es un objeto Date
                            : patient.createdAt.toDate().toLocaleDateString() // Es un Timestamp
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {patient.createdAt
                          ? patient.createdAt instanceof Date
                            ? patient.createdAt.toLocaleTimeString() // Ya es un objeto Date
                            : patient.createdAt.toDate().toLocaleTimeString() // Es un Timestamp
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#49deb8] border-[#49deb8] hover:bg-[#e6faf5]"
                        >
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="space-y-4">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-48 bg-[#aef1e1]" />{" "}
                    {/* Nombre del paciente */}
                    <Skeleton className="h-8 w-36 bg-[#aef1e1]" /> {/* Fecha */}
                    <Skeleton className="h-8 w-36 bg-[#aef1e1]" /> {/* Hora */}
                    <Skeleton className="h-8 w-32 bg-[#aef1e1]" /> {/* Botón */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
