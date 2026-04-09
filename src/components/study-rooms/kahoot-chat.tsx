"use client";

import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { StudyRoomMessage } from "@/hooks/study-rooms/use-study-rooms";
import { cn } from "@/lib/utils";

interface KahootChatProps {
  messages: StudyRoomMessage[];
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  typingUsers: string[];
  myDisplayName: string;
  isOpen: boolean;
  onClose: () => void;
}

const buildAvatarUri = (seed: string): string => {
  const svg = createAvatar(avataaars, {
    seed: seed || "guest",
    backgroundColor: ["d1d4f9", "c0aede", "b6e3f4", "ffd5dc"],
  }).toString();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export function KahootChat({
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
  myDisplayName,
  isOpen,
  onClose,
}: KahootChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
    onTyping(false);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    onTyping(val.length > 0);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-white/20 bg-indigo-900/90 shadow-2xl backdrop-blur-xl sm:w-96"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-(--radius) bg-indigo-500 shadow-lg">
            <MessageSquare className="size-5 text-white" />
          </div>
          <div>
            <h3 className="font-black tracking-tight text-white uppercase text-sm">Study Chat</h3>
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest leading-none">
              {messages.length} Messages
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-(--radius) text-indigo-300 hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((m, i) => {
            const isMine = m.senderName === myDisplayName;
            const previous = i > 0 ? messages[i - 1] : null;
            const isGrouped = previous?.senderName === m.senderName;

            return (
              <div
                key={m._id || i}
                className={cn(
                  "flex flex-col gap-1.5",
                  isMine ? "items-end" : "items-start",
                  isGrouped ? "mt-1" : "mt-4"
                )}
              >
                {!isGrouped && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-1">
                    {m.senderName}
                  </span>
                )}
                <div className={cn("flex gap-2 max-w-[85%]", isMine ? "flex-row-reverse" : "flex-row")}>
                   {!isGrouped && (
                     <div className="size-8 flex-shrink-0 rounded-full bg-white/10 border border-white/20 overflow-hidden shadow-inner mt-auto">
                        <img src={buildAvatarUri(m.senderName)} alt="" className="size-full" />
                     </div>
                   )}
                   {isGrouped && <div className="size-8 flex-shrink-0" />}
                   
                   <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm shadow-lg",
                      isMine
                        ? "rounded-tr-none bg-indigo-600 text-white border-b-4 border-indigo-700 font-medium"
                        : "rounded-tl-none bg-white text-indigo-900 border-b-4 border-slate-200 font-semibold"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
          
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-3 mt-4"
              >
                <div className="flex -space-x-2">
                  {typingUsers.slice(0, 3).map((u) => (
                    <div key={u} className="size-6 rounded-full border-2 border-indigo-900 bg-white/20 overflow-hidden">
                      <img src={buildAvatarUri(u)} alt="" className="size-full" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5 px-3 py-2 bg-white/10 rounded-full border border-white/10 shadow-sm">
                  <span className="size-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <span className="size-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="size-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-white/10 p-6 bg-white/5 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.3)]">
        <div className="flex gap-2 p-1.5 bg-white rounded-(--radius) shadow-inner border-2 border-transparent focus-within:border-indigo-500 transition-all">
          <Input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Level up with your chat..."
            className="border-none bg-transparent focus-visible:ring-0 placeholder:text-slate-400 text-indigo-950 font-medium h-10"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-(--radius) bg-indigo-600 hover:bg-indigo-700 text-white shadow-md w-10 flex-shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
