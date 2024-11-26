import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { Doctor, User } from "./types";
import { db } from "@/firebase/config";

export const fetchAllDoctors = async (): Promise<Doctor[]> => {
  try {
    const doctorsRef = collection(db, "doctors");
    const snapshot = await getDocs(doctorsRef);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: data.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        specialty: {
          id: data.specialty.id,
          name: data.specialty.name,
        },
        email: data.email,
        workplace: data.workplace,
        contactNumber: data.contactNumber,
        createdAt: data.createdAt.toDate(), // Conversión a Date
        updatedAt: data.updatedAt.toDate(), // Conversión a Date
      };
    });
  } catch (error) {
    console.error("Error al obtener los doctores:", error);
    throw new Error("No se pudieron obtener los doctores");
  }
};

export const fetchDoctorsBySpecialty = async (
  specialtyId: string
): Promise<Doctor[]> => {
  try {
    const doctorsRef = collection(db, "doctors");
    const q = query(doctorsRef, where("specialty.id", "==", specialtyId));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: data.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        specialty: {
          id: data.specialty.id,
          name: data.specialty.name,
        },
        email: data.email,
        workplace: data.workplace,
        contactNumber: data.contactNumber,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error) {
    console.error("Error al obtener los doctores por especialidad:", error);
    throw new Error("No se pudieron obtener los doctores por especialidad");
  }
};

export const getDoctorById = async (doctorId: string): Promise<Doctor> => {
  try {
    const doctorsRef = collection(db, "doctors");
    const q = query(doctorsRef, where("uid", "==", doctorId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("No se encontró el doctor con el id proporcionado");
    }

    const data = snapshot.docs[0].data();
    return {
      uid: data.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      specialty: {
        id: data.specialty.id,
        name: data.specialty.name,
      },
      email: data.email,
      workplace: data.workplace,
      contactNumber: data.contactNumber,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  } catch (error) {
    console.error("Error al obtener el doctor por id:", error);
    throw new Error("No se pudo obtener el doctor por id");
  }
};

export const fetchConversationsForDoctor = async (
  doctorId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> => {
  try {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    let totalConversations = 0;

    for (const userDoc of usersSnapshot.docs) {
      const conversationsRef = collection(userDoc.ref, "conversations");
      let q = query(
        conversationsRef,
        where("recommendedDoctorId", "==", doctorId)
      );

      if (startDate) {
        q = query(q, where("createdAt", ">=", Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where("createdAt", "<=", Timestamp.fromDate(endDate)));
      }

      const conversationsSnapshot = await getDocs(q);
      totalConversations += conversationsSnapshot.size;
    }

    return totalConversations;
  } catch (error) {
    console.error("Error al obtener conversaciones para el doctor:", error);
    throw new Error("No se pudieron obtener las conversaciones.");
  }
};

export const fetchUniqueUsersForDoctor = async (
  doctorId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> => {
  try {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    const uniqueUsers = new Set<string>();

    for (const userDoc of usersSnapshot.docs) {
      const conversationsRef = collection(userDoc.ref, "conversations");
      let q = query(
        conversationsRef,
        where("recommendedDoctorId", "==", doctorId)
      );

      if (startDate) {
        q = query(q, where("createdAt", ">=", Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where("createdAt", "<=", Timestamp.fromDate(endDate)));
      }

      const conversationsSnapshot = await getDocs(q);
      if (!conversationsSnapshot.empty) {
        uniqueUsers.add(userDoc.id); // UID del usuario
      }
    }

    return uniqueUsers.size;
  } catch (error) {
    console.error("Error al obtener usuarios únicos para el doctor:", error);
    throw new Error("No se pudieron obtener los usuarios únicos.");
  }
};

export const fetchLastUserForDoctor = async (
  doctorId: string
): Promise<User | null> => {
  try {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    let lastUser: User | null = null;
    let latestDate: Date | null = null;

    for (const userDoc of usersSnapshot.docs) {
      const conversationsRef = collection(userDoc.ref, "conversations");
      const q = query(
        conversationsRef,
        where("recommendedDoctorId", "==", doctorId),
        orderBy("updatedAt", "desc"),
        limit(1)
      );

      const conversationsSnapshot = await getDocs(q);

      if (!conversationsSnapshot.empty) {
        const conversation = conversationsSnapshot.docs[0].data();
        const updatedAt = conversation.updatedAt.toDate();

        if (!latestDate || updatedAt > latestDate) {
          latestDate = updatedAt;
          lastUser = {
            uid: userDoc.id,
            displayName: userDoc.data().displayName,
            email: userDoc.data().email,
            createdAt: userDoc.data().createdAt.toDate(),
            conversations: [],
          };
        }
      }
    }

    return lastUser;
  } catch (error) {
    console.error("Error al obtener el último usuario para el doctor:", error);
    throw new Error("No se pudo obtener el último usuario recomendado.");
  }
};

export const fetchUserListForDoctor = async (
  doctorId: string,
  startDate?: Date,
  endDate?: Date,
  limitResults?: number
): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    const users: User[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const conversationsRef = collection(userDoc.ref, "conversations");
      let q = query(
        conversationsRef,
        where("recommendedDoctorId", "==", doctorId)
      );

      if (startDate) {
        q = query(q, where("createdAt", ">=", Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where("createdAt", "<=", Timestamp.fromDate(endDate)));
      }

      const conversationsSnapshot = await getDocs(q);

      if (!conversationsSnapshot.empty) {
        users.push({
          uid: userDoc.id,
          displayName: userDoc.data().displayName,
          email: userDoc.data().email,
          createdAt: userDoc.data().createdAt.toDate(),
          conversations: [],
        });

        if (limitResults && users.length >= limitResults) break;
      }
    }

    return users;
  } catch (error) {
    console.error(
      "Error al obtener la lista de usuarios para el doctor:",
      error
    );
    throw new Error("No se pudo obtener la lista de usuarios.");
  }
};

/**
 * Actualiza la información de un doctor en Firestore.
 * @param doctorId - UID del doctor a actualizar.
 * @param updatedData - Datos actualizados del doctor.
 * @returns Una promesa que se resuelve si la operación es exitosa.
 */
export const updateDoctor = async (
  doctorId: string,
  updatedData: Partial<Omit<Doctor, "uid" | "createdAt">>
): Promise<void> => {
  try {
    // Referencia al documento del doctor
    const doctorRef = doc(db, "doctors", doctorId);

    // Agregamos `updatedAt` con la fecha actual
    const dataToUpdate = {
      ...updatedData,
      updatedAt: Timestamp.now(),
    };

    // Actualizamos el documento en Firestore
    await updateDoc(doctorRef, dataToUpdate);
    console.log("Doctor actualizado correctamente.");
  } catch (error) {
    console.error("Error al actualizar el doctor:", error);
    throw new Error("No se pudo actualizar la información del doctor.");
  }
};
