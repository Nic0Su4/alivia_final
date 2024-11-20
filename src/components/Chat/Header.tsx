/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Header.tsx
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { deleteConversation } from "@/utils/conversationUtils";
import { Conversation, User } from "@/utils/types";
import { MenuIcon, TrashIcon, Menu } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  onToggleSidebar: () => void;
  isChatView: boolean;
  selectedConversation: Conversation | null;
  user: User | null;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setSelectedConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
}

export default function Header({
  onToggleSidebar,
  isChatView,
  selectedConversation,
  user,
  setConversations,
  setSelectedConversation,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDeleteConversation = () => {
    if (!selectedConversation || !user) return;
    deleteConversation(user.uid, selectedConversation.id);
    setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
    setSelectedConversation(null);
  };
  return (
    <header className={`sticky top-0 z-50 bg-gradient-to-r from-[#3CDBB0] to-[#68E5CE] px-4 flex justify-between items-center h-16 text-white transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-white hover:bg-white/20">
          <Menu className="h-6 w-6" />
        </Button>
        <motion.h1 
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AlivIA
        </motion.h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (!selectedConversation) return;
            deleteConversation(user!.uid, selectedConversation.id);
            setConversations((prev: any) =>
              prev.filter(
                (conv: Conversation) => conv.id !== selectedConversation.id
              )
            );
            setSelectedConversation(null);
          }}
        >
          <TrashIcon className="h-6 w-6" />
        </Button>

      </div>
    </header>
  );
}
