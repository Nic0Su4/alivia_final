"use client";

import { useEffect, useState } from "react";
import ConversationList from "@/components/Chat/ConversationList";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import Header from "@/components/Chat/Header";
import {
  addMessage,
  addSpecialtyRecommendation,
  createConversation,
  editConversation,
  getUserConversation,
  getUserConversations,
} from "@/utils/conversationUtils";
import { Conversation, Doctor, Message, Specialty, User } from "@/utils/types";
import { useUserStore } from "@/store/user";
import { redirect } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import {
  enviarMensaje,
  iniciarChat,
} from "@/utils/OpenAI/openaiGenerativeUtils";
import { fetchDoctorsBySpecialty } from "@/utils/doctorUtils";
import WellcomeNew from "@/components/ui/WellcomeScreen";
import BrainLoadingScreen from "@/components/ui/loading";
import { getSpecialties } from "@/utils/specialtiesUtils";
import { ChatMessage } from "@/utils/OpenAI/chatbot.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AppointmentScheduler } from "@/components/Chat/AppointmentScheduler";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useUserStore((state) => state.user) as User | null;
  const setUser = useUserStore((state) => state.setUser);

  const [specialtyForScheduling, setSpecialtyForScheduling] =
    useState<Specialty | null>(null);
  const [doctorsForSelection, setDoctorsForSelection] = useState<Doctor[]>([]);
  const [isDoctorSelectionOpen, setIsDoctorSelectionOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] =
    useState<Doctor | null>(null);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  useEffect(() => {
    const fetchSpecialties = async () => {
      const fetchedSpecialties = await getSpecialties();
      setSpecialties(fetchedSpecialties);
    };
    fetchSpecialties();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    } else if (selectedConversation) {
      setIsSidebarOpen(false);
    }
  }, [selectedConversation, isMobile]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser && !user) {
        setUser(JSON.parse(storedUser));
      } else if (!storedUser && !user) {
        redirect("/");
      }

      const fetchConversations = async () => {
        setLoading(true);
        if (!user) return;
        const userConversations = await getUserConversations(user.uid);
        setConversations(userConversations);
        setLoading(false);
      };

      fetchConversations();
    }
  }, [user, setUser]);

  const handleSpecialtyRecommendation = async (specialty: Specialty | null) => {
    if (specialty && selectedConversation && user) {
      setSpecialtyForScheduling(specialty);
      await editConversation(
        user.uid,
        selectedConversation,
        undefined,
        "closed"
      );

      await addSpecialtyRecommendation(
        user.uid,
        selectedConversation,
        specialty
      );

      setSelectedConversation((prev) =>
        prev
          ? { ...prev, status: "closed", recommendedSpecialty: specialty }
          : null
      );
    }
  };

  const handleDoctorSelected = async (doctor: Doctor) => {
    setSelectedDoctorForBooking(doctor); // <-- AHORA SÍ SE USA
    setIsDoctorSelectionOpen(false);
    setIsSchedulerOpen(true);
  };

  const handleOpenScheduleFlow = async () => {
    if (!specialtyForScheduling) return;
    const doctors = await fetchDoctorsBySpecialty(specialtyForScheduling.id);
    setDoctorsForSelection(doctors);
    setIsDoctorSelectionOpen(true);
  };

  const handleBotResponse = async (
    input: string,
    messageId: string,
    specialty: Specialty | null
  ): Promise<string> => {
    let botReplyContent = "";

    const history =
      (selectedConversation?.messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      })) as ChatMessage[]) || [];

    setSelectedConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: messageId,
                content: "",
                createdAt: Timestamp.now(),
                sender: "bot",
              },
            ],
          }
        : prev
    );

    await enviarMensaje({
      mensaje: input,
      history: history,
      specialties,
      userInfo: user,
      onStreamUpdate: (chunk) => {
        botReplyContent += chunk; // Construye la respuesta en tiempo real
        updateBotMessageContent(messageId, botReplyContent);
      },
      onSpecialtyRecommendation: handleSpecialtyRecommendation,
      selectedSpecialty: specialty,
    });

    return botReplyContent;
  };

  const updateMessages = (newMessages: Message[]) => {
    setSelectedConversation((prev) =>
      prev ? { ...prev, messages: newMessages } : prev
    );
  };

  const updateBotMessageContent = (messageId: string, content: string) => {
    if (!selectedConversation) return;

    setSelectedConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.id === messageId ? { ...msg, content } : msg
            ),
          }
        : prev
    );
  };

  const handleSend = async (message: string, specialty: Specialty | null) => {
    if (!message.trim() || !user || !selectedConversation) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: message,
      createdAt: Timestamp.now(),
      sender: "user",
    };

    const botMessageId = crypto.randomUUID(); // Mensaje del bot en preparación

    updateMessages([...selectedConversation.messages, userMessage]);

    try {
      const updatedConversationWithUserMessage = await addMessage(
        user.uid,
        selectedConversation,
        userMessage
      );
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === updatedConversationWithUserMessage.id
            ? updatedConversationWithUserMessage
            : conv
        )
      );

      // Inicia lógica para generar respuesta
      const botReplyContent = await handleBotResponse(
        message,
        botMessageId,
        specialty
      );

      // Crea mensaje final del bot
      const finalBotMessage: Message = {
        id: botMessageId,
        content: botReplyContent,
        createdAt: Timestamp.now(),
        sender: "bot",
      };

      // Agrega el mensaje del usuario a la base de datos
      const updatedConversationWithBotMessage = await addMessage(
        user.uid,
        updatedConversationWithUserMessage,
        finalBotMessage
      );

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === updatedConversationWithBotMessage.id
            ? updatedConversationWithBotMessage
            : conv
        )
      );
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      updateMessages([
        ...selectedConversation!.messages,
        {
          id: botMessageId,
          content: "Error al procesar tu mensaje. Intenta nuevamente.",
          createdAt: Timestamp.now(),
          sender: "bot",
        },
      ]);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    const fetchedConversation = await getUserConversation(
      user!.uid,
      conversation.id
    );
    setSelectedConversation(fetchedConversation);

    const specialty = fetchedConversation?.recommendedSpecialty
      ? fetchedConversation?.recommendedSpecialty
      : null;

    const history =
      (fetchedConversation?.messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      })) as ChatMessage[]) || [];

    setSpecialtyForScheduling(specialty);

    iniciarChat(specialties, history, user);

    if (isMobile) setIsSidebarOpen(false);
  };

  const handleNewConversation = async () => {
    if (!user) return;

    const actualDate = new Date();

    const spanishDate = actualDate.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const newConversation = await createConversation(
      user.uid,
      `Consulta ${spanishDate}`
    );

    setConversations((prev) => [...prev, newConversation]);
    setSelectedConversation(newConversation);
    iniciarChat(specialties, [], user);
    if (isMobile) setIsSidebarOpen(false);
  };

  if (loading) {
    return <BrainLoadingScreen />;
  }

  return (
    <div className="flex min-h-[100dvh] bg-white relative">
      {isSidebarOpen && (
        <div
          className={`${
            isMobile ? "fixed inset-0 bg-black bg-opacity-50 z-10" : "relative"
          }`}
          onClick={() => isMobile && setIsSidebarOpen(false)}
        >
          <div
            className={`${
              isMobile ? "absolute left-0 top-0 w-7/10 h-full bg-white" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onEditConversation={(conv, newName) => {
                editConversation(user!.uid, conv, newName);
                setConversations(
                  conversations.map((c) =>
                    c.id === conv.id ? { ...c, name: newName } : c
                  )
                );
              }}
            />
          </div>
        </div>
      )}

      <div className="flex-1">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isChatView={!!selectedConversation}
          selectedConversation={selectedConversation}
          user={user}
          setConversations={setConversations}
          setSelectedConversation={setSelectedConversation}
        />

        {selectedConversation ? (
          <>
            <MessageList messages={selectedConversation.messages} />
            <MessageInput
              onSend={(message, specialty) => {
                setInput(""); // Limpiar el input después de enviar
                handleSend(message, specialty);
              }}
              input={input}
              setInput={setInput}
              selectedConversation={selectedConversation}
              specialtyForScheduling={specialtyForScheduling}
              onScheduleClick={handleOpenScheduleFlow}
              isChatClosed={selectedConversation?.status === "closed"}
              hasAppointment={!!selectedConversation.appointmentId}
            />
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[calc(100dvh-4rem)]">
            <WellcomeNew onNewConversation={handleNewConversation} />
          </div>
        )}
      </div>

      <Dialog
        open={isDoctorSelectionOpen}
        onOpenChange={setIsDoctorSelectionOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Elige un especialista en {specialtyForScheduling?.name}
            </DialogTitle>
            <DialogDescription>
              Estos son los doctores disponibles para la especialidad que
              necesitas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
            {doctorsForSelection.length > 0 ? (
              doctorsForSelection.map((doc) => (
                <div
                  key={doc.uid}
                  className="flex justify-between items-center p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div>
                    <p className="font-bold">
                      {doc.firstName} {doc.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{doc.workplace}</p>
                  </div>
                  <Button onClick={() => handleDoctorSelected(doc)}>
                    Agendar Cita
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No hay doctores disponibles para esta especialidad en este
                momento.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Agendar la Cita */}
      {selectedDoctorForBooking && user && selectedConversation && (
        <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
          {/* Este componente lo crearemos a continuación */}
          <AppointmentScheduler
            doctor={selectedDoctorForBooking}
            user={user}
            onClose={() => setIsSchedulerOpen(false)}
            conversationId={selectedConversation.id}
          />
        </Dialog>
      )}
    </div>
  );
}
