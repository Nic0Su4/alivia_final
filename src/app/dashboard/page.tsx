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
import { Conversation, Doctor, Message, User } from "@/utils/types";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recommendedDoctor, setRecommendedDoctor] = useState<Doctor | null>(null);
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
    if (!selectedConversation) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [selectedConversation]);

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

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedConversation) {
        const conversation = await getUserConversation(
          user!.uid,
          selectedConversation.id
        );
        setMessages(conversation?.messages || []);
      }
    };

    fetchMessages();
  }, [selectedConversation, user]);

  const handleSend = async () => {
    if (!input.trim() || !user || !selectedConversation) return;

    const messageId = crypto.randomUUID();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      createdAt: Timestamp.now(),
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    let botReplyContent = "";

    try {
      const history = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: messageId,
          content: "",
          createdAt: Timestamp.now(),
          sender: "bot",
        },
      ]);

      await enviarMensaje(
        input,
        history,
        (chunk) => {
          botReplyContent += chunk;

          setMessages((prevMessages) => {
            const messagesWithoutCurrrentBot = prevMessages.filter(
              (msg) => msg.id !== messageId
            );

            return [
              ...messagesWithoutCurrrentBot,
              {
                id: messageId,
                content: botReplyContent,
                createdAt: Timestamp.now(),
                sender: "bot",
              },
            ];
          });
        },
        (doctor) => {
          setRecommendedDoctor(doctor);
          if (doctor) {
            addRecommendation(user.uid, selectedConversation, doctor.uid);
            setConversations((prev: Conversation[]) =>
              prev.map((conv: Conversation) =>
                conv.id === selectedConversation.id
                  ? { ...conv, recommendedDoctorId: doctor.uid }
                  : conv
              )
            );
            setSelectedConversation((prev) =>
              prev ? { ...prev, recommendedDoctorId: doctor.uid } : prev
            );
          }
        }
      );

      const updatedConversation = await addMessage(
        user.uid,
        selectedConversation,
        userMessage
      );

      const finalBotMessage: Message = {
        id: messageId,
        content: botReplyContent,
        createdAt: Timestamp.now(),
        sender: "bot",
      };

      await addMessage(user.uid, updatedConversation, finalBotMessage);

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === updatedConversation.id ? updatedConversation : conv
        )
      );
    } catch (error) {
      console.error("Error al generar la respuesta del bot:", error);
      setMessages((prevMessages) => {
        const messagesWithoutError = prevMessages.filter(
          (msg) => msg.id !== messageId
        );
        return [
          ...messagesWithoutError,
          {
            id: messageId,
            content: "Error al generar la respuesta. Por favor, intenta nuevamente.",
            createdAt: Timestamp.now(),
            sender: "bot",
          },
        ];
      });
    }

    setInput("");
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    const fetchedConversation = await getUserConversation(
      user!.uid,
      conversation.id
    );
    setMessages(fetchedConversation?.messages || []);
    setSelectedConversation(fetchedConversation);

    const doctor = fetchedConversation?.recommendedDoctorId
      ? await getDoctorById(fetchedConversation.recommendedDoctorId)
      : null;

    setRecommendedDoctor(doctor);

    const conversationHistory = fetchedConversation?.messages.map(
      (message) => ({
        role: message.sender === "user" ? "user" : "assistant",
        content: message.content,
      })
    );

    iniciarChat(conversationHistory ? conversationHistory : []);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleNewConversation = async () => {
    if (!user) return;
    const newConversation = await createConversation(
      user.uid,
      "Nueva consulta"
    );

    setConversations((prev) => [...prev, newConversation]);
    setMessages([]);
    setSelectedConversation(newConversation);
    setUser({
      ...user,
      conversations: [...conversations, newConversation],
    });
    iniciarChat([]);
    if (isMobile) setIsSidebarOpen(false);
  };

  if (loading) {
    return <BrainLoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-white relative">
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
            <MessageList messages={messages} />
            <MessageInput
              onSend={handleSend}
              input={input}
              setInput={setInput}
              selectedConversation={selectedConversation}
              recommendedDoctor={recommendedDoctor}
              setRecommendedDoctor={setRecommendedDoctor}
            />
          </>
        ) : (
          <div className="p-8 flex items-center justify-center h-screen">
            <WellcomeNew onNewConversation={handleNewConversation} />
          </div>
        )}
      </div>
    </div>
  );
}