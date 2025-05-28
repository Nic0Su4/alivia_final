"use client";

import { useEffect, useState } from "react";
import ConversationList from "@/components/Chat/ConversationList";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import Header from "@/components/Chat/Header";
import {
  addMessage,
  addRecommendation,
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
import { getDoctorById } from "@/utils/doctorUtils";
import WellcomeNew from "@/components/ui/WellcomeScreen";
import BrainLoadingScreen from "@/components/ui/loading";

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recommendedDoctor, setRecommendedDoctor] = useState<Doctor | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const user = useUserStore((state) => state.user) as User | null;
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Solo ajustamos el sidebar automáticamente en dispositivos móviles
    // o cuando se selecciona una conversación en dispositivos de escritorio
    if (!isMobile) {
      // En dispositivos de escritorio, mantener el sidebar abierto
      // incluso cuando no hay conversación seleccionada
      setIsSidebarOpen(true);
    } else if (selectedConversation) {
      // En móviles, cerrar el sidebar cuando se selecciona una conversación
      setIsSidebarOpen(false);
    }
    // Ya no cerramos el sidebar cuando selectedConversation es null
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

  const handleBotResponse = async (
    input: string,
    messageId: string,
    specialty?: Specialty | null
  ): Promise<string> => {
    let botReplyContent = "";

    const history =
      selectedConversation?.messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      })) || [];

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

    await enviarMensaje(
      input,
      history,
      (chunk) => {
        botReplyContent += chunk; // Construye la respuesta en tiempo real
        updateBotMessageContent(messageId, botReplyContent);
      },
      async (doctor) => {
        if (doctor) {
          await handleDoctorRecommendation(doctor);
        }
      },
      specialty
    );

    return botReplyContent; // Respuesta completa del bot
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

  const handleDoctorRecommendation = async (doctor: Doctor) => {
    setRecommendedDoctor(doctor);

    if (doctor && selectedConversation) {
      await addRecommendation(user!.uid, selectedConversation, doctor.uid);
      editConversation(user!.uid, selectedConversation, undefined, "closed");

      // Actualiza estados de conversación
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? { ...conv, recommendedDoctorId: doctor.uid, status: "closed" }
            : conv
        )
      );

      setSelectedConversation((prev) =>
        prev
          ? { ...prev, recommendedDoctorId: doctor.uid, status: "closed" }
          : prev
      );
    }
  };

  const handleSend = async (message: string, specialty?: Specialty | null) => {
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

    // Input ya se limpia en el componente MessageInput
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    const fetchedConversation = await getUserConversation(
      user!.uid,
      conversation.id
    );
    setSelectedConversation(fetchedConversation);

    const doctor = fetchedConversation?.recommendedDoctorId
      ? await getDoctorById(fetchedConversation.recommendedDoctorId)
      : null;

    setRecommendedDoctor(doctor);

    iniciarChat(
      fetchedConversation?.messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      })) || []
    );

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
    iniciarChat([]);
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
              recommendedDoctor={recommendedDoctor}
              setRecommendedDoctor={setRecommendedDoctor}
            />
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[calc(100dvh-4rem)]">
            <WellcomeNew onNewConversation={handleNewConversation} />
          </div>
        )}
      </div>
    </div>
  );
}
