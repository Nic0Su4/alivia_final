// src/components/Chat/AppointmentScheduler.tsx

"use client";

import { useState, useEffect } from "react";
import { Conversation, Doctor, User } from "@/utils/types";
import {
  getDoctorAvailability,
  createAppointment,
  checkExistingAppointment,
} from "@/utils/appointmentUtils"; // Necesitarás este archivo
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { AlertCircle } from "lucide-react";

interface AppointmentSchedulerProps {
  doctor: Doctor;
  user: User;
  onClose: () => void;
  conversationId: string;
  selectedConversation: Conversation;
  setSelectedConversation: (conversation: Conversation | null) => void;
}

export const AppointmentScheduler = ({
  doctor,
  user,
  onClose,
  conversationId,
  selectedConversation,
  setSelectedConversation,
}: AppointmentSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const [hasExistingAppointment, setHasExistingAppointment] =
    useState<boolean>(false);

  useEffect(() => {
    const checkAndFetch = async () => {
      const existing = await checkExistingAppointment(user.uid, doctor.uid);
      if (existing) {
        setHasExistingAppointment(true);
        setLoadingSlots(false);
        return;
      }

      setHasExistingAppointment(false);

      if (selectedDate) {
        setLoadingSlots(true);
        const slots = await getDoctorAvailability(doctor, selectedDate);
        setAvailableSlots(slots);
        setLoadingSlots(false);
      }
    };

    checkAndFetch();
  }, [selectedDate, doctor, user.uid]);

  const handleBookAppointment = async (time: string) => {
    setBooking(true);
    const appointmentDateTime = new Date(`${selectedDate}T${time}:00.000Z`);

    try {
      const appointmentId = await createAppointment(
        {
          userId: user.uid,
          userName: user.displayName,
          doctorId: doctor.uid,
          doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          appointmentDate: Timestamp.fromDate(appointmentDateTime),
          status: "pending",
          createdAt: Timestamp.now(),
        },
        user.uid,
        conversationId
      );

      // Actualizamos el frontend
      setSelectedConversation({
        ...selectedConversation,
        status: "closed",
        appointmentId: appointmentId,
      });

      toast.success("Solicitud de cita enviada", {
        description: `Tu solicitud para el ${new Date(
          appointmentDateTime
        ).toLocaleDateString()} a las ${time} ha sido enviada.`,
      });
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error al agendar", {
        description: "No se pudo crear la solicitud. Intenta de nuevo.",
      });
    } finally {
      setBooking(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Agenda una cita con Dr. {doctor.firstName} {doctor.lastName}
        </DialogTitle>
        <DialogDescription>
          Selecciona una fecha y luego elige una hora disponible.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        {hasExistingAppointment ? (
          <div className="flex flex-col items-center justify-center text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="font-semibold">
              Ya tienes una cita pendiente o confirmada con este doctor.
            </p>
            <p className="text-sm text-gray-600">
              Por favor, espera la confirmación o revisa el estado de tu cita en
              tu perfil.
            </p>
          </div>
        ) : (
          <>
            <Input
              type="date"
              onChange={(e) => setSelectedDate(e.target.value)}
              defaultValue={new Date().toISOString().split("T")[0]}
              min={new Date().toISOString().split("T")[0]}
            />
            {loadingSlots ? (
              <div className="flex justify-center items-center h-32">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                {availableSlots.length > 0 ? (
                  availableSlots.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      onClick={() => handleBookAppointment(time)}
                      disabled={booking}
                    >
                      {time}
                    </Button>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500 py-8">
                    No hay horarios disponibles para este día.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {booking && (
        <p className="text-sm text-center text-gray-600">
          Enviando solicitud...
        </p>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost" type="button">
            Cancelar
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};
