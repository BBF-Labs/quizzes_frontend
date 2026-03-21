"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import type { ZSessionMessage } from "@/types/session";
import { MessageBubble } from "@/components/app/session";
import { ThinkingTrace } from "@/components/app/session";
import { DirectiveCard } from "@/components/app/session";
import type { DirectiveCardCallbacks } from "@/components/app/session";

export interface MessageFeedProps extends DirectiveCardCallbacks {
  messages: ZSessionMessage[];
  isThinking: boolean;
  thinkingBuffer: string;
  /** messageId of the currently active (unresolved) directive, or null if none */
  activeDirectiveMessageId: string | null;
}

export function MessageFeed({
  messages,
  isThinking,
  thinkingBuffer,
  activeDirectiveMessageId,
  onSubmitAnswer,
  onApprove,
  onContinue,
  onRetry,
  onSkip,
  onExplainDifferently,
  onTestMe,
  onTryMyself,
  onAction,
}: MessageFeedProps) {
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
          className="flex size-16 items-center justify-center border border-primary/30 bg-primary/10"
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
        if (msg.type === "directive") {
          // Directive messages without a parsed directive object fall back to a plain bubble
          if (!msg.directive) {
            return <MessageBubble key={msg.id} message={msg} />;
          }

          // A directive is resolved if its messageId does not match the active one
          const resolved = msg.messageId !== activeDirectiveMessageId;

          return (
            <DirectiveCard
              key={msg.id}
              directive={msg.directive}
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
            />
          );
        }

        return <MessageBubble key={msg.id} message={msg} />;
      })}

      {/* Live thinking trace while Z is processing */}
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
