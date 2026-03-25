"use client";

import { useEffect, useRef } from "react";
import type { ZSessionMessage } from "@/types/session";
import { MessageBubble } from "@/components/app/session";
import { ThinkingTrace } from "@/components/app/session";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface SessionMessagesProps {
  messages: ZSessionMessage[];
  isThinking: boolean;
  thinkingBuffer: string;
}

export function SessionMessages({
  messages,
  isThinking,
  thinkingBuffer,
}: SessionMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages / thinking updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking, thinkingBuffer]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex size-16 items-center justify-center border border-primary/30 bg-primary/10 rounded-(--radius)"
        >
          <Brain className="size-8 text-primary" />
        </motion.div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Session started — send your first message
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Live thinking trace */}
      {isThinking && (
        <ThinkingTrace
          content={thinkingBuffer}
          isStreaming={true}
          defaultExpanded={true}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
