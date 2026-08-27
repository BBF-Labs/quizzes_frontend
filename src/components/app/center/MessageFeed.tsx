"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  RotateCcw,
  Pencil,
  FileText,
  ThumbsUp,
  ThumbsDown,
  AlignLeft,
  Volume2,
  Diamond,
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
import { KnowledgePathway } from "@/components/app/session/KnowledgePathway";
import { TopicOverviewCard } from "@/components/app/session/TopicOverviewCard";
import { toast } from "sonner";

export interface MessageFeedProps extends DirectiveCardCallbacks {
  messages: ZAppMessage[];
  citations?: SessionCitation[];
  activeDirectiveMessageId: string | null;
  sessionStep?: number;
  isTyping?: boolean;
  inputLength?: number;
  onOpenSource?: (materialId: string, pageNumber?: number) => void;
  onRetryMessage?: (id: string, content: string) => void;
  onEditMessage?: (id: string, newContent: string) => void;
  onRateMessage?: (messageId: string, rating: 1 | -1) => void;
}

export function MessageFeed({
  messages,
  citations = [],
  activeDirectiveMessageId,
  sessionStep = 0,
  isTyping = false,
  inputLength = 0,
  onOpenSource,
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sessionStep]);

  // Determine current speaker turn for the single gliding orb
  const lastMessage = messages[messages.length - 1];
  const isAiStreaming = !!lastMessage?.isStreaming;
  const isUserTurn = lastMessage?.role === "user" && !isAiStreaming;

  const handleSpeakText = (text: string) => {
    if ("speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
        toast.info("Playing audio explanation…");
      }
    } else {
      toast.error("Text-to-speech not supported on this browser.");
    }
  };

  // If there are no custom messages yet, render the initial structured tutorial steps (Images 3, 4, 5)
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center gap-6 py-4 px-4 sm:px-8 max-w-2xl w-full mx-auto pb-32">
        {/* Step 0: Overview Accordion Card matching Image 3 */}
        {sessionStep === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6 flex flex-col items-center"
          >
            {/* Center Glowing Orb */}
            <div className="flex justify-center my-2">
              <GlowingOrb
                position="center"
                size="lg"
                isThinking={false}
                isTyping={isTyping}
                inputLength={inputLength}
              />
            </div>

            {/* Narrative greeting matching Image 3 */}
            <div className="text-center max-w-xl space-y-3 px-2">
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif">
                It&apos;s great to see you again! We&apos;re moving into some fascinating territory today as we build on your understanding of how large primes are identified for secure communication.
              </p>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif">
                Take a look at the overview below to see what we&apos;ll be tackling.
              </p>
            </div>

            {/* Topic Overview Card */}
            <TopicOverviewCard />
          </motion.div>
        )}

        {/* Step 1: Knowledge Pathway with thinking state matching Image 4 */}
        {sessionStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4"
          >
            <div className="w-full flex justify-start pl-2">
              <GlowingOrb
                position="ai"
                size="md"
                isThinking={true}
                isTyping={isTyping}
                inputLength={inputLength}
              />
            </div>

            {/* Slalom Knowledge Pathway */}
            <KnowledgePathway />
          </motion.div>
        )}

        {/* Step 2+: Exposition / Concept Deep Dive matching Image 5 */}
        {sessionStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-5"
          >
            {/* Top Right Floating Active Node Pill matching Image 5 */}
            <div className="w-full flex justify-end">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white border border-slate-200/90 px-4 py-2 text-xs font-bold text-slate-900 shadow-xs">
                <span className="h-5 w-5 rounded-md bg-[#DCFCE7] border border-[#86EFAC] text-[#16A34A] flex items-center justify-center">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4L19 12L12 20L5 12Z" />
                  </svg>
                </span>
                <span>AKS is a deterministic primality test</span>
              </div>
            </div>

            {/* Narrative text intro - NO BACKGROUND */}
            <div className="w-full text-left px-1">
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif">
                Great! Let&apos;s dive into our first concept. To truly understand how we secure digital communication, we need to look at how we verify the &quot;building blocks&quot; of encryption: prime numbers.
              </p>
            </div>

            {/* Left Glowing Orb */}
            <div className="w-full flex justify-start pl-1">
              <GlowingOrb
                position="ai"
                size="md"
                isThinking={false}
                isTyping={isTyping}
                inputLength={inputLength}
              />
            </div>

            {/* Exposition Card matching Image 5 */}
            <div className="w-full rounded-[32px] border border-slate-200/90 bg-white p-6 sm:p-7 shadow-md shadow-slate-200/30 space-y-4 text-slate-900">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <AlignLeft className="h-3.5 w-3.5" />
                <span>Exposition</span>
              </div>

              <div className="text-sm sm:text-base leading-relaxed space-y-3 font-serif">
                <p>
                  The <strong>AKS primality test</strong>, published in 2002 by Agrawal, Kayal, and Saxena, was a major breakthrough in computer science. It is a <strong>deterministic algorithm</strong>, meaning it can prove whether a number is prime with 100% certainty, rather than just high probability.
                </p>
                <p>
                  One of its most important features is that it runs in <strong>polynomial time</strong>. This means the time it takes to check a number doesn&apos;t explode uncontrollably as the numbers get larger, making it theoretically efficient.
                </p>
                <p>
                  However, in the practical world of cryptography, there is a trade-off. While AKS is mathematically &quot;perfect,&quot; it is significantly <strong>slower in practice</strong> than probabilistic tests like Miller-Rabin. Because of this, it is rarely used for tasks like generating encryption keys where speed is essential.
                </p>
              </div>

              {/* Bottom Card Controls: Audio & Citation Pill */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    handleSpeakText(
                      "The AKS primality test, published in 2002 by Agrawal, Kayal, and Saxena, was a major breakthrough in computer science. It is a deterministic algorithm that runs in polynomial time."
                    )
                  }
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition cursor-pointer",
                    isPlayingAudio ? "text-[#0C60FC] bg-blue-50 animate-pulse" : "text-slate-400 hover:text-slate-700"
                  )}
                  title="Read aloud"
                >
                  <Volume2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSource?.("chapter-8", 11)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
                >
                  <FileText className="h-3 w-3 text-slate-500" />
                  <span className="truncate max-w-44">Chapter8_MoreNumberTheory...</span>
                  <span className="text-slate-400 font-bold">· Page 11</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 sm:px-8 py-6 max-w-3xl w-full mx-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] pb-32">
      {/* Gliding animated orb tracking the current active turn & typing */}
      <div className="w-full flex justify-start sticky top-2 z-20 pointer-events-none pl-2">
        <GlowingOrb
          isThinking={isAiStreaming}
          isTyping={isTyping}
          inputLength={inputLength}
          position={isUserTurn ? "user" : "ai"}
          size="md"
        />
      </div>

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

        /* ── Z text messages / narration (NO BACKGROUND) ── */
        return (
          <ZMessageCanvasNode
            key={msg.id || index}
            message={msg}
            citations={citations}
            onOpenSource={onOpenSource}
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
            "max-w-[80%] sm:max-w-[70%] px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold rounded-[22px] shadow-xs transition-all",
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

// ─── Citation Chip Button ───────────────────────────────────────────────────

function CitationChip({
  citation,
  onOpenSource,
}: {
  citation: SessionCitation;
  onOpenSource?: (materialId: string, pageNumber?: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenSource?.(citation.materialId, citation.pageNumber)}
      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition cursor-pointer shadow-2xs mt-2"
      title={`Open ${citation.filename} on Page ${citation.pageNumber || 1}`}
    >
      <FileText className="h-3 w-3 text-slate-500 shrink-0" />
      <span className="truncate max-w-44">{citation.filename}</span>
      {citation.pageNumber && (
        <span className="text-slate-400 font-bold shrink-0">
          · Page {citation.pageNumber}
        </span>
      )}
    </button>
  );
}

// ─── Z Message Canvas Node (NO BACKGROUND) ───────────────────────────────────

function ZMessageCanvasNode({
  message,
  citations,
  onOpenSource,
  onRetry,
  onRate,
}: {
  message: ZAppMessage;
  citations: SessionCitation[];
  onOpenSource?: (materialId: string, pageNumber?: number) => void;
  onRetry?: (id: string, content: string) => void;
  onRate?: (messageId: string, rating: 1 | -1) => void;
}) {
  const isStreaming = !!message.isStreaming;
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const msgId = message.messageId || message.id;

  // Matching citations for this message
  const relevantCitations = citations.filter(
    (c) => c.messageId === message.messageId || c.messageId === message.id
  );

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
      className="w-full flex flex-col items-start gap-2 my-2 bg-transparent"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pure text on canvas — NO BACKGROUND */}
      <div className="w-full text-left text-slate-900 text-sm sm:text-base leading-relaxed font-serif prose prose-slate max-w-none bg-transparent">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
        >
          {message.content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block h-2 w-2 rounded-full bg-[#0C60FC] animate-ping ml-1" />
        )}

        {relevantCitations.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2">
            {relevantCitations.map((cit, i) => (
              <CitationChip
                key={i}
                citation={cit}
                onOpenSource={onOpenSource}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action controls */}
      <div
        className={cn(
          "flex items-center gap-3 pt-0.5 text-slate-400 text-xs transition-opacity",
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
