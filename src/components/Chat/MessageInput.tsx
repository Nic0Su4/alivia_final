// components/MessageInput.tsx
import { Button } from "@/components/ui/button";
import { Conversation, Specialty } from "@/utils/types";
import { Send, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { getSpecialties } from "@/utils/specialtiesUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface MessageInputProps {
  onSend: (message: string, specialty: Specialty | null) => void;
  input: string;
  setInput: (value: string) => void;
  isChatClosed: boolean;
  specialtyForScheduling: Specialty | null;
  selectedConversation: Conversation | null;
  onScheduleClick: () => void;
  hasAppointment: boolean;
}

export default function MessageInput({
  onSend,
  input,
  setInput,
  isChatClosed,
  specialtyForScheduling,
  onScheduleClick,
  selectedConversation,
  hasAppointment,
}: MessageInputProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(
    null
  );

  const handleSend = () => {
    if (input.trim()) {
      onSend(input, selectedSpecialty);
      setInput("");
    }
  };

  useEffect(() => {
    const loadSpecialties = async () => {
      const specialtiesList = await getSpecialties();
      setSpecialties(specialtiesList);
    };

    loadSpecialties();
  }, []);

  useEffect(() => {
    if (selectedConversation?.recommendedSpecialty) {
      setSelectedSpecialty(selectedConversation.recommendedSpecialty);
    }
  }, [selectedConversation, setSelectedSpecialty]);

  return (
    <div className="flex flex-col p-4 gap-2 bg-[#49deb9] h-auto">
      {/* Selector de especialidad */}
      {!isChatClosed && (
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="h-5 w-5 text-gray-700" />
          <Select
            value={selectedSpecialty?.id || "none"}
            onValueChange={(value) => {
              if (value === "none") {
                setSelectedSpecialty(null);
              } else {
                const specialty = specialties.find((s) => s.id === value);
                if (specialty) setSelectedSpecialty(specialty);
              }
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Seleccionar especialidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin especialidad</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSpecialty && (
            <span className="text-sm text-green-600 font-medium">
              Modo especializado: {selectedSpecialty.name}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            hasAppointment
              ? "Ya tienes una cita agendada para esta consulta"
              : isChatClosed
              ? "Esta conversación ha finalizado"
              : "Escribe tu mensaje"
          }
          className="flex-1 resize-none overflow-y-auto rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isChatClosed || hasAppointment}
          rows={3}
        />

        <div className="flex items-center gap-3">
          {!isChatClosed && (
            <Button
              onClick={handleSend}
              className="ml-2 p-2"
              disabled={selectedConversation?.status === "closed"}
            >
              <Send className="h-6 w-6" />
            </Button>
          )}

          {/* Se muestra solo si hay una especialidad recomendada y el chat está CERRADO */}
          {isChatClosed && !hasAppointment && specialtyForScheduling && (
            <Button
              onClick={onScheduleClick}
              className="bg-blue-500 hover:bg-blue-600 ml-2"
            >
              <Stethoscope className="mr-2 h-5 w-5" />
              Agendar Cita
            </Button>
          )}

          {isChatClosed && hasAppointment && (
            <Button disabled variant="secondary" className="ml-2">
              Cita Agendada
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
