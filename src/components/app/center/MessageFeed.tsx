"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Copy, Check, RotateCcw, Pencil, FileText, ThumbsUp, ThumbsDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import type { ZAppMessage, SessionCitation } from "@/types/session";
import { DirectiveCard } from "@/components/app/center/DirectiveCard";
import type { DirectiveCardCallbacks } from "@/components/app/center/DirectiveCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface MessageFeedProps extends DirectiveCardCallbacks {
  messages: ZAppMessage[];
  citations?: SessionCitation[];
  /**
   * The messageId of the most-recent, still-unresolved directive.
   * All directives whose messageId does NOT match this are treated as resolved.
   */
  activeDirectiveMessageId: string | null;
  onRetryMessage?: (id: string, content: string) => void;
  onEditMessage?: (id: string, newContent: string) => void;
  onRateMessage?: (messageId: string, rating: 1 | -1) => void;
}

export function MessageFeed({
  messages,
  citations = [],
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
  onRetryMessage,
  onEditMessage,
  onRateMessage,
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
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
      {messages.map((msg) => {
        /* ── Directive messages ── */
        if (msg.type === "directive") {
          if (!msg.directive) {
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
            <UserBubble
              key={msg.id}
              message={msg}
              onRetry={onRetryMessage}
              onEdit={onEditMessage}
            />
          );
        }

        /* ── Z text messages ── */
        return (
          <ZMessageBubble
            key={msg.id}
            message={msg}
            citations={citations}
            onRetry={onRetryMessage}
            onRate={onRateMessage}
          />
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

// ─── User bubble ──────────────────────────────────────────────────────────────

function UserBubble({
  message,
  onRetry,
  onEdit,
}: {
  message: ZAppMessage;
  onRetry?: (id: string, content: string) => void;
  onEdit?: (id: string, newContent: string) => void;
}) {
  const isErrorMessage = message.status === "error";
  const isSending = message.status === "sending";
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const msgId = message.messageId || message.id;

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  function submitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit?.(msgId, trimmed);
    }
    setEditing(false);
  }

  function cancelEdit() {
    setDraft(message.content);
    setEditing(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-end gap-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {editing ? (
        <div className="flex w-full max-w-[55%] flex-col gap-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitEdit();
              }
              if (e.key === "Escape") cancelEdit();
            }}
            rows={3}
            className="w-full resize-none border border-primary/50 bg-secondary px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-(--radius)"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelEdit}
              className="text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={submitEdit}
              className="text-[9px] font-mono uppercase text-primary hover:underline"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "max-w-[55%] border px-4 py-3 text-sm font-mono rounded-(--radius)",
            isErrorMessage
              ? "border-destructive/50 bg-destructive/10 text-destructive-foreground"
              : "border-border/50 bg-secondary text-foreground",
          )}
        >
          {message.content}
        </div>
      )}

      <div className="flex items-center gap-2 mr-1 h-4">
        {isSending && (
          <span className="text-[9px] font-mono uppercase text-muted-foreground animate-pulse">
            Sending...
          </span>
        )}
        {isErrorMessage && (
          <button
            onClick={() => onRetry?.(msgId, message.content)}
            className="text-[9px] font-mono uppercase text-destructive hover:underline"
          >
            Retry
          </button>
        )}
      </div>

      {/* Hover actions — appear below bubble */}
      <AnimatePresence>
        {hovered && !isSending && !editing && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 mr-1"
          >
            {onEdit && (
              <button
                onClick={() => { setDraft(message.content); setEditing(true); }}
                className="flex items-center gap-1 text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="size-2.5" />
                Edit
              </button>
            )}
            {onRetry && !isErrorMessage && (
              <button
                onClick={() => onRetry(msgId, message.content)}
                className="flex items-center gap-1 text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="size-2.5" />
                Retry
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Citation marker ─────────────────────────────────────────────────────────

function CitationMarker({ citation }: { citation: SessionCitation }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <sup className="inline-flex items-center cursor-pointer text-primary font-mono text-[9px] font-bold ml-0.5 hover:text-primary/70 transition-colors">
            {citation.marker}
          </sup>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-72 p-3 bg-card border border-border text-foreground shadow-lg"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <FileText className="size-3 text-primary shrink-0" />
              <span className="text-[10px] font-mono font-bold text-primary truncate">
                {citation.filename}
              </span>
              {citation.pageNumber && (
                <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                  p.{citation.pageNumber}
                </span>
              )}
            </div>
            <p className="text-[11px] leading-relaxed text-foreground/80 border-l-2 border-primary/30 pl-2 italic">
              &ldquo;{citation.excerpt}&rdquo;
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Splits message content on citation markers and renders each segment.
// Regular text goes through ReactMarkdown; markers become CitationMarker components.
function MessageContent({
  content,
  citations,
}: {
  content: string;
  citations: SessionCitation[];
}) {
  const CITE_RE = /(\[\d+\]|\[\*\])/g;
  const parts = content.split(CITE_RE);

  return (
    <>
      {parts.map((part, i) => {
        if (CITE_RE.test(part)) {
          CITE_RE.lastIndex = 0;
          const cit = citations.find((c) => c.marker === part);
          return cit ? (
            <CitationMarker key={i} citation={cit} />
          ) : (
            <sup key={i} className="font-mono text-[9px] text-muted-foreground">
              {part}
            </sup>
          );
        }
        if (!part) return null;
        return (
          <ReactMarkdown
            key={i}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            components={{ p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p> }}
          >
            {part}
          </ReactMarkdown>
        );
      })}
    </>
  );
}

// ─── Z message bubble ─────────────────────────────────────────────────────────

function ZMessageBubble({
  message,
  citations,
  onRetry,
  onRate,
}: {
  message: ZAppMessage;
  citations: SessionCitation[];
  onRetry?: (id: string, content: string) => void;
  onRate?: (messageId: string, rating: 1 | -1) => void;
}) {
  const isStreaming = !!message.isStreaming;
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const replyToId = (message as ZAppMessage & { replyToMessageId?: string }).replyToMessageId;

  function copyContent() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-primary">
            Z
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/50">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isStreaming && (
            <span className="text-[9px] font-mono uppercase text-primary/60 animate-pulse">
              ···
            </span>
          )}
        </div>
        <div
          className={cn(
            "border px-4 py-3 text-sm leading-relaxed wrap-break-word rounded-(--radius)",
            "border-border/50 bg-card text-foreground",
            "prose prose-sm dark:prose-invert max-w-none",
          )}
        >
          <MessageContent content={message.content} citations={citations} />
          {isStreaming && (
            <span className="inline-block size-1 bg-primary animate-pulse ml-0.5" />
          )}
        </div>

        {/* Hover actions */}
        <AnimatePresence>
          {hovered && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 pt-0.5"
            >
              <button
                onClick={copyContent}
                className="flex items-center gap-1 text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              {onRetry && replyToId && (
                <button
                  onClick={() => onRetry(replyToId, message.content)}
                  className="flex items-center gap-1 text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="size-2.5" />
                  Retry
                </button>
              )}
              {onRate && message.role === "z" && (
                <>
                  <button
                    onClick={() => onRate(message.messageId || message.id, 1)}
                    className={cn(
                      "flex items-center gap-1 text-[9px] font-mono uppercase transition-colors",
                      (message as ZAppMessage & { rating?: number }).rating === 1
                        ? "text-emerald-500"
                        : "text-muted-foreground hover:text-emerald-500"
                    )}
                  >
                    <ThumbsUp className="size-2.5" />
                  </button>
                  <button
                    onClick={() => onRate(message.messageId || message.id, -1)}
                    className={cn(
                      "flex items-center gap-1 text-[9px] font-mono uppercase transition-colors",
                      (message as ZAppMessage & { rating?: number }).rating === -1
                        ? "text-destructive"
                        : "text-muted-foreground hover:text-destructive"
                    )}
                  >
                    <ThumbsDown className="size-2.5" />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
