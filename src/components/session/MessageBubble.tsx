"use client";

import { cn } from "@/lib/utils";
import type { ZSessionMessage } from "@/types/session";
import { BookOpen, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: ZSessionMessage;
  isUser?: boolean;
}

const typeConfig = {
  thinking: {
    icon: Zap,
    label: "THOUGHT",
    className: "border-primary/30 bg-primary/5 text-foreground",
    iconClass: "text-primary",
  },
  directive: {
    icon: BookOpen,
    label: "DIRECTIVE",
    className: "border-amber-500/30 bg-amber-500/5 text-foreground",
    iconClass: "text-amber-500",
  },
  message: {
    icon: MessageSquare,
    label: "Z",
    className: "border-border/50 bg-card text-foreground",
    iconClass: "text-muted-foreground",
  },
};

export function MessageBubble({ message, isUser = false }: MessageBubbleProps) {
  const cfg = typeConfig[message.type];
  const Icon = cfg.icon;

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
          "mt-0.5 flex size-6 shrink-0 items-center justify-center border",
          cfg.className,
        )}
      >
        <Icon className={cn("size-3", cfg.iconClass)} />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[9px] font-mono font-bold tracking-widest uppercase",
              cfg.iconClass,
            )}
          >
            {cfg.label}
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/50">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div
          className={cn(
            "border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words",
            cfg.className,
          )}
        >
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}
