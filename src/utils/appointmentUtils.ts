// src/utils/appointmentUtils.ts

import { db } from "@/firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { Appointment, Doctor } from "./types";

/**
 * Crea una nueva solicitud de cita en la base de datos.
 * @param appointmentData - La información de la cita a crear.
 * @returns El ID de la nueva cita.
 */
export const createAppointment = async (
  appointmentData: Omit<Appointment, "id">
): Promise<string> => {
  try {
    const appointmentsRef = collection(db, "appointments");
    const docRef = await addDoc(appointmentsRef, appointmentData);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error("Error al crear la cita:", error);
    throw new Error("No se pudo crear la solicitud de cita.");
  }
};

/**
 * Obtiene todas las citas asociadas a un doctor.
 * @param doctorId - El UID del doctor.
 * @returns Una lista de citas.
 */
export const getAppointmentsForDoctor = async (
  doctorId: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Appointment);
  } catch (error) {
    console.error("Error al obtener las citas del doctor:", error);
    throw new Error("No se pudieron obtener las citas.");
  }
};

/**
 * Actualiza el estado de una cita (ej. de 'pending' a 'confirmed').
 * @param appointmentId - El ID de la cita a actualizar.
 * @param status - El nuevo estado de la cita.
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: "confirmed" | "declined" | "completed"
): Promise<void> => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, { status: status });
  } catch (error) {
    console.error("Error al actualizar el estado de la cita:", error);
    throw new Error("No se pudo actualizar la cita.");
  }
};

/**
 * Obtiene los horarios disponibles de un doctor para una fecha específica.
 * @param doctor - El objeto completo del doctor.
 * @param date - La fecha para la cual se quiere consultar la disponibilidad.
 * @returns Una lista de strings con los horarios disponibles (ej. ["09:00", "09:30"]).
 */
export const getDoctorAvailability = async (
  doctor: Doctor,
  date: Date
): Promise<string[]> => {
  // 1. Obtener los horarios de trabajo del doctor para ese día de la semana
  const dayOfWeek = date.getDay(); // Domingo = 0, Lunes = 1, etc.
  const workingDay = doctor.workingHours?.find(
    (d) => d.dayOfWeek === dayOfWeek
  );

  // Si el doctor no trabaja ese día, devolver un array vacío
  if (!workingDay || !workingDay.slots || workingDay.slots.length === 0) {
    return [];
  }

  // 2. Obtener las citas ya confirmadas para ese día específico
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const appointmentsQuery = query(
    collection(db, "appointments"),
    where("doctorId", "==", doctor.uid),
    where("status", "==", "confirmed"),
    where("appointmentDate", ">=", Timestamp.fromDate(startOfDay)),
    where("appointmentDate", "<=", Timestamp.fromDate(endOfDay))
  );

  const snapshot = await getDocs(appointmentsQuery);
  const bookedTimes = new Set(
    snapshot.docs.map((doc) => {
      const data = doc.data() as Appointment;
      // Formatear la hora a HH:mm para comparar fácilmente
      return data.appointmentDate
        .toDate()
        .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    })
  );

  // 3. Generar todos los slots posibles y filtrar los ocupados
  const availableSlots: string[] = [];
  const slotDuration = 30; // Duración de cada cita en minutos

  for (const slot of workingDay.slots) {
    const startTime = new Date(`${date.toDateString()} ${slot.start}`);
    const endTime = new Date(`${date.toDateString()} ${slot.end}`);

    const currentSlot = startTime;
    while (currentSlot < endTime) {
      const formattedTime = currentSlot.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!bookedTimes.has(formattedTime)) {
        availableSlots.push(formattedTime);
      }

      currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration);
    }
  }

  return availableSlots;
};
