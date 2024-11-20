import { Doctor } from "@/utils/types";
import { create } from "zustand";

export type DoctorStore = {
  doctor: Doctor | null;
  setDoctor: (doctor: Doctor) => void;
  logout: () => void;
};

export const useDoctorStore = create<DoctorStore>((set) => ({
  doctor: null,
  setDoctor: (doctor: Doctor) => set({ doctor }),
  logout: () => set({ doctor: null }),
}));
