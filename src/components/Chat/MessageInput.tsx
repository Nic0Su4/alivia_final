// components/MessageInput.tsx
import { Button } from "@/components/ui/button";
import { Conversation, Doctor } from "@/utils/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Contact, Phone, Send } from "lucide-react";
import { useEffect } from "react";
import { getDoctorById } from "@/utils/doctorUtils";

interface MessageInputProps {
  onSend: (message: string) => void;
  input: string;
  setInput: (value: string) => void;
  selectedConversation: Conversation | null;
  recommendedDoctor: Doctor | null;
  setRecommendedDoctor: (doctor: Doctor) => void;
}

export default function MessageInput({
  onSend,
  input,
  setInput,
  selectedConversation,
  recommendedDoctor,
  setRecommendedDoctor,
}: MessageInputProps) {
  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  useEffect(() => {
    if (selectedConversation?.recommendedDoctorId) {
      getDoctorById(selectedConversation.recommendedDoctorId).then((doctor) => {
        setRecommendedDoctor(doctor);
      });
    }
  }, [selectedConversation, setRecommendedDoctor]);

  return (
    <div className="flex items-center mx-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={`${
          selectedConversation?.status === "open"
            ? "Escribe tu mensaje..."
            : "Doctor recomendado, chat cerrado"
        }`}
        className="flex-1 resize-none overflow-y-auto rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={selectedConversation?.status === "closed"}
        rows={3}
      />

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSend}
          className="ml-2 p-2"
          disabled={selectedConversation?.status === "closed"}
        >
          <Send className="h-6 w-6" />
        </Button>
        {selectedConversation?.recommendedDoctorId && recommendedDoctor && (
          <Dialog>
            <DialogTrigger className="flex items-center justify-between gap-2 px-4 py-2 bg-blue-500 text-white font-medium text-sm rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition">
              <Contact />
              Ver Recomendación
            </DialogTrigger>
            <DialogContent className="max-w-md p-8 bg-white rounded-lg shadow-lg">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  Doctor Recomendado
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600">
                  Información del especialista recomendado basado en tus
                  síntomas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-lg text-gray-800">
                <p>
                  <span className="font-semibold">Nombre:</span> Dr.{" "}
                  {recommendedDoctor!.firstName} {recommendedDoctor!.lastName}
                </p>
                <p>
                  <span className="font-semibold">Especialidad:</span>{" "}
                  {recommendedDoctor!.specialty.name}
                </p>
                <p>
                  <span className="font-semibold">Ubicación:</span>{" "}
                  {recommendedDoctor!.workplace}
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <a
                  href={`https://wa.me/${recommendedDoctor!.contactNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-8 py-3 bg-green-500 text-white font-medium text-lg rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition"
                >
                  <Phone className="text-xl" />
                  Contactar
                </a>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
