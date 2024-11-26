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
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messages: Message[];
  status: "open" | "closed";
  recommendedDoctorId: string | null;
};

export type User = {
  displayName: string;
  email: string;
  uid: string;
  createdAt: Timestamp;
  conversations: Conversation[];
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
};

export type Specialty = {
  id: string;
  name: string;
};
