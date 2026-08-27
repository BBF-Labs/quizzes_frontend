"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Copy,
  Check,
  RotateCcw,
  Pencil,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import type { ZAppMessage, SessionCitation } from "@/types/session";
import { DirectiveCard } from "@/components/app/session/DirectiveCard";
import type { DirectiveCardCallbacks } from "@/components/app/session/DirectiveCard";
import { GlowingOrb } from "@/components/app/session/GlowingOrb";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MessageFeedProps extends DirectiveCardCallbacks {
  messages: ZAppMessage[];
  citations?: SessionCitation[];
  /**
   * The messageId of the most-recent, still-unresolved directive.
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
  onPomodoroResume,
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 px-6 text-center max-w-lg mx-auto">
        <GlowingOrb size="lg" isThinking={false} />
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Ready when you are.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
          Ask a question, upload lecture materials, or pick a study topic to begin your personalized learning session.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 sm:px-8 py-8 max-w-3xl w-full mx-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
      {messages.map((msg, index) => {
        /* ── Skip empty non-directive messages ── */
        if (msg.type !== "directive" && !msg.content?.trim()) return null;

        /* ── Directive messages ── */
        if (msg.type === "directive") {
          if (!msg.directive) {
            return null;
          }
          const resolved = msg.messageId !== activeDirectiveMessageId;
          return (
            <div key={msg.id || index} className="w-full">
              <DirectiveCard
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
                onPomodoroResume={onPomodoroResume}
              />
            </div>
          );
        }

        /* ── User messages ── */
        if (msg.role === "user") {
          return (
            <UserBubble
              key={msg.id || index}
              message={msg}
              onRetry={onRetryMessage}
              onEdit={onEditMessage}
            />
          );
        }

        /* ── Z text messages / narration ── */
        return (
          <ZMessageCanvasNode
            key={msg.id || index}
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

// ─── User Bubble ─────────────────────────────────────────────────────────────

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
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-end gap-1 w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {editing ? (
        <div className="flex w-full max-w-md flex-col gap-2">
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
            className="w-full resize-none border border-[#0C60FC] bg-white px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelEdit}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-3 py-1 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={submitEdit}
              className="rounded-xl bg-[#0C60FC] px-3.5 py-1 text-xs font-extrabold text-white cursor-pointer"
            >
              Save &amp; Send
            </button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "max-w-[75%] sm:max-w-[65%] px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold rounded-2xl shadow-xs transition-all",
            isErrorMessage
              ? "border border-rose-200 bg-rose-50 text-rose-800"
              : "bg-slate-900 text-white rounded-br-xs"
          )}
        >
          {message.content}
        </div>
      )}

      <div className="flex items-center gap-2 mr-1 h-4">
        {isSending && (
          <span className="text-[10px] font-extrabold text-slate-400 animate-pulse uppercase tracking-wider">
            Sending…
          </span>
        )}
        {isErrorMessage && (
          <button
            onClick={() => onRetry?.(msgId, message.content)}
            className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
          >
            Retry
          </button>
        )}
      </div>

      {/* Hover actions */}
      <AnimatePresence>
        {hovered && !isSending && !editing && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 mr-1 text-[11px] text-slate-400 font-semibold"
          >
            {onEdit && (
              <button
                onClick={() => {
                  setDraft(message.content);
                  setEditing(true);
                }}
                className="flex items-center gap-1 hover:text-slate-800 cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
            {onRetry && !isErrorMessage && (
              <button
                onClick={() => onRetry(msgId, message.content)}
                className="flex items-center gap-1 hover:text-slate-800 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Retry
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Citation Marker ─────────────────────────────────────────────────────────

function CitationMarker({ citation }: { citation: SessionCitation }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <sup className="inline-flex items-center cursor-pointer text-[#0C60FC] text-[10px] font-extrabold ml-1 hover:underline">
          {citation.marker}
        </sup>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="max-w-xs p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-900"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <FileText className="h-3.5 w-3.5 text-[#0C60FC] shrink-0" />
            <span className="truncate">{citation.filename}</span>
            {citation.pageNumber && (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                Page {citation.pageNumber}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-slate-600 italic border-l-2 border-blue-400 pl-2.5">
            &ldquo;{citation.excerpt}&rdquo;
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Splits message content on citation markers and renders markdown
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
            <sup key={i} className="text-[10px] font-bold text-slate-400">
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
            components={{
              p: ({ children }) => (
                <p className="mb-3.5 last:mb-0 leading-relaxed">{children}</p>
              ),
              h1: ({ children }) => (
                <h1 className="text-xl font-black text-slate-950 mt-4 mb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-extrabold text-slate-950 mt-3 mb-1.5">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-bold text-slate-950 mt-2 mb-1">
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 space-y-1 my-2.5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 space-y-1 my-2.5">{children}</ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-3 border-[#0C60FC] pl-3 italic text-slate-600 my-2">
                  {children}
                </blockquote>
              ),
            }}
          >
            {part}
          </ReactMarkdown>
        );
      })}
    </>
  );
}

// ─── Z Message Canvas Node (Editorial Flow) ──────────────────────────────────

function ZMessageCanvasNode({
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
  const msgId = message.messageId || message.id;

  function copyContent() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col items-center gap-2 my-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Orb display for AI turn */}
      <GlowingOrb isThinking={isStreaming} size="md" />

      {/* Main Conversational Narration */}
      <div className="w-full max-w-2xl px-2 sm:px-4 text-center sm:text-left text-slate-800 text-sm sm:text-base leading-relaxed">
        <MessageContent content={message.content} citations={citations} />
        {isStreaming && (
          <span className="inline-block h-2 w-2 rounded-full bg-[#0C60FC] animate-ping ml-1" />
        )}
      </div>

      {/* Action controls (Copy, Feedback thumbs, Retry) */}
      <div
        className={cn(
          "flex items-center gap-3 pt-1 text-slate-400 text-xs transition-opacity",
          hovered || isStreaming ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          type="button"
          onClick={copyContent}
          className="hover:text-slate-700 transition cursor-pointer flex items-center gap-1"
          title="Copy response"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>

        {onRate && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <button
              type="button"
              onClick={() => onRate(msgId, 1)}
              className="hover:text-emerald-600 transition cursor-pointer p-0.5"
              title="Good explanation"
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onRate(msgId, -1)}
              className="hover:text-rose-600 transition cursor-pointer p-0.5"
              title="Could be better"
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}

        {onRetry && (
          <button
            type="button"
            onClick={() => onRetry(msgId, message.content)}
            className="hover:text-slate-700 transition cursor-pointer flex items-center gap-1 border-l border-slate-200 pl-3"
            title="Regenerate"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Regenerate</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
