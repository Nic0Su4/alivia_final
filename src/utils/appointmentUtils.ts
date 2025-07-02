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
import { Appointment, Doctor } from "./types";

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
    // 1. Creamos una consulta a la colección 'appointments'.
    const appointmentsQuery = query(
      collection(db, "appointments"),
      // 2. Filtramos los documentos donde el campo 'userId' coincida con el ID proporcionado.
      where("userId", "==", userId),
      // 3. Ordenamos las citas por fecha de creación, de más reciente a más antigua.
      orderBy("createdAt", "desc"),
      // 4. Limítamos a 10 citas (puedes ajustar este número según tus necesidades).
      limit(appointmentLimit)
    );

    // 4. Ejecutamos la consulta.
    const snapshot = await getDocs(appointmentsQuery);

    // 5. Mapeamos los resultados al tipo 'Appointment'.
    return snapshot.docs.map((doc) => doc.data() as Appointment);
  } catch (error) {
    console.error("Error al obtener las citas del usuario:", error);
    // 6. En caso de error, lanzamos una excepción para que el componente que llama pueda manejarla.
    throw new Error("No se pudieron obtener las citas.");
  }
};
