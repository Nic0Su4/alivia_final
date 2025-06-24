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
  // TODO: Implementar la lógica completa en la Fase 2 del Frontend.
  // Esta función necesitará:
  // 1. Verificar los `workingHours` del doctor para ese día de la semana.
  // 2. Generar todos los slots posibles (ej. cada 30 minutos).
  // 3. Obtener las citas ya 'confirmed' para ese día.
  // 4. Filtrar los slots ya ocupados.

  console.log(
    "Buscando disponibilidad para el doctor",
    doctor.uid,
    "en la fecha",
    date
  );
  // Devolvemos un array de ejemplo por ahora.
  return ["09:00", "09:30", "10:00", "11:00", "15:00", "15:30"];
};
