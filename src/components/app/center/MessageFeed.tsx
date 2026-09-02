"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import type { ZAppMessage, SessionCitation } from "@/types/session";
import { ArtifactCard, type ArtifactCardCallbacks } from "@/components/app/session/ArtifactCard";
import { GlowingOrb } from "@/components/app/session/GlowingOrb";
import {
  KnowledgePathway,
  type KnowledgeBlockItem,
} from "@/components/app/session/KnowledgePathway";
import { TopicOverviewCard } from "@/components/app/session/TopicOverviewCard";
import { toast } from "sonner";

export interface MessageFeedProps extends ArtifactCardCallbacks {
  messages: ZAppMessage[];
  artifacts?: any[];
  citations?: SessionCitation[];
  activeDirectiveMessageId: string | null;
  sessionStep?: number;
  isTyping?: boolean;
  inputLength?: number;
  activeTopic?: {
    title?: string;
    coreIdea?: string;
    whyItMatters?: string;
    knowledgeBlocks?: any[];
    prerequisites?: any[];
  };
  activeBlock?: {
    id?: string;
    blockId?: string;
    title?: string;
    concept?: string;
    summary?: string;
    isCompleted?: boolean;
  };
  pathwayItems?: KnowledgeBlockItem[];
  onKeepGoing?: () => void;
  onFeedback?: (type: "too_easy" | "too_hard") => void;
  onOpenSource?: (materialId: string, pageNumber?: number) => void;
  onRetryMessage?: (id: string, content: string) => void;
  onEditMessage?: (id: string, newContent: string) => void;
  onRateMessage?: (messageId: string, rating: 1 | -1) => void;
}

