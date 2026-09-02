"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Paperclip,
  X,
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
  ChevronDown,
} from "lucide-react";
import { useAppApprove } from "@/hooks";
import { useApp } from "@/hooks/app/use-app-queries";
import {
  useRetryMessage,
  useRateMessage,
  useRespondToArtifact,
} from "@/hooks/app/use-app-actions";
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
    openDocument,
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
  const respondMutation = useRespondToArtifact(sessionId);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstMessageSentRef = useRef(false);

  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const stepParam = searchParams.get("step");
  const chapterParam = searchParams.get("chapter");
  const blockParam = searchParams.get("block");

  const [activeView, setActiveView] = useState<CanvasView>("session");
  const [sessionStep, setSessionStep] = useState<number>(0);
  const [referencePage, setReferencePage] = useState<number | undefined>(undefined);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isPathDrawerOpen, setIsPathDrawerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingAutoSend, setPendingAutoSend] = useState<string | null>(null);

  const activeTopic = useMemo(() => {
    if (app?.studyPlan?.chapters) {
      for (const ch of app.studyPlan.chapters) {
        if (chapterParam && String(ch.chapterId || (ch as any)._id) !== chapterParam) continue;
        const steps = (ch.steps || ch.goals || []) as any[];
        for (const step of steps) {
          const currentActiveStep = (app as any)?.activeStepId;
          if (
            (stepParam && String(step.stepId || step.goalId || step._id) === stepParam) ||
            (topicParam && step.title?.toLowerCase() === topicParam.toLowerCase()) ||
            (!stepParam && !topicParam && currentActiveStep && (step.stepId === currentActiveStep || step._id === currentActiveStep))
          ) {
            const blocks = (step.knowledgeBlocks || step.prerequisites || []) as any[];
            return {
              title: step.title,
              coreIdea: step.coreIdea || step.description,
              whyItMatters: step.whyItMatters,
              knowledgeBlocks: blocks,
              prerequisites: step.prerequisites || [],
            };
          }
        }
      }

      // If no explicit param, find the first uncompleted step in the study plan
      if (!stepParam && !topicParam) {
        for (const ch of app.studyPlan.chapters) {
          const steps = (ch.steps || ch.goals || []) as any[];
          for (const step of steps) {
            const isCompleted = Boolean(step.completed || step.isCompleted);
            if (!isCompleted) {
              const blocks = (step.knowledgeBlocks || step.prerequisites || []) as any[];
              return {
                title: step.title,
                coreIdea: step.coreIdea || step.description,
                whyItMatters: step.whyItMatters,
                knowledgeBlocks: blocks,
                prerequisites: step.prerequisites || [],
              };
            }
          }
        }

        // Fallback to very first step if all completed
        const firstCh = app.studyPlan.chapters[0];
        const firstStep: any = (firstCh?.steps || firstCh?.goals || [])[0];
        if (firstStep) {
          const blocks = (firstStep.knowledgeBlocks || firstStep.prerequisites || []) as any[];
          return {
            title: firstStep.title,
            coreIdea: firstStep.coreIdea || firstStep.description,
            whyItMatters: firstStep.whyItMatters,
            knowledgeBlocks: blocks,
            prerequisites: firstStep.prerequisites || [],
          };
        }
      }
    }
    if (topicParam) {
      return {
        title: topicParam,
      };
    }
    return undefined;
  }, [app?.studyPlan, (app as any)?.activeStepId, chapterParam, stepParam, topicParam]);

  const activeBlock = useMemo(() => {
    if (activeTopic?.knowledgeBlocks && activeTopic.knowledgeBlocks.length > 0) {
      if (blockParam) {
        const found = activeTopic.knowledgeBlocks.find(
          (b: any) =>
            String(b.blockId || b.id || b._id) === blockParam ||
            b.concept === blockParam ||
            b.title === blockParam
        );
        if (found) return found;
      }
      const uncompleted = activeTopic.knowledgeBlocks.find(
        (b: any) => !b.completed && !b.isCompleted
      );
      return uncompleted || activeTopic.knowledgeBlocks[0];
    }
    return undefined;
  }, [activeTopic, blockParam]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  // Prompt Z for initial topic orientation inference if no messages exist yet
  useEffect(() => {
    if (!sessionId || sessionId === "undefined" || messages.length > 0 || firstMessageSentRef.current) {
      return;
    }
    firstMessageSentRef.current = true;
    const promptText = activeTopic?.title
      ? `Give a very short, warm 1-sentence intro welcoming me to explore ${activeTopic.title}.`
      : `Give a very short 1-sentence intro welcoming me to start our session.`;
    sendMessage(promptText, undefined, true);
  }, [sessionId, messages.length, activeTopic?.title, sendMessage]);

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

  // Derive the most-recent unresolved interactive artifact messageId
  const activeArtifactMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (
        m.artifact &&
        ["question", "ask_question", "ask_questions", "quiz", "verification"].includes(
          String((m.artifact as any).type || "").toLowerCase(),
        )
      ) {
        return m.artifactId || m.messageId || m.id;
      }
    }
    return null;
  }, [messages]);

  const handleOpenSource = useCallback(
    (materialId: string, pageNumber?: number) => {
      openDocument(materialId, pageNumber);
    },
    [openDocument],
  );

  const isOpenEndedQuestionActive = useMemo(() => {
    if (activeArtifactMessageId) {
      const activeMsg = messages.find(
        (m) => (m.messageId || m.id) === activeArtifactMessageId,
      );
      if (
        activeMsg?.artifact?.type === "question" ||
        activeMsg?.artifact?.type === "ask_question"
      ) {
        const payload = (activeMsg.artifact.content || {}) as any;
        if (!payload?.options || payload.options.length === 0) {
          return true;
        }
      }
    }
    return false;
  }, [messages, activeArtifactMessageId]);

  // Check if an artifact has been returned in the session
  const hasArtifactReturned = useMemo(() => {
    return messages.some((m) => Boolean(m.artifact || m.artifactId));
  }, [messages]);

  // Check if the most recent active artifact is a recap / summary
  const isRecapActive = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.artifact) {
        const artType = String(msg.artifact.type || "").toLowerCase();
        return artType === "recap" || artType === "summary";
      }
    }
    return false;
  }, [messages]);

  // Step advancement handler for Continue / Keep going button
  const handleContinue = useCallback(
    (artifactId?: string) => {
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: { continued: true, resolved: true, status: "completed" },
          })
          .catch(console.error);
      }
      const topicContext = activeTopic?.title ? ` Topic: "${activeTopic.title}".` : "";
      const sectionDesc = isRecapActive ? "reviewing the recap" : "this section";
      const continueMsg = `[STUDENT_ACTION: CONTINUE]${topicContext} The student finished ${sectionDesc} and clicked Continue. Proceed to the next pedagogical step.`;

      if (sessionStep === 0) {
        setSessionStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (sessionStep === 1) {
        setSessionStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
        sendMessage(continueMsg, undefined, true);
      } else {
        sendMessage(continueMsg, undefined, true);
      }
    },
    [sessionStep, sendMessage, isRecapActive, activeArtifactMessageId, activeTopic?.title, respondMutation],
  );

  const handleKeepGoing = useCallback(() => {
    const topicContext = activeTopic?.title ? ` Topic: "${activeTopic.title}".` : "";
    sendMessage(
      `[STUDENT_ACTION: KEEP_GOING]${topicContext} The student wants to keep going. Continue with the next part of the lesson.`,
      undefined,
      true,
    );
  }, [sendMessage, activeTopic?.title]);

  const handleFeedback = useCallback(
    (type: "too_easy" | "too_hard", artifactId?: string) => {
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: { feedback: type, resolved: true },
          })
          .catch(console.error);
      }
      const topicContext = activeTopic?.title ? ` Topic: "${activeTopic.title}".` : "";
      if (type === "too_easy") {
        toast.success("Pacing adjusted: Diving straight into deeper mastery!");
        setSessionStep((prev) => Math.min(prev + 1, 4));
        sendMessage(
          `[STUDENT_ACTION: PACING_FEEDBACK]${topicContext} The student indicated this pace is too easy. Skip elementary explanations and explore deeper conceptual mastery and challenging problems.`,
          undefined,
          true,
        );
      } else {
        toast.info("Pacing adjusted: Providing extra foundational context.");
        sendMessage(
          `[STUDENT_ACTION: PACING_FEEDBACK]${topicContext} The student indicated this pace is too hard. Slow down, provide foundational intuition, and explain concepts step-by-step with concrete analogies.`,
          undefined,
          true,
        );
      }
    },
    [sendMessage, activeArtifactMessageId, activeTopic?.title, respondMutation],
  );

  // Knowledge Pathway items for entire roadmap across the session
  const pathwayItems: KnowledgeBlockItem[] = useMemo(() => {
    const items: KnowledgeBlockItem[] = [];

    if (app?.studyPlan?.chapters && app.studyPlan.chapters.length > 0) {
      let foundCurrent = false;

      for (const ch of app.studyPlan.chapters) {
        const steps = (ch.steps || ch.goals || []) as any[];
        for (const step of steps) {
          const blocks = (step.knowledgeBlocks || step.prerequisites || []) as any[];
          if (blocks.length > 0) {
            for (const b of blocks) {
              const isCompleted = Boolean(b.completed || b.isCompleted);
              const isCurrent =
                !foundCurrent &&
                ((activeBlock?.blockId && (activeBlock.blockId === b.blockId || activeBlock.blockId === b.id)) ||
                 (activeBlock?.concept && activeBlock.concept === b.concept) ||
                 (activeTopic?.title && step.title === activeTopic.title));

              if (isCurrent) {
                foundCurrent = true;
              }

              items.push({
                id: String(b.blockId || b.id || b._id || items.length),
                title: b.concept || b.title || step.title || `Concept ${items.length + 1}`,
                status: isCompleted ? "completed" : isCurrent ? "current" : "upcoming",
                description: b.summary || b.description || step.description,
              });
            }
          } else {
            const isCompleted = Boolean(step.isCompleted || step.completed);
            const isCurrent =
              !foundCurrent &&
              (activeTopic?.title === step.title || (!activeTopic && items.length === 0));

            if (isCurrent) {
              foundCurrent = true;
            }

            items.push({
              id: String(step.stepId || step.goalId || step._id || items.length),
              title: step.title || `Topic ${items.length + 1}`,
              status: isCompleted ? "completed" : isCurrent ? "current" : "upcoming",
              description: step.description || step.coreIdea,
            });
          }
        }
      }

      if (!foundCurrent && items.length > 0) {
        const firstUncompletedIdx = items.findIndex((it) => it.status !== "completed");
        const targetIdx = firstUncompletedIdx >= 0 ? firstUncompletedIdx : 0;
        items[targetIdx].status = "current";
      }

      return items;
    }

    // Fallback: activeTopic knowledgeBlocks
    if (activeTopic?.knowledgeBlocks && activeTopic.knowledgeBlocks.length > 0) {
      return activeTopic.knowledgeBlocks.map((b: any, idx: number) => {
        const isCurrent =
          (activeBlock?.blockId && activeBlock.blockId === b.blockId) ||
          (activeBlock?._id && activeBlock._id === b._id) ||
          (activeBlock?.concept && activeBlock.concept === b.concept) ||
          (!activeBlock && idx === 0);
        const isCompleted = Boolean(b.completed || b.isCompleted);
        return {
          id: String(b.blockId || b._id || idx),
          title: b.concept || b.title || b.summary || `Concept ${idx + 1}`,
          status: isCompleted ? "completed" : isCurrent ? "current" : "upcoming",
          description: b.summary || b.description,
        };
      });
    }

    return [];
  }, [app?.studyPlan, activeTopic, activeBlock]);

  // Active topic title based on current roadmap item or latest artifact/topic
  const activeTopicTitle = useMemo(() => {
    if (topicParam) return topicParam;

    // 1. Sync directly with what the roadmap displays as current
    const currentItem = pathwayItems.find((it) => it.status === "current");
    if (currentItem?.title) {
      return currentItem.title;
    }

    // 2. Check the latest artifact's topicTitle in messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const art = messages[i]?.artifact;
      if (art) {
        const title = art.content?.topicTitle || art.title;
        if (
          title &&
          title !== "Knowledge Check" &&
          title !== "Concept Check" &&
          title !== "Concept Exposition"
        ) {
          return title;
        }
      }
    }

    // 3. Fallbacks
    return (
      activeBlock?.concept ||
      activeBlock?.title ||
      activeTopic?.title ||
      app?.name ||
      "Learning Session"
    );
  }, [topicParam, pathwayItems, messages, activeBlock, activeTopic, app]);

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

  // Artifact action helpers
  const handleSubmitAnswer = useCallback(
    (answers: string[], questions?: string[], artifactId?: string) => {
      if (!sessionId) return;

      // 1. Modify that particular artifact directly
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: {
              answers,
              userAnswers: answers,
              selectedOption: answers[0],
              answer: answers[0],
              submittedAnswer: answers.join(", "),
              resolved: true,
              status: "completed",
            },
          })
          .catch((err: unknown) =>
            console.error("[respondToArtifact] failed", err),
          );
      }

      // 2. Send answer through a system action to Z (NO user chat bubble displayed!)
      const topicHeader = activeTopic?.title ? ` Topic: "${activeTopic.title}"` : "";
      const blockInfo = activeBlock?.concept || activeBlock?.title ? ` [Concept: ${activeBlock.concept || activeBlock.title}]` : "";
      const answerBody =
        questions && questions.length > 0
          ? questions
              .map((q, i) => `Q: ${q}\nA: ${answers[i] ?? ""}`)
              .join("\n\n")
          : `Submitted answer: ${answers.join(", ")}`;

      const message = `[STUDENT_ACTION: SUBMIT_ANSWER]${topicHeader}${blockInfo}\n${answerBody}\nPlease evaluate my answer, give concise pedagogical feedback, and guide me forward.`;

      sendMessage(message, undefined, true);
    },
    [sessionId, activeArtifactMessageId, activeTopic?.title, activeBlock?.concept, activeBlock?.title, respondMutation, sendMessage],
  );

  const handleApprove = useCallback(
    (artifactId?: string) => {
      if (!sessionId) return;
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: { approved: true, resolved: true, status: "completed" },
          })
          .catch(console.error);
      }
      approveMutation
        .mutateAsync(sessionId)
        .catch((err: unknown) => console.error("[approvePlan] failed", err));
    },
    [sessionId, activeArtifactMessageId, approveMutation, respondMutation],
  );

  const handleRetry = useCallback(
    (artifactId?: string) => {
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: { retry: true, resolved: false },
          })
          .catch(console.error);
      }
      const topicContext = activeTopic?.title ? ` for topic "${activeTopic.title}"` : "";
      sendMessage(
        `[STUDENT_ACTION: RETRY] The student requested another attempt at this question${topicContext}. Provide a helpful, constructive hint or alternate intuitive angle to guide them, then let them try again.`,
        undefined,
        true,
      );
    },
    [sendMessage, activeArtifactMessageId, activeTopic?.title, respondMutation],
  );

  const handleSkip = useCallback(
    (artifactId?: string) => {
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: { skipped: true, resolved: true },
          })
          .catch(console.error);
      }
      const topicContext = activeTopic?.title ? ` on "${activeTopic.title}"` : "";
      sendMessage(
        `[STUDENT_ACTION: SKIP] The student chose to skip this step${topicContext}. Acknowledge briefly and smoothly proceed to the next concept or question.`,
        undefined,
        true,
      );
    },
    [sendMessage, activeArtifactMessageId, activeTopic?.title, respondMutation],
  );

  const handleExplainDifferently = useCallback(
    (topicTitle: string, artifactId?: string) => {
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: { explainDifferently: true, topicTitle, resolved: true },
          })
          .catch(console.error);
      }
      const topic = topicTitle || activeTopic?.title || "this concept";
      sendMessage(
        `[STUDENT_ACTION: EXPLAIN_DIFFERENTLY] The student found the previous explanation of "${topic}" unclear or difficult to grasp. Re-explain the intuition using a fresh, concrete real-world analogy and a simpler breakdown.`,
        undefined,
        true,
      );
    },
    [sendMessage, activeArtifactMessageId, activeTopic?.title, respondMutation],
  );

  const handleTestMe = useCallback(
    (topicTitle: string, artifactId?: string) => {
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: { testMe: true, topicTitle, resolved: true },
          })
          .catch(console.error);
      }
      const topic = topicTitle || activeTopic?.title || "this topic";
      sendMessage(
        `[STUDENT_ACTION: TEST_ME] The student feels ready and requested to be tested on "${topic}". Call 'ask_question' to present an insightful question testing their understanding.`,
        undefined,
        true,
      );
    },
    [sendMessage, activeArtifactMessageId, activeTopic?.title, respondMutation],
  );

  const handleTryMyself = useCallback(
    (topicTitle: string, artifactId?: string) => {
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: { tryMyself: true, topicTitle, resolved: true },
          })
          .catch(console.error);
      }
      const topic = topicTitle || activeTopic?.title || "this topic";
      sendMessage(
        `[STUDENT_ACTION: TRY_MYSELF] The student wants to work through "${topic}" independently. Encourage them briefly and invite them to share their solution or thoughts when ready.`,
        undefined,
        true,
      );
    },
    [sendMessage, activeArtifactMessageId, activeTopic?.title, respondMutation],
  );

  const handleAction = useCallback(
    (actionType: string, artifactId?: string) => {
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: { action: actionType, resolved: true },
          })
          .catch(console.error);
      }
      const topic = activeTopic?.title ? ` regarding topic "${activeTopic.title}"` : "";
      sendMessage(
        `[STUDENT_ACTION: CUSTOM_ACTION] The student selected action "${actionType}"${topic}. Respond accordingly to assist their study journey.`,
        undefined,
        true,
      );
    },
    [sendMessage, activeArtifactMessageId, activeTopic?.title, respondMutation],
  );

  const handlePomodoroResume = useCallback(
    (artifactId?: string) => {
      const targetId = artifactId || activeArtifactMessageId;
      if (targetId) {
        respondMutation
          .mutateAsync({
            artifactId: targetId,
            response: { pomodoroResume: true, resolved: true },
          })
          .catch(console.error);
      }
      const topicContext = activeTopic?.title ? ` for "${activeTopic.title}"` : "";
      sendMessage(
        `[STUDENT_ACTION: POMODORO_RESUME] The student completed their Pomodoro focus break and is ready to resume studying${topicContext}. Welcome them back warmly and continue the lesson where they left off.`,
        undefined,
        true,
      );
    },
    [sendMessage, activeArtifactMessageId, activeTopic?.title, respondMutation],
  );

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
    <div className="relative flex flex-col h-full overflow-hidden bg-[#FAF9F6] bg-[linear-gradient(to_right,#EAE8E1_1px,transparent_1px),linear-gradient(to_bottom,#EAE8E1_1px,transparent_1px)] bg-size-[26px_26px] antialiased selection:bg-[#0C60FC] selection:text-white">
      {/* 
        Transparent Floating Header:
        NO BACKGROUND on the header bar itself, only individual floating divs!
      */}
      <header className="absolute top-0 inset-x-0 z-40 p-4 sm:p-6 flex items-center justify-between pointer-events-none bg-transparent">
        {/* Top-Left Floating Action Launcher Pill */}
        <div className="pointer-events-auto">
          <FloatingActionLauncher items={launcherItems} />
        </div>        {/* Center: Floating Active Topic Pill with smooth entry animation */}
        <div className="pointer-events-auto flex justify-center px-2 min-w-0">
          <AnimatePresence mode="wait">
            {(sessionStep >= 2 || messages.length > 0 || activeView !== "session") && (
              <motion.button
                key="active-topic-pill"
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                type="button"
                onClick={() => setIsPathDrawerOpen(true)}
                className="group inline-flex items-center gap-2 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 px-4 py-2 text-xs font-bold text-slate-800 transition shadow-sm hover:shadow-md cursor-pointer max-w-xs sm:max-w-md truncate backdrop-blur-md"
                title="Click to view learning roadmap"
              >
                <span className="h-3.5 w-3.5 rounded-sm bg-[#DCFCE7] border border-[#86EFAC] text-[#16A34A] flex items-center justify-center shrink-0">
                  <svg className="h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4L19 12L12 20L5 12Z" />
                  </svg>
                </span>
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
                <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-700 shrink-0" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Top-Right: Feedback Button */}
        <div className="pointer-events-auto flex items-center gap-2">
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
            artifacts={app?.artifacts || []}
            citations={citations}
            activeArtifactMessageId={activeArtifactMessageId}
            sessionStep={sessionStep}
            isTyping={input.trim().length > 0}
            inputLength={input.length}
            activeTopic={activeTopic}
            activeBlock={activeBlock}
            pathwayItems={pathwayItems}
            onOpenSource={handleOpenSource}
            onSubmitAnswer={handleSubmitAnswer}
            onApprove={handleApprove}
            onContinue={handleContinue}
            onKeepGoing={handleKeepGoing}
            onFeedback={handleFeedback}
            onRetry={handleRetry}
            onSkip={handleSkip}
            onExplainDifferently={handleExplainDifferently}
            onTestMe={handleTestMe}
            onTryMyself={handleTryMyself}
            onAction={handleAction}
            onPomodoroResume={handlePomodoroResume}
            onRetryMessage={(messageId: string) => {
              truncateFrom(messageId);
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
            sessionId={sessionId}
            userName={user?.name || "Student"}
            courseTitle={app?.name || app?.title || "Study Plan"}
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
            sessionId={sessionId}
            userName={user?.name || "Student"}
            courseTitle={app?.name || app?.title || "Study Plan"}
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
            sessionId={sessionId}
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
              {hasArtifactReturned && (
                <>
                  <button
                    type="button"
                    onClick={() => handleFeedback("too_easy")}
                    className="rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>😴</span>
                    <span>Too easy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFeedback("too_hard")}
                    className="rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🤯</span>
                    <span>Too hard</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handleContinue()}
                className="rounded-full bg-black hover:bg-slate-800 px-4 py-1.5 text-[11.5px] font-bold text-white shadow-xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>{isRecapActive ? "Keep going" : "Continue"}</span>
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
          <div
            className={cn(
              "relative rounded-[28px] bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 p-2 sm:p-2.5 flex items-end gap-2 transition-all focus-within:border-[#0C60FC] focus-within:ring-4 focus-within:ring-blue-100",
              isOpenEndedQuestionActive &&
                "ring-2 ring-amber-400 border-amber-300 shadow-amber-200/50 animate-pulse"
            )}
          >
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

      {/* Slide-over Knowledge Pathway Drawer (Read-only Progress Track) */}
      <PathDrawer
        isOpen={isPathDrawerOpen}
        onClose={() => setIsPathDrawerOpen(false)}
        items={pathwayItems}
        chapterTitle={app?.title || "Foundations of Cognitive Learning"}
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
