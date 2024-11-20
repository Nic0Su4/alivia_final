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
    <aside className="w-80 bg-white p-6 shadow-lg h-screen flex flex-col justify-between">
      <div>
        <Button className="w-full" onClick={onNewConversation}>
          <PlusIcon className="mr-2" />
          Nueva consulta
        </Button>
        <ScrollArea className="h-[calc(100vh-16rem)] mt-4">
          {conversations.map((conv) => (
            <div
            key={conv.id}
            className={`p-3 rounded-lg cursor-pointer bg-[#fff] hover:bg-[#3bcaa7] transition-colors ${
              selectedConversation?.id === conv.id ? "bg-[#fadfc4]" : ""
            }`}
            onClick={() => onSelectConversation(conv)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HeartPulseIcon className="h-5 w-5 text-black" />
                {editingConversationId === conv.id ? (
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={saveConversationTitle}
                    onKeyPress={(e) => e.key === "Enter" && saveConversationTitle()}
                  />
                ) : (
                  <h3 className="ml-3">{conv.name}</h3>
                )}
              </div>
              {editingConversationId !== conv.id && (
                <Button variant="ghost" onClick={() => startEditingConversation(conv)}>
                  <EditIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          ))}
        </ScrollArea>
      </div>

      <Button className="w-full mt-4 " onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </aside>
  );
}
