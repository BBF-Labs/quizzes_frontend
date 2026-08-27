"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Paperclip,
  X,
  Plus,
  ArrowUp,
  ArrowRight,
  Mic,
  FileText,
  BookOpen,
  Map,
  LogOut,
  Flame,
  Sparkles,
  Layers,
  Brain,
  MessageSquare,
} from "lucide-react";
import { useAppApprove } from "@/hooks";
import { useApp } from "@/hooks/app/use-app-queries";
import { useRetryMessage, useRateMessage } from "@/hooks/app/use-app-actions";
import { useAppLayout } from "@/components/app/layout";
import { cn } from "@/lib/utils";
import { MessageFeed } from "@/components/app/center/MessageFeed";
import {
  FloatingActionLauncher,
  type FloatingActionItem,
} from "@/components/app/session/FloatingActionLauncher";
import { PathDrawer } from "@/components/app/session/PathDrawer";
import { StudyPlanView } from "@/components/app/session/StudyPlanView";
import { MaterialsView } from "@/components/app/session/MaterialsView";
import { NotesView } from "@/components/app/session/NotesView";
import { DocumentReader } from "@/components/app/center/DocumentReader";
import type { KnowledgeBlockItem } from "@/components/app/session/KnowledgePathway";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

type CanvasView = "session" | "plan" | "sources" | "notes";

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    sessionId,
    messages,
    citations,
    sendMessage,
    messageMutation,
    truncateAfter,
    truncateFrom,
    activeMaterialId,
    setActiveMaterialId,
  } = useAppLayout();

  const { data: app } = useApp(sessionId);

  const approveMutation = useAppApprove();
  const retryMutation = useRetryMessage(sessionId);
  const rateMutation = useRateMessage(sessionId);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const firstMessageSentRef = useRef(false);

  const [activeView, setActiveView] = useState<CanvasView>("session");
  const [referencePage, setReferencePage] = useState<number | undefined>(undefined);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isPathDrawerOpen, setIsPathDrawerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [courseNote, setCourseNote] = useState("");
  const [enableHints, setEnableHints] = useState(true);
  const [pendingAutoSend, setPendingAutoSend] = useState<string | null>(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  // Close plus menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        plusMenuRef.current &&
        !plusMenuRef.current.contains(e.target as Node)
      ) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Send message
  const handleSend = useCallback(async () => {
    if (
      !sessionId ||
      sessionId === "undefined" ||
      !input.trim() ||
      messageMutation.isPending
    ) {
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setActiveView("session");
    await sendMessage(userMessage);
  }, [input, messageMutation, sessionId, sendMessage]);

  // Hydrate first message from landing page handoff
  useEffect(() => {
    if (firstMessageSentRef.current || !sessionId) return;

    const key = `qz_first_msg_${sessionId}`;
    const first = sessionStorage.getItem(key);
    if (!first) return;

    sessionStorage.removeItem(key);
    setInput(first);
    setPendingAutoSend(first);
    firstMessageSentRef.current = true;
  }, [sessionId]);

  // Trigger auto-send once input is hydrated
  useEffect(() => {
    if (
      pendingAutoSend &&
      input === pendingAutoSend &&
      !messageMutation.isPending
    ) {
      setTimeout(() => {
        setPendingAutoSend(null);
        handleSend();
      }, 0);
    }
  }, [pendingAutoSend, handleSend, messageMutation.isPending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording toggle simulation
  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info("Listening… Speak clearly into your microphone.");
      setTimeout(() => {
        setIsRecording(false);
        toast.success("Speech captured.");
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  // Derive the most-recent unresolved directive messageId
  const activeDirectiveMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === "directive" && messages[i].directive) {
        return messages[i].messageId;
      }
    }
    return null;
  }, [messages]);

  // Active topic title
  const activeTopicTitle = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const d = messages[i].directive;
      if (d) {
        if (d.type === "UNLOCK_TOPIC" && d.payload.topicTitle) {
          return d.payload.topicTitle;
        }
        if (d.type === "SHOW_SUGGESTION" && d.payload.topicTitle) {
          return d.payload.topicTitle;
        }
        if (d.type === "SHOW_PLAN" && d.payload.title) {
          return d.payload.title;
        }
      }
    }
    return app?.name || app?.title || "Active Recall Mechanism";
  }, [messages, app]);

  // Knowledge Pathway items for slide-over drawer
  const pathwayItems: KnowledgeBlockItem[] = useMemo(() => {
    return [
      {
        id: "step-1",
        title: activeTopicTitle,
        status: "current",
        description: "In progress · Core concept review",
      },
      {
        id: "step-2",
        title: "Metacognition & Synthesis",
        status: "upcoming",
        description: "Application and practical problem sets",
      },
      {
        id: "step-3",
        title: "Mastery Assessment",
        status: "upcoming",
        description: "Comprehensive exam simulation",
      },
    ];
  }, [activeTopicTitle]);

  // Floating Action Launcher Menu Items
  const launcherItems: FloatingActionItem[] = [
    {
      id: "session",
      label: "Study Session",
      icon: MessageSquare,
      onClick: () => setActiveView("session"),
      variant: activeView === "session" ? "accent" : "default",
    },
    {
      id: "plan",
      label: "Study Plan",
      icon: Map,
      onClick: () => setActiveView("plan"),
      variant: activeView === "plan" ? "accent" : "default",
    },
    {
      id: "sources",
      label: "Sources & Materials",
      icon: FileText,
      onClick: () => setActiveView("sources"),
      badge: app?.materials?.length || undefined,
      variant: activeView === "sources" ? "accent" : "default",
    },
    {
      id: "notes",
      label: "Notes & Studio",
      icon: BookOpen,
      onClick: () => setActiveView("notes"),
      variant: activeView === "notes" ? "accent" : "default",
    },
    {
      id: "exit",
      label: "Exit Session",
      icon: LogOut,
      variant: "danger",
      onClick: () => router.push("/app"),
    },
  ];

  // Directive action helpers
  const handleSubmitAnswer = useCallback(
    (answers: string[], questions?: string[]) => {
      if (!sessionId) return;
      const message =
        questions && questions.length > 0
          ? questions
              .map((q, i) => `Q: ${q}\nA: ${answers[i] ?? ""}`)
              .join("\n\n")
          : answers.join(", ");
      messageMutation
        .mutateAsync({ sessionId, message })
        .catch((err: unknown) => console.error("[submitAnswer] failed", err));
    },
    [sessionId, messageMutation],
  );

  const handleApprove = useCallback(() => {
    if (!sessionId) return;
    approveMutation
      .mutateAsync(sessionId)
      .catch((err: unknown) => console.error("[approvePlan] failed", err));
  }, [sessionId, approveMutation]);

  const handleContinue = useCallback(
    () => sendMessage("Continue"),
    [sendMessage],
  );
  const handleRetry = useCallback(() => sendMessage("Retry"), [sendMessage]);
  const handleSkip = useCallback(() => sendMessage("Skip"), [sendMessage]);
  const handleExplainDifferently = useCallback(
    () => sendMessage("Explain this differently"),
    [sendMessage],
  );
  const handleTestMe = useCallback(
    (topicTitle: string) => sendMessage(`Test me on ${topicTitle}`),
    [sendMessage],
  );
  const handleTryMyself = useCallback(
    (topicTitle: string) => sendMessage(`I'll try ${topicTitle} myself`),
    [sendMessage],
  );
  const handleAction = useCallback(
    (actionType: string) => sendMessage(actionType),
    [sendMessage],
  );
  const handlePomodoroResume = useCallback(
    () => sendMessage("Pomodoro done, ready to continue"),
    [sendMessage],
  );

  // Open Document Reader Lightbox
  const handleOpenSource = (materialId: string, pageNumber?: number) => {
    setActiveMaterialId(materialId);
    setReferencePage(pageNumber);
  };

  // Guard: invalid session
  if (!sessionId || sessionId === "undefined") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#FAF9F6]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 max-w-sm w-full shadow-lg text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Session</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            The session ID is invalid or has expired.
          </p>
          <button
            onClick={() => router.push("/app")}
            className="w-full rounded-2xl bg-slate-950 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-[#FAF9F6] antialiased selection:bg-[#0C60FC] selection:text-white">
      {/* 
        Transparent Floating Header:
        NO BACKGROUND on the header bar itself, only individual floating divs!
      */}
      <header className="absolute top-0 inset-x-0 z-40 p-4 sm:p-6 flex items-center justify-between pointer-events-none bg-transparent">
        {/* Top-Left Floating Action Launcher Pill */}
        <div className="pointer-events-auto">
          <FloatingActionLauncher items={launcherItems} />
        </div>

        {/* Center: Floating Active Topic / View Pill */}
        <div className="pointer-events-auto flex justify-center px-2 min-w-0">
          <button
            type="button"
            onClick={() => setIsPathDrawerOpen(true)}
            className="group inline-flex items-center gap-2 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 px-4 py-2 text-xs font-bold text-slate-800 transition shadow-sm hover:shadow-md cursor-pointer max-w-xs sm:max-w-md truncate backdrop-blur-md"
            title="Click to view learning roadmap"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="truncate">
              {activeView === "session"
                ? activeTopicTitle
                : activeView === "plan"
                ? "Study Plan Roadmap"
                : activeView === "sources"
                ? "Sources & Materials"
                : "Notes & Studio"}
            </span>
          </button>
        </div>

        {/* Top-Right: Floating Streak & Feedback Standalone Chips */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 px-3 py-1.5 text-xs font-extrabold text-amber-800 shadow-sm">
            <Flame className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
            <span>1</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-bold">💎 0</span>
          </div>

          <button
            type="button"
            onClick={() => toast.success("Thanks for studying with Qz! Send suggestions to feedback@qz.com")}
            className="rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-white transition cursor-pointer shadow-sm"
          >
            Feedback
          </button>
        </div>
      </header>

      {/* Main Canvas Middle Content (Padded at top for transparent header) */}
      <div className="flex-1 flex flex-col min-h-0 pt-18 overflow-y-auto">
        {activeView === "session" && (
          <MessageFeed
            messages={messages}
            citations={citations}
            activeDirectiveMessageId={activeDirectiveMessageId}
            onOpenSource={handleOpenSource}
            onSubmitAnswer={handleSubmitAnswer}
            onApprove={handleApprove}
            onContinue={handleContinue}
            onRetry={handleRetry}
            onSkip={handleSkip}
            onExplainDifferently={handleExplainDifferently}
            onTestMe={handleTestMe}
            onTryMyself={handleTryMyself}
            onAction={handleAction}
            onPomodoroResume={handlePomodoroResume}
            onRetryMessage={(messageId: string) => {
              truncateAfter(messageId);
              retryMutation.mutate(messageId);
            }}
            onEditMessage={(messageId: string, newContent: string) => {
              truncateFrom(messageId);
              sendMessage(newContent);
            }}
            onRateMessage={(messageId: string, rating: 1 | -1) => {
              rateMutation.mutate({ messageId, rating });
            }}
          />
        )}

        {activeView === "plan" && (
          <StudyPlanView
            userName={user?.name || "Student"}
            onSelectTopic={(topic) => {
              setActiveView("session");
              sendMessage(`Let's study: ${topic}`);
            }}
            onStartWrittenExam={() => {
              setActiveView("session");
              sendMessage("Start written exam simulation");
            }}
            onStartOralExam={() => {
              setActiveView("session");
              sendMessage("Start oral exam simulation");
            }}
            onContinueSession={() => setActiveView("session")}
          />
        )}

        {activeView === "sources" && (
          <MaterialsView
            sessionId={sessionId}
            onOpenDocument={(id) => handleOpenSource(id)}
            onAskAboutMaterial={(filename) => {
              setActiveView("session");
              sendMessage(`Tell me key takeaways from ${filename}`);
            }}
          />
        )}

        {activeView === "notes" && (
          <NotesView
            sessionId={sessionId}
            notes={app?.notes || []}
            onSendMessage={(msg) => {
              setActiveView("session");
              sendMessage(msg);
            }}
          />
        )}
      </div>

      {/* Floating Bottom Feedback Controls & Centered Ask Qubi Input */}
      <div className="sticky bottom-0 z-40 px-4 sm:px-8 pb-5 pt-2 bg-linear-to-t from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent pointer-events-none">
        <div className="max-w-2xl w-full mx-auto pointer-events-auto space-y-2.5">
          {/* Quick Feedback & Continue Action Pills (in Session mode) */}
          {activeView === "session" && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => sendMessage("Too easy")}
                className="rounded-full bg-white/95 hover:bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🤯</span>
                <span>Too easy</span>
              </button>

              <button
                type="button"
                onClick={() => sendMessage("Too hard")}
                className="rounded-full bg-white/95 hover:bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🤯</span>
                <span>Too hard</span>
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="rounded-full bg-slate-950 hover:bg-[#0C60FC] px-4 py-1.5 text-xs font-extrabold text-white shadow-md hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Attached file chip */}
          <AnimatePresence>
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs"
              >
                <Paperclip className="h-3 w-3 text-slate-400" />
                <span className="truncate max-w-44">{attachedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Input Pill Bar */}
          <div className="relative rounded-[28px] bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 p-2 sm:p-2.5 flex items-end gap-2 transition-all focus-within:border-[#0C60FC] focus-within:ring-4 focus-within:ring-blue-100">
            {/* Left + Options Menu */}
            <div className="relative shrink-0 mb-0.5" ref={plusMenuRef}>
              <button
                type="button"
                onClick={() => setShowPlusMenu((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Options"
              >
                <Plus className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {showPlusMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl text-xs space-y-3"
                  >
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Session Options
                    </p>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Course Context
                      </label>
                      <input
                        type="text"
                        value={courseNote}
                        onChange={(e) => setCourseNote(e.target.value)}
                        placeholder="e.g. Exam chapter 8 review"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-[#0C60FC]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setEnableHints((prev) => !prev)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold border transition cursor-pointer",
                        enableHints
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      )}
                    >
                      <span>Study Hints</span>
                      <span>{enableHints ? "ENABLED" : "DISABLED"}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)}
            />

            {/* Input Textarea */}
            <div className="flex-1 min-w-0 pb-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Alice / Qubi anything…"
                rows={1}
                disabled={messageMutation.isPending || !sessionId}
                className="w-full resize-none bg-transparent px-2 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-50 scrollbar-none leading-relaxed"
                style={{ minHeight: "22px", maxHeight: "140px" }}
              />
            </div>

            {/* Mic and Send Controls */}
            <div className="flex items-center gap-1 shrink-0 mb-0.5">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer",
                  isRecording
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                )}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                <Mic className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={messageMutation.isPending || !input.trim()}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition shadow-xs cursor-pointer disabled:cursor-not-allowed",
                  messageMutation.isPending || !input.trim()
                    ? "bg-slate-100 text-slate-300"
                    : "bg-slate-950 hover:bg-[#0C60FC] text-white"
                )}
                title="Send message (Enter)"
              >
                {messageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                ) : (
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Knowledge Pathway Drawer */}
      <PathDrawer
        isOpen={isPathDrawerOpen}
        onClose={() => setIsPathDrawerOpen(false)}
        items={pathwayItems}
        chapterTitle={app?.title || "Foundations of Cognitive Learning"}
        onSelectBlock={(block) => {
          setActiveView("session");
          sendMessage(`Let's focus on ${block.title}`);
        }}
      />

      {/* Document Reader Lightbox Modal */}
      <AnimatePresence>
        {activeMaterialId && (
          <DocumentReader
            materialId={activeMaterialId}
            sessionId={sessionId}
            referencePage={referencePage}
            onClose={() => {
              setActiveMaterialId(null);
              setReferencePage(undefined);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
