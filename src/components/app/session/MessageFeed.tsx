"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain } from "lucide-react";
import type { ZSessionMessage } from "@/types/session";
import { MessageBubble } from "./MessageBubble";
import { ArtifactCard, type ArtifactCardCallbacks } from "./ArtifactCard";

export interface MessageFeedProps extends ArtifactCardCallbacks {
  messages: ZSessionMessage[];
  /** messageId of the currently active (unresolved) artifact, or null if none */
  activeArtifactMessageId?: string | null;
}

export function MessageFeed({
  messages,
  activeArtifactMessageId,
  onSubmitAnswer,
  onApprove,
  onContinue,
  onRetry,
  onSkip,
  onExplainDifferently,
  onTestMe,
  onTryMyself,
  onAction,
  onPomodoroResume,
  onRetryMessage,
  onEditMessage,
  onRateMessage,
}: MessageFeedProps & {
  onRetryMessage?: (id: string, content: string) => void;
  onEditMessage?: (id: string, newContent: string) => void;
  onRateMessage?: (messageId: string, rating: 1 | -1) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex size-16 items-center justify-center border border-primary/30 bg-primary/10 rounded-lg"
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
      {messages.map((msg) => {
        if (msg.type === "system_action") return null;
        if (msg.type === "artifact" || Boolean((msg as any).artifact)) {
          if (!(msg as any).artifact) {
            return <MessageBubble key={msg.id} message={msg} />;
          }

          // An artifact is resolved if its messageId does not match the active one
          const resolved = msg.messageId !== activeArtifactMessageId;

          return (
            <ArtifactCard
              key={msg.id}
              artifact={(msg as any).artifact}
              resolved={resolved}
              onSubmitAnswer={onSubmitAnswer}
              onApprove={onApprove}
              onContinue={onContinue}
              onRetry={onRetry}
              onSkip={onSkip}
              onExplainDifferently={onExplainDifferently}
              onTestMe={onTestMe}
              onTryMyself={onTryMyself}
              onAction={onAction}
              onPomodoroResume={onPomodoroResume}
            />
          );
        }

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            onRetry={onRetryMessage}
            onEdit={onEditMessage}
            onRate={onRateMessage}
          />
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
