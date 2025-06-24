import { Doctor, Specialty, User } from "../types";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface EnviarMensajeProps {
  mensaje: string;
  history: ChatMessage[];
  specialties: Specialty[];
  userInfo: User | null;
  onStreamUpdate: (chunk: string) => void;
  onSpecialtyRecommendation?: (specialty: Specialty | null) => void;
  selectedSpecialty: Specialty | null;
}

export const CHATBOT_CONSTANTS = {
  MODEL_NAME: "gpt-4o-mini",
  RECOMMENDATION_KEY: "RECOMENDACIÓN DE ESPECIALIDAD:",
  DIAGNOSIS_KEY: "POSIBLES DIAGNÓSTICOS:",
  RECOMMENDATION_REGEX:
    /RECOMENDACIÓN DE ESPECIALIDAD:\s*([\wÁÉÍÓÚáéíóúñÑüÜ]+)/u,
  DIAGNOSIS_REGEX: /POSIBLES DIAGNÓSTICOS:\s*([\wÁÉÍÓÚáéíóúñÑüÜ\s,.\-()]+)/u,
};
