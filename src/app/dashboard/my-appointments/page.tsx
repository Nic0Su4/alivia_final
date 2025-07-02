"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user";
import { User, Appointment, Rating } from "@/utils/types";
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
import {
  getAppointmentsForUser,
  submitRatingAndUpdateDoctor,
} from "@/utils/appointmentUtils";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingDialog } from "@/components/Chat/RatingDialog";
import { DoctorProfileDialog } from "@/components/Chat/DoctorProfileDialog";

export default function MyAppointmentsPage() {
  const user = useUserStore((state) => state.user) as User | null;
  const setUser = useUserStore((state) => state.setUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedAppointmentForRating, setSelectedAppointmentForRating] =
    useState<Appointment | null>(null);
  const [viewingDoctorId, setViewingDoctorId] = useState<string | null>(null);

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

  const handleOpenRatingDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseRatingDialog = () => {
    setSelectedAppointment(null);
  };

  const handleViewDoctor = (doctorId: string) => {
    setViewingDoctorId(doctorId);
  };

  const handleRatingSubmit = async (
    ratingData: Omit<Rating, "id" | "createdAt">
  ) => {
    setLoading(true);
    try {
      await submitRatingAndUpdateDoctor(ratingData);
      toast.success("¡Gracias por tu opinión!", {
        description: "Tu calificación ha sido enviada.",
      });
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === ratingData.appointmentId ? { ...apt, isRated: true } : apt
        )
      );
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast.error("Error al enviar calificación", {
        description:
          "No se pudo guardar tu opinión. Por favor, intenta de nuevo.",
      });
    } finally {
      setLoading(false);
      handleCloseRatingDialog(); // Cerrar el modal
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
    <div className="p-8">
      {/* Flecha para regresar */}
      <Link
        href="/dashboard"
        className="flex items-center text-primary-600 hover:underline mb-4"
      >
        <Button className="bg-[#3cc7a7] hover:bg-[#3cc7a7]/80">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Regresar al Dashboard
        </Button>
      </Link>

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
                  <TableHead className="text-right">Acciones</TableHead>
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
                      <TableCell className="text-right">
                        {apt.status === "completed" && !apt.isRated && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRatingDialog(apt)}
                          >
                            Calificar
                          </Button>
                        )}
                        <Button onClick={() => handleViewDoctor(apt.doctorId)}>
                          Ver doctor
                        </Button>
                      </TableCell>
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

      {user && (
        <RatingDialog
          isOpen={!!selectedAppointment}
          onClose={handleCloseRatingDialog}
          appointment={selectedAppointment}
          user={user}
          onSubmit={handleRatingSubmit}
        />
      )}

      <DoctorProfileDialog
        isOpen={!!viewingDoctorId}
        onClose={() => setViewingDoctorId(null)}
        doctorId={viewingDoctorId}
      />
    </div>
  );
}
