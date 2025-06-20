/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  collectionGroup,
  doc,
  getCountFromServer,
  getDoc,
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

interface PatientStats {
  totalPatients: number;
  genderDistribution: {
    masculino: number; // Porcentaje (0-100)
    femenino: number;
    otro: number;
  };
  ageDistribution: {
    nino: number; // 0-17 años
    joven: number; // 18-29 años
    adulto: number; // 30-59 años
    adultoMayor: number; // 60+ años
  };
}

const calculateAge = (birthDate: string | Date): number => {
  const birthDateObj =
    typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDifference = today.getMonth() - birthDateObj.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }
  return age;
};

// Helper para clasificar la edad en grupos
type AgeGroup = "nino" | "joven" | "adulto" | "adultoMayor";

const getAgeGroup = (age: number): AgeGroup => {
  if (age <= 17) return "nino";
  if (age <= 29) return "joven";
  if (age <= 59) return "adulto";
  return "adultoMayor";
};

export const getDoctorPatientStats = async (
  doctorId: string
): Promise<PatientStats> => {
  // 1. Reutilizamos la función que ya tienes para obtener todos los pacientes
  const patients = await fetchUserListForDoctor(doctorId);
  const totalPatients = patients.length;

  // Si no hay pacientes, devolvemos estadísticas en cero.
  if (totalPatients === 0) {
    return {
      totalPatients: 0,
      genderDistribution: { masculino: 0, femenino: 0, otro: 0 },
      ageDistribution: { nino: 0, joven: 0, adulto: 0, adultoMayor: 0 },
    };
  }

  // 2. Inicializamos contadores
  const genderCounts = { masculino: 0, femenino: 0, otro: 0 };
  const ageCounts = { nino: 0, joven: 0, adulto: 0, adultoMayor: 0 };

  // 3. Procesamos cada paciente para contar
  for (const patient of patients) {
    // Conteo por género
    switch (patient.gender) {
      case "Masculino":
        genderCounts.masculino++;
        break;
      case "Femenino":
        genderCounts.femenino++;
        break;
      case "Otro":
        genderCounts.otro++;
        break;
    }

    // Conteo por edad
    const age = calculateAge(patient.birthDate);
    const ageGroup = getAgeGroup(age);
    ageCounts[ageGroup]++;
  }

  // 4. Calculamos y devolvemos los porcentajes
  return {
    totalPatients,
    genderDistribution: {
      masculino: (genderCounts.masculino / totalPatients) * 100,
      femenino: (genderCounts.femenino / totalPatients) * 100,
      otro: (genderCounts.otro / totalPatients) * 100,
    },
    ageDistribution: {
      nino: (ageCounts.nino / totalPatients) * 100,
      joven: (ageCounts.joven / totalPatients) * 100,
      adulto: (ageCounts.adulto / totalPatients) * 100,
      adultoMayor: (ageCounts.adultoMayor / totalPatients) * 100,
    },
  };
};

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
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
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
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
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
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
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
    let q = query(
      collectionGroup(db, "conversations"),
      where("recommendedDoctorId", "==", doctorId)
    );

    if (startDate) {
      q = query(q, where("createdAt", ">=", Timestamp.fromDate(startDate)));
    }
    if (endDate) {
      q = query(q, where("createdAt", "<=", Timestamp.fromDate(endDate)));
    }

    const snapshot = await getCountFromServer(q);

    return snapshot.data().count;
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
    let q = query(
      collectionGroup(db, "conversations"),
      where("recommendedDoctorId", "==", doctorId)
    );

    if (startDate) {
      q = query(q, where("createdAt", ">=", Timestamp.fromDate(startDate)));
    }
    if (endDate) {
      q = query(q, where("createdAt", "<=", Timestamp.fromDate(endDate)));
    }

    const conversationsSnapshot = await getDocs(q);
    const uniqueUsers = new Set<string>();

    conversationsSnapshot.forEach((conversationDoc) => {
      const conversation = conversationDoc.data();
      const userId = conversation.userId;
      uniqueUsers.add(userId);
    });

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
    const q = query(
      collectionGroup(db, "conversations"),
      where("recommendedDoctorId", "==", doctorId),
      orderBy("updatedAt", "desc"),
      limit(1)
    );

    const conversationSnap = await getDocs(q);

    if (conversationSnap.empty) {
      return null;
    }

    const lastConversation = conversationSnap.docs[0].data();
    const userId = lastConversation.userId;

    if (!userId) {
      throw new Error("La conversación no tiene un ID de usuario asociado.");
    }

    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return null;
    }

    const userData = userDocSnap.data();
    return {
      uid: userDocSnap.id,
      displayName: userData.displayName,
      email: userData.email,
      createdAt: userData.createdAt.toDate(),
      phoneNumber: userData.phoneNumber,
      birthDate: userData.birthDate,
      gender: userData.gender,
      summaryHistory: userData.summaryHistory,
    };
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
    let q = query(
      collectionGroup(db, "conversations"),
      where("recommendedDoctorId", "==", doctorId)
    );

    if (startDate) {
      q = query(q, where("createdAt", ">=", Timestamp.fromDate(startDate)));
    }
    if (endDate) {
      q = query(q, where("createdAt", "<=", Timestamp.fromDate(endDate)));
    }

    const conversationsSnapshot = await getDocs(q);
    const userIds = new Set<string>();

    conversationsSnapshot.forEach((doc) => {
      userIds.add(doc.data().userId);
    });

    const userFetchPromises: Promise<User | null>[] = [];

    let userIdsToFetch = Array.from(userIds);
    if (limitResults) {
      userIdsToFetch = userIdsToFetch.slice(0, limitResults);
    }

    for (const userId of userIdsToFetch) {
      const userDocRef = doc(db, "users", userId);
      userFetchPromises.push(
        getDoc(userDocRef).then((userDoc) => {
          if (!userDoc.exists()) return null;
          const userData = userDoc.data();
          return {
            uid: userDoc.id,
            displayName: userData.displayName,
            email: userData.email,
            createdAt: userData.createdAt.toDate(),
            phoneNumber: userData.phoneNumber,
            birthDate: userData.birthDate,
            gender: userData.gender,
            summaryHistory: userData.summaryHistory,
          };
        })
      );
    }

    const resolvedUsers = await Promise.all(userFetchPromises);

    return resolvedUsers.filter((user): user is User => user !== null);
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
