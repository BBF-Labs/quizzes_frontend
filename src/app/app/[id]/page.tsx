"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  Sparkles,
  Award,
  Diamond,
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
import { UpdateStudyPlanView } from "@/components/app/session/UpdateStudyPlanView";
import { MaterialsView } from "@/components/app/session/MaterialsView";
import { NotesView } from "@/components/app/session/NotesView";
import { ExamsView } from "@/components/app/session/ExamsView";
import { DocumentReader } from "@/components/app/center/DocumentReader";
import type { KnowledgeBlockItem } from "@/components/app/session/KnowledgePathway";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

type CanvasView = "session" | "plan" | "update-plan" | "sources" | "notes" | "exams";

export default function ChatPage() {
  const router = useRouter();
  const pathname = usePathname();
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

  // The default start page of any session is the journey page
  useEffect(() => {
    if (pathname && pathname === `/app/${sessionId}`) {
      router.replace(`/study-session/${sessionId}/journey`);
    }
  }, [pathname, sessionId, router]);

  const { data: app } = useApp(sessionId);

  const approveMutation = useAppApprove();
  const retryMutation = useRetryMessage(sessionId);
  const rateMutation = useRateMessage(sessionId);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const firstMessageSentRef = useRef(false);

  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const stepParam = searchParams.get("step");
  const chapterParam = searchParams.get("chapter");

  const [activeView, setActiveView] = useState<CanvasView>("session");
  const [sessionStep, setSessionStep] = useState<number>(0);
  const [referencePage, setReferencePage] = useState<number | undefined>(undefined);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isPathDrawerOpen, setIsPathDrawerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [courseNote, setCourseNote] = useState("");
  const [enableHints, setEnableHints] = useState(true);
  const [pendingAutoSend, setPendingAutoSend] = useState<string | null>(null);

  const activeTopic = useMemo(() => {
    if (app?.studyPlan?.chapters) {
      for (const ch of app.studyPlan.chapters) {
        if (chapterParam && String(ch.chapterId || (ch as any)._id) !== chapterParam) continue;
        const steps = (ch.steps || ch.goals || []) as any[];
        for (const step of steps) {
          if (
            (stepParam && String(step.stepId || step.goalId || step._id) === stepParam) ||
            (topicParam && step.title?.toLowerCase() === topicParam.toLowerCase()) ||
            (!stepParam && !topicParam && (step.stepId === app.activeStepId || step._id === app.activeStepId))
          ) {
            return {
              title: step.title,
              coreIdea: step.coreIdea || step.description,
              whyItMatters: step.whyItMatters,
              prerequisites: step.prerequisites || step.knowledgeBlocks || [],
            };
          }
        }
      }
    }
    if (topicParam) {
      return {
        title: topicParam,
      };
    }
    return undefined;
  }, [app?.studyPlan, app?.activeStepId, chapterParam, stepParam, topicParam]);

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
      toast.info("Listening… Speak clearly to Z.");
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

  // Step advancement handler for Continue button
  const handleAdvanceStep = useCallback(() => {
    if (messages.length === 0) {
      if (sessionStep < 2) {
        setSessionStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        sendMessage("Let's practice the AKS primality test");
      }
    } else {
      sendMessage("Continue");
    }
  }, [messages.length, sessionStep, sendMessage]);

  // Active topic title based on sessionStep or message history
  const activeTopicTitle = useMemo(() => {
    if (messages.length === 0) {
      if (sessionStep === 0) {
        return "Primality Testing and Number Theory Algorithms";
      }
      return "AKS is a deterministic primality test";
    }

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
    return app?.name || app?.title || "AKS is a deterministic primality test";
  }, [messages, sessionStep, app]);

  // Knowledge Pathway items for slide-over drawer
  const pathwayItems: KnowledgeBlockItem[] = useMemo(() => {
    return [
      {
        id: "step-1",
        title: "Primality testing is needed to find large random primes",
        status: "completed",
      },
      {
        id: "step-2",
        title: "AKS is a deterministic primality test",
        status: "current",
      },
      {
        id: "step-3",
        title: "The Miller-Rabin test quickly finds large random primes",
        status: "upcoming",
      },
      {
        id: "step-4",
        title: "Chapter 8 review questions practice gcd and modular arithmetic tools",
        status: "upcoming",
      },
    ];
  }, []);

  // Floating Action Launcher Menu Items with EXAMS button
  const launcherItems: FloatingActionItem[] = [
    {
      id: "session",
      label: "Study Session",
      icon: Sparkles,
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
      id: "exams",
      label: "Exams & Simulations",
      icon: Award,
      onClick: () => setActiveView("exams"),
      variant: activeView === "exams" ? "accent" : "default",
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

  const handleContinue = handleAdvanceStep;
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
    <div className="relative flex flex-col h-full overflow-hidden bg-[#FAF9F6] bg-[linear-gradient(to_right,#EAE8E1_1px,transparent_1px),linear-gradient(to_bottom,#EAE8E1_1px,transparent_1px)] bg-[size:26px_26px] antialiased selection:bg-[#0C60FC] selection:text-white">
      {/* 
        Transparent Floating Header:
        NO BACKGROUND on the header bar itself, only individual floating divs!
      */}
      <header className="absolute top-0 inset-x-0 z-40 p-4 sm:p-6 flex items-center justify-between pointer-events-none bg-transparent">
        {/* Top-Left Floating Action Launcher Pill */}
        <div className="pointer-events-auto">
          <FloatingActionLauncher items={launcherItems} />
        </div>

        {/* Center: Floating Active Topic Pill matching Images 3, 4, 5 */}
        <div className="pointer-events-auto flex justify-center px-2 min-w-0">
          <button
            type="button"
            onClick={() => setIsPathDrawerOpen(true)}
            className="group inline-flex items-center gap-2 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 px-4 py-2 text-xs font-bold text-slate-800 transition shadow-sm hover:shadow-md cursor-pointer max-w-xs sm:max-w-md truncate backdrop-blur-md"
            title="Click to view learning roadmap"
          >
            {sessionStep === 0 && messages.length === 0 ? (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#52B32B] shrink-0" fill="currentColor">
                <path d="M12 2.5L14.8 5.3L12 8.1L9.2 5.3Z" />
                <path d="M12 15.9L14.8 18.7L12 21.5L9.2 18.7Z" />
                <path d="M5.3 9.2L8.1 12L5.3 14.8L2.5 12Z" />
                <path d="M18.7 9.2L21.5 12L18.7 14.8L15.9 12Z" />
              </svg>
            ) : (
              <span className="h-3.5 w-3.5 rounded-sm bg-[#DCFCE7] border border-[#86EFAC] text-[#16A34A] flex items-center justify-center shrink-0">
                <svg className="h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4L19 12L12 20L5 12Z" />
                </svg>
              </span>
            )}
            <span className="truncate">
              {activeView === "session"
                ? activeTopicTitle
                : activeView === "plan"
                ? "Study Plan Roadmap"
                : activeView === "update-plan"
                ? "Building Your Study Plan"
                : activeView === "exams"
                ? "Exam & Oral Simulations"
                : activeView === "sources"
                ? "Sources & Materials"
                : "Notes & Studio"}
            </span>
          </button>
        </div>

        {/* Top-Right: Floating Streak & Badges matching Images 3, 4, 5 */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 px-3 py-1.5 text-xs font-extrabold text-slate-800 shadow-sm">
            <span>🥕</span>
            <span>{sessionStep >= 2 ? "2" : sessionStep === 1 ? "1" : "0"}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-bold">◇ 0</span>
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

      {/* Main Canvas Middle Content */}
      <div className="flex-1 flex flex-col min-h-0 pt-18 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
        {activeView === "session" && (
          <MessageFeed
            messages={messages}
            citations={citations}
            activeDirectiveMessageId={activeDirectiveMessageId}
            sessionStep={sessionStep}
            isTyping={input.trim().length > 0}
            inputLength={input.length}
            activeTopic={activeTopic}
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
            userName={user?.name || "Michael"}
            onSelectTopic={(topic: any) => {
              setActiveView("session");
              sendMessage(`Let's study: ${topic}`);
            }}
            onStartWrittenExam={() => setActiveView("exams")}
            onStartOralExam={() => setActiveView("exams")}
            onContinueSession={() => setActiveView("session")}
            onSwitchToChat={() => setActiveView("session")}
            onOpenUpdatePlan={() => setActiveView("update-plan")}
          />
        )}

        {activeView === "update-plan" && (
          <UpdateStudyPlanView
            userName={user?.name || "Michael"}
            courseTitle={app?.name || app?.title || "Foundations of Cognitive Learning"}
            onStartNow={() => {
              setActiveView("session");
              setSessionStep(0);
            }}
            onSendMessage={(msg) => {
              setActiveView("session");
              sendMessage(msg);
            }}
          />
        )}

        {activeView === "exams" && (
          <ExamsView
            userName={user?.name || "Student"}
            onStartWrittenExam={() => {
              setActiveView("session");
              sendMessage("Start written exam simulation");
            }}
            onStartOralExam={() => {
              setActiveView("session");
              sendMessage("Start oral exam simulation");
            }}
            onSwitchToSession={() => setActiveView("session")}
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

      {/* Floating Bottom Feedback Controls & Centered Ask Z Input matching Screenshots */}
      <div className="sticky bottom-0 z-40 px-4 sm:px-8 pb-5 pt-2 bg-linear-to-t from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent pointer-events-none">
        <div className="max-w-2xl w-full mx-auto pointer-events-auto space-y-2.5">
          {/* Action Pills above Input matching Images 3, 4, 5 */}
          {activeView === "session" && (
            <div className="flex items-center justify-end gap-2">
              {sessionStep >= 2 && (
                <>
                  <button
                    type="button"
                    onClick={() => sendMessage("Too easy")}
                    className="rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>😴</span>
                    <span>Too easy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => sendMessage("Too hard")}
                    className="rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🤯</span>
                    <span>Too hard</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleContinue}
                className="rounded-full bg-black hover:bg-slate-800 px-4 py-1.5 text-[11.5px] font-bold text-white shadow-xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="h-3 w-3" />
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

          {/* Floating Input Pill Bar matching 'Ask Z' in Images 3, 4, 5 */}
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

            {/* Input Textarea with 'Ask Z' placeholder */}
            <div className="flex-1 min-w-0 pb-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Z"
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
