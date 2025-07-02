// src/utils/appointmentUtils.ts

import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  limit,
  runTransaction,
  orderBy,
} from "firebase/firestore";
import { Appointment, Doctor, Rating } from "./types";

/**
 * Crea una nueva cita y la vincula a una conversación usando una transacción.
 * @param appointmentData - La información de la cita a crear.
 * @param userId - El ID del usuario.
 * @param conversationId - El ID de la conversación a la que se vinculará la cita.
 * @returns El ID de la nueva cita.
 */
export const createAppointment = async (
  appointmentData: Omit<Appointment, "id">,
  userId: string,
  conversationId: string
): Promise<string> => {
  const appointmentRef = doc(collection(db, "appointments"));
  const conversationRef = doc(
    db,
    "users",
    userId,
    "conversations",
    conversationId
  );

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Crear la nueva cita
      transaction.set(appointmentRef, {
        ...appointmentData,
        id: appointmentRef.id,
      });

      // 2. Actualizar la conversación para vincularla con la cita
      transaction.update(conversationRef, {
        appointmentId: appointmentRef.id,
      });
    });

    return appointmentRef.id;
  } catch (error) {
    console.error("Error en la transacción de creación de cita:", error);
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
  if (!dateString) return [];

  const targetDate = new Date(`${dateString}T00:00:00.000Z`);
  const dayOfWeek = targetDate.getUTCDay();

  const workingDay = doctor.workingHours?.find(
    (d) => d.dayOfWeek === dayOfWeek
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
    where("status", "in", ["pending", "confirmed"]),
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

  const availableSlots: string[] = [];
  const slotDuration = 30;

  for (const slot of workingDay.slots) {
    const startTime = new Date(`${dateString}T${slot.start}:00.000Z`);
    const endTime = new Date(`${dateString}T${slot.end}:00.000Z`);

    for (
      let currentSlot = new Date(startTime);
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

/**
 * Verifica si un usuario ya tiene una cita pendiente o confirmada con un doctor.
 * @param userId El UID del usuario.
 * @param doctorId El UID del doctor.
 * @returns `true` si ya existe una cita, `false` en caso contrario.
 */
export const checkExistingAppointment = async (
  userId: string,
  doctorId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, "appointments"),
      where("userId", "==", userId),
      where("doctorId", "==", doctorId),
      where("status", "in", ["pending", "confirmed"]),
      limit(1)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error al verificar cita existente:", error);
    return false;
  }
};

/**
 * Obtiene todas las citas asociadas a un usuario específico.
 * @param userId - El UID del usuario.
 * @param appointmentLimit - El número máximo de citas a obtener.
 * @returns Una promesa que se resuelve con un array de citas.
 */
export const getAppointmentsForUser = async (
  userId: string,
  appointmentLimit: number
): Promise<Appointment[]> => {
  try {
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(appointmentLimit)
    );

    const snapshot = await getDocs(appointmentsQuery);

    return snapshot.docs.map((doc) => doc.data() as Appointment);
  } catch (error) {
    console.error("Error al obtener las citas del usuario:", error);
    throw new Error("No se pudieron obtener las citas.");
  }
};

/**
 * Guarda una nueva calificación y actualiza el rating promedio del doctor
 * utilizando una transacción para garantizar la consistencia de los datos.
 * @param ratingData Los datos de la calificación a guardar.
 */
export const submitRatingAndUpdateDoctor = async (
  ratingData: Omit<Rating, "id" | "createdAt">
): Promise<void> => {
  const ratingRef = doc(collection(db, "ratings"));
  const doctorRef = doc(db, "doctors", ratingData.toUserId);
  const appointmentRef = doc(db, "appointments", ratingData.appointmentId);

  try {
    await runTransaction(db, async (transaction) => {
      const doctorDoc = await transaction.get(doctorRef);

      if (!doctorDoc.exists()) {
        throw new Error("El doctor no existe.");
      }

      const doctorData = doctorDoc.data() as Doctor;

      const currentRating = doctorData.averageRating || 0;
      const ratingCount = doctorData.ratingCount || 0;
      const newRatingCount = ratingCount + 1;
      const newAverageRating =
        (currentRating * ratingCount + ratingData.rating) / newRatingCount;

      transaction.set(ratingRef, {
        ...ratingData,
        id: ratingRef.id,
        createdAt: Timestamp.now(),
      });

      transaction.update(doctorRef, {
        averageRating: parseFloat(newAverageRating.toFixed(2)), // Redondear a 2 decimales
        ratingCount: newRatingCount,
      });

      transaction.update(appointmentRef, { isRated: true });
    });
  } catch (error) {
    console.error("Error al enviar la calificación:", error);
    throw new Error("No se pudo guardar la calificación. Inténtalo de nuevo.");
  }
};
