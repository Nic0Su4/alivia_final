import { Timestamp } from "firebase/firestore";

// MODELOS O ENTIDADES

export type Message = {
  id: string;
  content: string;
  createdAt: Timestamp;
  sender: "user" | "bot";
};

export type Conversation = {
  id: string;
  userId: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messages: Message[];
  status: "open" | "closed";
  recommendedSpecialty: Specialty | null;
};

export type User = {
  displayName: string;
  email: string;
  uid: string;
  createdAt: Timestamp;
  birthDate: string;
  phoneNumber: string;
  gender: "Masculino" | "Femenino" | "Otro";
  summaryHistory?: string;
};

export type TimeSlot = {
  start: string; // ej: "09:00"
  end: string; // ej: "13:00"
};

export type WorkDay = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  slots: TimeSlot[];
};

export type Doctor = {
  uid: string;
  firstName: string;
  lastName: string;
  specialty: Specialty;
  email: string;
  workplace: string;
  contactNumber: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  workingHours?: WorkDay[];
};

export type Admin = {
  uid: string;
  email: string;
  createdAt: Timestamp;
  role: "admin";
};

export type Specialty = {
  id: string;
  name: string;
};

export type Appointment = {
  id: string;
  userId: string;
  userName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: Timestamp;
  status: "pending" | "confirmed" | "declined" | "completed";
  createdAt: Timestamp;
};
