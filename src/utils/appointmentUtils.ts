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
  dateString: string
): Promise<string[]> => {
  // --- Paso 1 de depuración: Ver los datos de entrada ---
  console.log("--- Iniciando getDoctorAvailability ---");
  console.log("Buscando para Doctor ID:", doctor.uid);
  console.log("Fecha solicitada (string):", dateString);
  console.log("Horarios de trabajo del doctor:", doctor.workingHours);
  console.log("doctor", doctor);

  if (!dateString) return [];

  const targetDate = new Date(`${dateString}T00:00:00.000Z`);
  const dayOfWeek = targetDate.getUTCDay();

  const workingDay = doctor.workingHours?.find(
    (d) => d.dayOfWeek === dayOfWeek
  );

  console.log(
    `Día de la semana (0-6): ${dayOfWeek}. ¿Se encontró horario laboral?`,
    !!workingDay
  );

  if (!workingDay || !workingDay.slots || workingDay.slots.length === 0) {
    console.log("--- Finalizando: No hay horario laboral para este día. ---");
    return [];
  }

  const startOfDay = Timestamp.fromDate(
    new Date(`${dateString}T00:00:00.000Z`)
  );
  const endOfDay = Timestamp.fromDate(new Date(`${dateString}T23:59:59.999Z`));

  const appointmentsQuery = query(
    collection(db, "appointments"),
    where("doctorId", "==", doctor.uid),
    where("status", "==", "confirmed"),
    where("appointmentDate", ">=", startOfDay),
    where("appointmentDate", "<=", endOfDay)
  );

  const snapshot = await getDocs(appointmentsQuery);
  const bookedTimes = new Set(
    snapshot.docs.map((doc) => {
      const data = doc.data() as Appointment;
      return data.appointmentDate.toDate().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
    })
  );

  console.log("Horarios ya reservados:", Array.from(bookedTimes));

  const availableSlots: string[] = [];
  const slotDuration = 30;

  for (const slot of workingDay.slots) {
    const startTime = new Date(`${dateString}T${slot.start}:00.000Z`);
    const endTime = new Date(`${dateString}T${slot.end}:00.000Z`);

    // --- CORRECCIÓN CLAVE: Usamos un bucle `for` para evitar la mutación del objeto original ---
    for (
      let currentSlot = new Date(startTime); // Creamos una copia para el iterador
      currentSlot < endTime;
      currentSlot.setUTCMinutes(currentSlot.getUTCMinutes() + slotDuration)
    ) {
      const formattedTime = currentSlot.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });

      if (!bookedTimes.has(formattedTime)) {
        availableSlots.push(formattedTime);
      }
    }
  }

  console.log("Horarios disponibles calculados:", availableSlots);
  console.log("--- Finalizando getDoctorAvailability ---");
  return availableSlots;
};
