// src/components/Chat/AppointmentScheduler.tsx

"use client";

import { useState, useEffect } from "react";
import { Doctor, User } from "@/utils/types";
import {
  getDoctorAvailability,
  createAppointment,
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

interface AppointmentSchedulerProps {
  doctor: Doctor;
  user: User;
  onClose: () => void;
}

export const AppointmentScheduler = ({
  doctor,
  user,
  onClose,
}: AppointmentSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    // No buscar fechas en el pasado
    if (selectedDate < new Date(new Date().toDateString())) return;

    const fetchAvailability = async () => {
      setLoadingSlots(true);
      const slots = await getDoctorAvailability(doctor, selectedDate);
      setAvailableSlots(slots);
      setLoadingSlots(false);
    };
    fetchAvailability();
  }, [selectedDate, doctor]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    setSelectedDate(new Date(date.getTime() + userTimezoneOffset));
  };

  const handleBookAppointment = async (time: string) => {
    setBooking(true);
    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes);

    try {
      await createAppointment({
        userId: user.uid,
        userName: user.displayName,
        doctorId: doctor.uid,
        doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        appointmentDate: Timestamp.fromDate(appointmentDate),
        status: "pending",
        createdAt: Timestamp.now(),
      });
      toast.success("Solicitud de cita enviada", {
        description: `Tu solicitud para el ${appointmentDate.toLocaleDateString()} a las ${time} ha sido enviada.`,
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
        <Input
          type="date"
          onChange={handleDateChange}
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
