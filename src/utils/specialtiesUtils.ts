import { collection, getDocs } from "firebase/firestore";
import { Specialty } from "./types";
import { db } from "@/firebase/config";

export const getSpecialties = async (): Promise<Specialty[]> => {
  try {
    const specialtiesRef = collection(db, "specialties");
    const snapshot = await getDocs(specialtiesRef);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
      };
    });
  } catch (error) {
    console.error("Error al obtener las especialidades:", error);
    throw new Error("No se pudieron obtener las especialidades");
  }
};
