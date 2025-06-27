// src/app/panel-doctor/appointments/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useDoctorStore } from "@/store/doctor";
import { Doctor, Appointment } from "@/utils/types";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  getAppointmentsForDoctor,
  updateAppointmentStatus,
} from "@/utils/appointmentUtils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function DoctorAppointmentsPage() {
  const doctor = useDoctorStore((state) => state.doctor) as Doctor | null;
  const setDoctor = useDoctorStore((state) => state.setDoctor);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Usamos useCallback para evitar que la función se recree en cada render
  const fetchAppointments = useCallback(async () => {
    if (!doctor) return;
    setLoading(true);
    try {
      const fetchedAppointments = await getAppointmentsForDoctor(doctor.uid);
      // Ordenar citas por fecha, de más reciente a más antigua
      fetchedAppointments.sort(
        (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
      );
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error al cargar las citas:", error);
      toast.error("Error", {
        description: "No se pudieron cargar las citas.",
      });
    } finally {
      setLoading(false);
    }
  }, [doctor]);

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

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleUpdateStatus = async (
    appointmentId: string,
    status: "confirmed" | "declined"
  ) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      toast.success("Cita actualizada", {
        description: `La cita ha sido marcada como ${
          status === "confirmed" ? "confirmada" : "rechazada"
        }.`,
      });
      // Volver a cargar las citas para reflejar el cambio
      fetchAppointments();
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      toast.error("Error", {
        description: "No se pudo actualizar el estado de la cita.",
      });
    }
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pendiente</Badge>;
      case "confirmed":
        return <Badge variant="success">Confirmada</Badge>;
      case "declined":
        return <Badge variant="destructive">Rechazada</Badge>;
      case "completed":
        return <Badge variant="secondary">Completada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <main className="ml-64 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Fecha de la Cita</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">
                        {apt.userName}
                      </TableCell>
                      <TableCell>
                        {apt.appointmentDate.toDate().toLocaleString("es-PE")}
                      </TableCell>
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {apt.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() =>
                                handleUpdateStatus(apt.id, "confirmed")
                              }
                            >
                              Aceptar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(apt.id, "declined")
                              }
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                        {apt.status !== "pending" && (
                          <p className="text-sm text-gray-500">Sin acciones</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No tienes citas por el momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
