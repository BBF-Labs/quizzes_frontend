"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ZSessionMessage } from "@/types/session";
import { MessageSquare, Copy, RotateCcw, Pencil, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageBubbleProps {
  message: ZSessionMessage;
  isUser?: boolean;
  authorName?: string;
  onRetry?: (id: string, content: string) => void;
  onEdit?: (id: string, newContent: string) => void;
  onRate?: (messageId: string, rating: 1 | -1) => void;
}

export function MessageBubble({
  message,
  isUser = false,
  authorName,
  onRetry,
  onEdit,
  onRate,
}: MessageBubbleProps) {
  if (message.type === "tool_call" || message.type === "tool_result") {
    return null;
  }

  const isErrorMessage = message.status === "error";
  const isSending = message.status === "sending";
  const isUser_ = isUser || message.role === "user";

  if (isUser_) {
    return (
      <UserMessage
        message={message}
        isErrorMessage={isErrorMessage}
        isSending={isSending}
        authorName={authorName}
        onRetry={onRetry}
        onEdit={onEdit}
      />
    );
  }

  return (
    <ZMessage
      message={message}
      authorName={authorName}
      onRetry={onRetry}
      onRate={onRate}
    />
  );
}

// ── User message ──────────────────────────────────────────────────────────────

function UserMessage({
  message,
  isErrorMessage,
  isSending,
  authorName,
  onRetry,
  onEdit,
}: {
  message: ZSessionMessage;
  isErrorMessage: boolean;
  isSending: boolean;
  authorName?: string;
  onRetry?: (id: string, content: string) => void;
  onEdit?: (id: string, newContent: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  function submitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit?.(message.messageId || message.id, trimmed);
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
            onClick={() => onRetry?.(message.messageId || message.id, message.content)}
            className="text-[9px] font-mono uppercase text-destructive hover:underline"
          >
            Retry
          </button>
        )}
        {(message.authorName || authorName) && (
          <span className="text-[9px] font-mono uppercase text-muted-foreground">
            {message.authorName || authorName}
          </span>
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
                onClick={() => onRetry(message.messageId || message.id, message.content)}
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

// ── Z / assistant message ─────────────────────────────────────────────────────

function ZMessage({
  message,
  authorName,
  onRetry,
  onRate,
}: {
  message: ZSessionMessage;
  authorName?: string;
  onRetry?: (id: string, content: string) => void;
  onRate?: (messageId: string, rating: 1 | -1) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const isZ = message.role === "z" || message.role === "system";
  const label = isZ ? "Z" : (message.authorName || authorName || "Peer");

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
      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center border border-border/50 bg-card text-foreground rounded-(--radius)">
        <MessageSquare className="size-3 text-muted-foreground" />
      </div>

      <div className="flex-1 space-y-1 min-w-0">
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
          {message.isStreaming && (
            <span className="text-[9px] font-mono uppercase text-primary/60 animate-pulse">
              ···
            </span>
          )}
        </div>

        <div className="border border-border/50 bg-card px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground rounded-(--radius)">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-[2px] h-[1em] bg-primary/70 ml-0.5 align-middle animate-pulse" />
          )}
        </div>

        {/* Hover actions */}
        {hovered && !message.isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 pt-0.5"
          >
            <button
              onClick={copyContent}
              className="flex items-center gap-1 text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {onRetry && (message as ZSessionMessage & { replyToMessageId?: string }).replyToMessageId && (
              <button
                onClick={() => onRetry(
                  (message as ZSessionMessage & { replyToMessageId?: string }).replyToMessageId!,
                  message.content,
                )}
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
                    message.rating === 1
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
                    message.rating === -1
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
      </div>
    </motion.div>
  );
}
