import { collection, getDocs, query, where } from "firebase/firestore";
import { Doctor } from "./types";
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
