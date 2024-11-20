import { useEffect, useRef } from "react";
import { Message } from "@/utils/types";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div
      ref={scrollContainerRef}
      className="h-[82vh] mx-4 pt-8 overflow-y-auto"
    >
      {messages.length === 0 && (
        <p className="text-center text-gray-500">
          Inicia la conversación describiendo tus síntomas
        </p>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === "bot" ? "justify-start" : "justify-end"
          } mb-4`}
        >
          <div
            className={`p-4 rounded-2xl max-w-[70%] ${
              message.sender === "bot"
                ? "bg-[#8bf9dc] text-gray-800"
                : "bg-[#fadfc4] text-gray-800 mr-4"
            }`}
          >
            <p>{message.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {message.createdAt.toDate().toLocaleDateString()}{" "}
              {message.createdAt.toDate().toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
