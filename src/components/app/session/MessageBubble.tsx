"use client";

import { cn } from "@/lib/utils";
import type { ZSessionMessage } from "@/types/session";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { ThinkingTrace } from "@/components/app/session/ThinkingTrace";

interface MessageBubbleProps {
  message: ZSessionMessage;
  isUser?: boolean;
}

export function MessageBubble({ message, isUser = false }: MessageBubbleProps) {
  // Render thinking messages via ThinkingTrace (collapsed, not-streaming)
  if (message.type === "thinking") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <ThinkingTrace
          content={message.content}
          isStreaming={false}
          defaultExpanded={false}
        />
      </motion.div>
    );
  }

  // Hide tool_call / tool_result noise from the chat feed
  if (message.type === "tool_call" || message.type === "tool_result") {
    return null;
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] border border-border/50 bg-secondary px-4 py-3 text-sm text-foreground font-mono">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3"
    >
      <div
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center border border-border/50 bg-card text-foreground",
        )}
      >
        <MessageSquare className="size-3 text-muted-foreground" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-muted-foreground">
            Z
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/50">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="border border-border/50 bg-card px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-foreground">
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}

