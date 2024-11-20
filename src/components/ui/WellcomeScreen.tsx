import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageCircle } from "lucide-react";

export default function WelcomeScreen({
  onNewConversation,
}: {
  onNewConversation: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-[#0000000]">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 text-black">
          Bienvenido a AlivIA
        </h2>
        <p className="text-xl text-black">Tu asistente de IA personal</p>
      </div>

      <div className="w-32 h-32 mb-8 relative">
        <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-pulse"></div>
        <MessageCircle
          className="absolute inset-0 m-auto text-teal-300"
          size={64}
        />
      </div>

      <div className="text-center space-y-6 max-w-md">
        <p className="text-lg mb-4 text-black">
          Inicia o selecciona una nueva conversación para comenzar.
        </p>
        <Button
          onClick={onNewConversation}
          className="bg-[#005c7a] text-white hover:bg-[#004c64] transition-colors duration-300 text-lg py-6 px-8"
        >
          <PlusCircle className="mr-3 h-6 w-6" />
          Iniciar nueva conversación
        </Button>
      </div>
    </div>
  );
}
