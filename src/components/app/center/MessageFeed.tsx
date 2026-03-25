"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { ZSessionMessage } from "@/types/session";
import { DirectiveCard } from "@/components/app/center/DirectiveCard";
import type { DirectiveCardCallbacks } from "@/components/app/center/DirectiveCard";

export interface MessageFeedProps extends DirectiveCardCallbacks {
  messages: ZSessionMessage[];
  /**
   * The messageId of the most-recent, still-unresolved directive.
   * All directives whose messageId does NOT match this are treated as resolved.
   */
  activeDirectiveMessageId: string | null;
}

export function MessageFeed({
  messages,
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
      {messages.map((msg) => {
        /* ── Directive messages ── */
        if (msg.type === "directive") {
          if (!msg.directive) {
            // Malformed directive — show a simple error notice
            return (
              <div
                key={msg.id}
                className="border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-[11px] font-mono text-amber-500/70"
              >
                [Directive payload unavailable]
              </div>
            );
          }
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

        /* ── User messages ── */
        if (msg.role === "user") {
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex justify-end"
            >
              <div className="max-w-[80%] border border-border/50 bg-secondary px-4 py-3 text-sm text-foreground font-mono">
                {msg.content}
              </div>
            </motion.div>
          );
        }

        /* ── Z text messages (with markdown) ── */
        return <ZMessageBubble key={msg.id} message={msg} />;
      })}

      <div ref={bottomRef} />
    </div>
  );
}

// ─── Internal Z message bubble with markdown ──────────────────────────────────

interface ZMessageBubbleProps {
  message: ZSessionMessage;
}

function ZMessageBubble({ message }: ZMessageBubbleProps) {
  const isStreaming = !!message.isStreaming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3"
    >
      <div
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center border rounded-(--radius)",
          "border-border/50 bg-card text-foreground",
        )}
      >
        <Brain
          className={cn(
            "size-3 text-muted-foreground",
            isStreaming && "animate-pulse",
          )}
        />
      </div>

      <div className="flex-1 space-y-1 min-w-0">
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
        <div
          className={cn(
            "border px-4 py-3 text-sm leading-relaxed wrap-break-word rounded-(--radius)",
            "border-border/50 bg-card text-foreground",
            "prose prose-sm dark:prose-invert max-w-none",
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block size-1 bg-primary animate-pulse ml-0.5" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
