"use client";

import { cn } from "@/lib/utils";
import type { ZSessionMessage } from "@/types/session";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: ZSessionMessage;
  isUser?: boolean;
  authorName?: string;
}

export function MessageBubble({ message, isUser = false }: MessageBubbleProps) {
  // Hide tool_call / tool_result noise from the chat feed
  if (message.type === "tool_call" || message.type === "tool_result") {
    return null;
  }

  if (isUser || message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-end gap-1"
      >
        <div className="max-w-[80%] border border-border/50 bg-secondary px-4 py-3 text-sm text-foreground font-mono rounded-(--radius)">
          {message.content}
        </div>
        {(message.authorName || authorName) && (
          <span className="text-[9px] font-mono uppercase text-muted-foreground mr-1">
            {message.authorName || authorName}
          </span>
        )}
      </motion.div>
    );
  }

  const isZ = message.role === "z" || message.role === "system";
  const label = isZ ? "Z" : (message.authorName || "Peer");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3"
    >
      <div
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center border border-border/50 bg-card text-foreground rounded-(--radius)",
        )}
      >
        <MessageSquare className="size-3 text-muted-foreground" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[9px] font-mono font-bold tracking-widest uppercase",
            isZ ? "text-primary" : "text-muted-foreground"
          )}>
            {label}
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/50">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="border border-border/50 bg-card px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-foreground rounded-(--radius)">
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}
