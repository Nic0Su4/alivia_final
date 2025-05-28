// components/ConversationList.tsx
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, EditIcon, HeartPulseIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Conversation } from "@/utils/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  onNewConversation: () => void;
  onEditConversation: (conv: Conversation, newName: string) => void;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewConversation,
  onEditConversation,
}: ConversationListProps) {
  const [editingConversationId, setEditingConversationId] = useState<
    string | null
  >(null);
  const [editingTitle, setEditingTitle] = useState("");
  const router = useRouter();

  const startEditingConversation = (conv: Conversation) => {
    setEditingConversationId(conv.id);
    setEditingTitle(conv.name);
  };

  const saveConversationTitle = () => {
    if (editingConversationId) {
      onEditConversation(
        conversations.find((conv) => conv.id === editingConversationId)!,
        editingTitle
      );
      setEditingConversationId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <aside className="w-72 bg-white p-6 shadow-lg h-[calc(100dvh)] flex flex-col justify-between">
      <div>
        <Button className="w-full bg-[#3cc7a7]" onClick={onNewConversation}>
          <PlusIcon className="mr-2" />
          <span className="font-bold">Nueva consulta</span>
        </Button>
        <ScrollArea className="h-[calc(100dvh-10rem)] mt-4 border border-black rounded-lg">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 
              ${
                selectedConversation?.id === conv.id
                  ? "bg-[#3acda8] text-white hover:bg-[#3cc09f]"
                  : "bg-[#f0f0f0] hover:bg-[#e0e0e0] text-black"
              }`}
              onClick={() => onSelectConversation(conv)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HeartPulseIcon
                    className={`h-5 w-5 
                      ${
                        selectedConversation?.id === conv.id
                          ? "text-white"
                          : "text-black"
                      }
                    `}
                  />
                  {editingConversationId === conv.id ? (
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={saveConversationTitle}
                      onKeyPress={(e) =>
                        e.key === "Enter" && saveConversationTitle()
                      }
                      className="text-black"
                    />
                  ) : (
                    <h3
                      className={`ml-3 ${
                        selectedConversation?.id === conv.id
                          ? "font-semibold"
                          : ""
                      }`}
                    >
                      {conv.name}
                    </h3>
                  )}
                </div>
                {editingConversationId !== conv.id && (
                  <Button
                    variant="ghost"
                    onClick={() => startEditingConversation(conv)}
                    className={`
                      ${
                        selectedConversation?.id === conv.id
                          ? "text-white hover:bg-[#3bc4a3]"
                          : "text-gray-600 hover:bg-gray-200"
                      }
                    `}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      <Button className="w-full mt-4 bg-[#3cc7a7]" onClick={handleLogout}>
        <span className="font-bold">Cerrar Sesión</span>
      </Button>
    </aside>
  );
}
