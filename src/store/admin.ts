import { Admin } from "@/utils/types";
import { create } from "zustand";

export type AdminStore = {
  admin: Admin | null;
  setAdmin: (admin: Admin) => void;
  logout: () => void;
};

export const useAdminStore = create<AdminStore>((set) => ({
  admin: null,
  setAdmin: (admin: Admin) => set({ admin }),
  logout: () => set({ admin: null }),
}));
