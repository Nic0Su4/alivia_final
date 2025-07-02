"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user";
import { User, Appointment } from "@/utils/types";
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
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getAppointmentsForUser } from "@/utils/appointmentUtils";

export default function MyAppointmentsPage() {
  const user = useUserStore((state) => state.user) as User | null;
  const setUser = useUserStore((state) => state.setUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser && !user) {
        setUser(JSON.parse(storedUser));
      } else if (!storedUser && !user) {
        redirect("/");
      }
    }
  }, [user, setUser]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return; // No hacer nada si no hay usuario

      setLoading(true);
      try {
        const fetchedAppointments = await getAppointmentsForUser(user.uid, 10);
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        toast.error("Error al cargar tus citas", {
          description: "Por favor, intenta de nuevo más tarde.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

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
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Mis Citas</CardTitle>
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
                  <TableHead>Doctor</TableHead>
                  <TableHead>Fecha de la Cita</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">
                        {apt.doctorName}
                      </TableCell>
                      <TableCell>
                        {apt.appointmentDate.toDate().toLocaleString("es-PE")}
                      </TableCell>
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No tienes citas agendadas por el momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