export function MessageFeed({
  messages,
  artifacts = [],
  citations = [],
  activeDirectiveMessageId,
  sessionStep = 0,
  isTyping = false,
  inputLength = 0,
  activeTopic,
  activeBlock,
  pathwayItems = [],
  onOpenSource,
  onSubmitAnswer,
  onApprove,
  onContinue,
  onKeepGoing,
  onFeedback,
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

  const activeBlockTitle =
    activeBlock?.concept ||
    activeBlock?.title ||
    (pathwayItems.length > 0 ? pathwayItems[0].title : "Active Concept");

  const artifactsMap = useMemo(() => {
    const map = new Map<string, any>();
    artifacts.forEach((a) => {
      if (a && a.artifactId) {
        map.set(a.artifactId, a);
      }
    });
    return map;
  }, [artifacts]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track the greeting message that arrives fresh during this mount.
  // We intentionally do NOT use the first historical message — that would
  // re-display a stale intro every time the student re-enters a topic.
  // Instead we capture the messageId of the first Z text that streams in
  // after this component mounts (i.e. the live inference response), and only
  // show that one. A ref is used so we don't re-render on every message update.
  const greetingMessageIdRef = useRef<string | null>(null);
  const [freshGreeting, setFreshGreeting] = useState("");

  // Reset greeting capture whenever the topic changes (step reset)
  const prevTopicRef = useRef(activeTopic?.title);
  useEffect(() => {
    if (prevTopicRef.current !== activeTopic?.title) {
      prevTopicRef.current = activeTopic?.title;
      greetingMessageIdRef.current = null;
      setFreshGreeting("");
    }
  }, [activeTopic?.title]);

  // Capture the most recent streaming/committed Z text as the greeting
  useEffect(() => {
    const lastZ = [...messages]
      .reverse()
      .find(
        (m) =>
          m.role === "z" &&
          m.type === "text" &&
          m.content &&
          !m.content.startsWith("⚠️"),
      );
    if (!lastZ) return;
    const id = lastZ.messageId || lastZ.id;
    // Latch onto the first Z message we see after mount/topic-reset
    if (!greetingMessageIdRef.current) {
      greetingMessageIdRef.current = id;
    }
    // Only update the displayed greeting if it's the latched message
    if (greetingMessageIdRef.current === id) {
      setFreshGreeting(lastZ.content);
    }
  }, [messages]);

  const zGreeting = freshGreeting ||
    (activeTopic as any)?.description ||
    activeTopic?.coreIdea ||
    "";

  // Step 0: Overview Accordion Card (Always shown first when starting/entering topic)
  if (sessionStep === 0) {
    return (
      <div className="flex flex-1 flex-col items-center gap-5 py-4 px-4 sm:px-6 max-w-xl w-full mx-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-4 flex flex-col items-center"
        >
          {/* Center Glowing Orb */}
          <div className="flex justify-center my-1">
            <GlowingOrb
              position="center"
              size="md"
              isThinking={false}
              isTyping={isTyping}
              inputLength={inputLength}
            />
          </div>

          {/* Dynamic narrative greeting from Z */}
          {zGreeting && (
            <div className="text-center max-w-md mx-auto px-2">
              <p className="text-[13px] sm:text-[13.5px] text-slate-800 leading-relaxed font-serif">
                {zGreeting}
              </p>
            </div>
          )}

          {/* Topic Overview Card */}
          <TopicOverviewCard
            title={activeTopic?.title}
            coreIdea={activeTopic?.coreIdea}
            whyItMatters={activeTopic?.whyItMatters}
            knowledgeBlocks={activeTopic?.knowledgeBlocks}
            prerequisites={activeTopic?.prerequisites}
            onContinue={onContinue}
          />
        </motion.div>
      </div>
    );
  }

  // Step 1: Knowledge Pathway with thinking state (Shown before entering active session)
  if (sessionStep === 1) {
    return (
      <div className="flex flex-1 flex-col items-center gap-5 py-4 px-4 sm:px-6 max-w-xl w-full mx-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-4 flex flex-col items-center"
        >
          <div className="w-full flex flex-col items-start pl-2 space-y-1">
            <span className="font-serif italic text-[11px] text-slate-400">
              Thinking...
            </span>
            <GlowingOrb
              position="ai"
              size="sm"
              isThinking={true}
              isTyping={isTyping}
              inputLength={inputLength}
            />
          </div>

          {/* Knowledge Pathway with real items */}
          <KnowledgePathway items={pathwayItems} />

          <div className="w-full flex justify-center pt-2">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-6 py-2.5 text-xs font-bold hover:bg-[#0C60FC] transition shadow-sm cursor-pointer"
            >
              <span>Continue to Session</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If in step 2+ but no messages yet, show transition active concept capsule
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center gap-5 py-4 px-4 sm:px-6 max-w-xl w-full mx-auto pb-32">
        {/* Step 2: Pathway Transition into Active Block */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-6 flex flex-col items-center pt-8"
        >
          {/* Thinking State with Glowing Orb */}
          <div className="w-full flex justify-center py-2">
            <GlowingOrb
              position="center"
              size="md"
              isThinking={true}
              isTyping={isTyping}
              inputLength={inputLength}
            />
          </div>

          {/* Center Active Concept Capsule */}
          <div className="w-full max-w-md rounded-full bg-white border border-slate-200/90 shadow-sm px-4 py-3.5 flex items-center gap-3.5">
            <div className="h-8 w-8 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 14 18" className="h-3.5 w-2.5 shrink-0" fill="none">
                <path d="M7 1L13 9L7 17L1 9Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1.3" />
              </svg>
            </div>
            <span className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
              {activeBlockTitle}
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];
  const isAiThinking = !!lastMessage?.isThinking;
  const isAiStreaming = !!lastMessage?.isStreaming || isAiThinking;
  const isUserTurn = lastMessage?.role === "user" && !isAiStreaming;

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 sm:px-8 py-6 max-w-3xl w-full mx-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] pb-32">
      {/* Gliding animated orb tracking the current active turn & typing */}
      <div className="w-full flex justify-start sticky top-2 z-20 pointer-events-none pl-2">
        <GlowingOrb
          isThinking={isAiStreaming || isAiThinking}
          isTyping={isTyping}
          inputLength={inputLength}
          position={isUserTurn ? "user" : "ai"}
          size="md"
        />
      </div>

      {messages.map((msg, index) => {
        /* ── Skip system actions, tool calls, and tool results ── */
        if (
          msg.type === "system_action" ||
          msg.type === "tool_call" ||
          msg.type === "tool_result" ||
          (msg.role as any) === "tool" ||
          (msg.role === "system" && msg.type !== "directive" && !msg.directive)
        ) {
          return null;
        }

        const content = typeof msg.content === "string" ? msg.content.trim() : "";

        /* ── Skip raw prompt triggers ── */
        if (
          content.startsWith("[STUDY JOURNEY:") ||
          /^Give a very short.*intro welcoming me/i.test(content)
        ) {
          return null;
        }

        /* ── Skip the intro greeting already displayed in step 0/1 ── */
        if (
          msg.role === "z" &&
          msg.type === "text" &&
          greetingMessageIdRef.current &&
          (msg.messageId === greetingMessageIdRef.current ||
            msg.id === greetingMessageIdRef.current)
        ) {
          return null;
        }

        /* ── Skip empty non-artifact and non-directive messages ── */
        const resolvedArtifact =
          msg.artifact ||
          (msg.artifactId ? artifactsMap.get(msg.artifactId) : undefined);

        if (
          msg.type !== "directive" &&
          msg.type !== "artifact" &&
          !msg.directive &&
          !msg.artifact &&
          !resolvedArtifact &&
          !content
        ) {
          return null;
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

        /* ── Z messages / narration / attached artifacts (NO BACKGROUND) ── */
        const resolved = msg.messageId !== activeDirectiveMessageId;
        return (
          <ZMessageCanvasNode
            key={msg.id || msg.messageId || index}
            message={{ ...msg, artifact: resolvedArtifact }}
            citations={citations}
            resolved={resolved}
            onOpenSource={onOpenSource}
            onRetryMessage={onRetryMessage}
            onRetry={onRetry}
            onRate={onRateMessage}
            onSubmitAnswer={onSubmitAnswer}
            onApprove={onApprove}
            onContinue={onContinue}
            onFeedback={onFeedback}
            onSkip={onSkip}
            onExplainDifferently={onExplainDifferently}
            onTestMe={onTestMe}
            onTryMyself={onTryMyself}
            onAction={onAction}
            onPomodoroResume={onPomodoroResume}
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
  const cleanName = citation.filename.replace(/\.pdf$/i, "");
  const displayName = cleanName.length > 18 ? `${cleanName.slice(0, 18)}...` : cleanName;

  return (
    <button
      type="button"
      onClick={() => onOpenSource?.(citation.materialId, citation.pageNumber)}
      className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 py-1 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-2xs mt-2"
      title={`Open ${citation.filename} on Page ${citation.pageNumber || 1}`}
    >
      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      <span className="truncate max-w-40">{displayName}</span>
      {citation.pageNumber && (
        <span className="text-slate-500 font-normal shrink-0">
          Page {citation.pageNumber}
        </span>
      )}
    </button>
  );
}

// ─── Z Message Canvas Node (NO BACKGROUND) ───────────────────────────────────

function ZMessageCanvasNode({
  message,
  citations,
  resolved = true,
  onOpenSource,
  onRetryMessage,
  onRetry,
  onRate,
  onSubmitAnswer,
  onApprove,
  onContinue,
  onFeedback,
  onSkip,
  onExplainDifferently,
  onTestMe,
  onTryMyself,
  onAction,
  onPomodoroResume,
}: {
  message: ZAppMessage;
  citations: SessionCitation[];
  resolved?: boolean;
  onOpenSource?: (materialId: string, pageNumber?: number) => void;
  onRetryMessage?: (id: string, content: string) => void;
  onRetry?: () => void;
  onRate?: (messageId: string, rating: 1 | -1) => void;
  onSubmitAnswer?: (answers: string[], questions?: string[]) => void;
  onApprove?: () => void;
  onContinue?: () => void;
  onFeedback?: (type: "too_easy" | "too_hard") => void;
  onSkip?: () => void;
  onExplainDifferently?: (topicTitle: string) => void;
  onTestMe?: (topicTitle: string) => void;
  onTryMyself?: (topicTitle: string) => void;
  onAction?: (actionType: string) => void;
  onPomodoroResume?: () => void;
}) {
  const isStreaming = !!message.isStreaming;
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const msgId = message.messageId || message.id;
  const hasTextContent = Boolean(message.content && message.content.trim().length > 0);
  const hasArtifact = Boolean(message.artifact || message.directive);

  // Matching citations for this message
  const relevantCitations = citations.filter(
    (c) => c.messageId === message.messageId || c.messageId === message.id,
  );

  function copyContent() {
    const textToCopy =
      message.content ||
      (message.artifact?.title ? `${message.artifact.title}\n${JSON.stringify(message.artifact.content)}` : "");
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col items-start gap-2.5 my-2 bg-transparent"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 1. Pure text on canvas — NO BACKGROUND */}
      {hasTextContent && (
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
      )}

      {/* 2. Attached Interactive ArtifactCard or Directive */}
      {hasArtifact && (
        <div className="w-full">
          <ArtifactCard
            directive={message.directive}
            artifact={message.artifact}
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
            onOpenSource={onOpenSource}
            onFeedback={onFeedback}
          />
        </div>
      )}

      {/* 3. Action controls */}
      <div
        className={cn(
          "flex items-center gap-3 pt-0.5 text-slate-400 text-xs transition-opacity",
          hovered || isStreaming ? "opacity-100" : "opacity-0",
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

        {onRetryMessage && (
          <button
            type="button"
            onClick={() => onRetryMessage(msgId, message.content || "")}
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
