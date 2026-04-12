"use client";

import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { StudyRoomMessage } from "@/hooks/study-rooms/use-study-rooms";
import { cn } from "@/lib/utils";

interface SprintChatProps {
  messages: StudyRoomMessage[];
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  typingUsers: string[];
  myDisplayName: string;
  isOpen: boolean;
  onClose: () => void;
}

const buildAvatarUri = (seed: string): string =>
  createAvatar(avataaars, {
    seed: seed || "guest",
    backgroundColor: ["d1d4f9", "c0aede", "b6e3f4", "ffd5dc"],
  }).toDataUri();

export function SprintChat({
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
  myDisplayName,
  isOpen,
  onClose,
}: SprintChatProps) {
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
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-y-0 right-0 z-[110] flex w-full flex-col border-l border-border/50 bg-background shadow-2xl sm:w-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-(--radius) bg-primary/10">
            <MessageSquare className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-foreground leading-none">
              Sprint Comms
            </p>
            <p className="mt-1 text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground leading-none">
              {messages.length} messages
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-(--radius) text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        <div className="flex flex-col gap-1">
          {messages.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                No messages yet. Say something!
              </p>
            </div>
          )}

          {messages.map((m, i) => {
            const isMine = m.senderName === myDisplayName;
            const prev = i > 0 ? messages[i - 1] : null;
            const isGrouped = prev?.senderName === m.senderName;

            return (
              <div
                key={m._id || i}
                className={cn(
                  "flex flex-col",
                  isMine ? "items-end" : "items-start",
                  isGrouped ? "mt-0.5" : "mt-4",
                )}
              >
                {!isGrouped && (
                  <span
                    className={cn(
                      "mb-1 px-1 text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground",
                      isMine ? "text-right" : "text-left",
                    )}
                  >
                    {m.senderName}
                  </span>
                )}

                <div className={cn("flex max-w-[85%] gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
                  {/* Avatar — shown only on first message in a group */}
                  {!isGrouped ? (
                    <div className="size-7 shrink-0 self-end overflow-hidden rounded-full border border-border/50 bg-muted shadow-sm">
                      <img src={buildAvatarUri(m.senderName)} alt="" className="size-full" />
                    </div>
                  ) : (
                    <div className="size-7 shrink-0" />
                  )}

                  <div
                    className={cn(
                      "rounded-(--radius) px-3 py-2 text-xs shadow-sm",
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground border border-border/50",
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicators */}
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-4 flex items-center gap-2"
              >
                <div className="flex -space-x-2">
                  {typingUsers.slice(0, 3).map((u) => (
                    <div
                      key={u}
                      className="size-6 overflow-hidden rounded-full border-2 border-background bg-muted"
                    >
                      <img src={buildAvatarUri(u)} alt="" className="size-full" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 rounded-(--radius) border border-border/50 bg-muted px-3 py-2 shadow-sm">
                  <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/50 bg-muted/5 p-4">
        <div className="flex gap-2 rounded-(--radius) border border-border/50 bg-background p-1 shadow-inner transition-colors focus-within:border-primary/50">
          <Input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Relay message..."
            className="h-9 border-none bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="size-9 shrink-0 rounded-(--radius)"
          >
            <Send className="size-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
