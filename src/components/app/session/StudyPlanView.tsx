"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Pencil,
  Mic,
  RotateCcw,
  Edit2,
  Settings,
  Sparkles,
  BookOpen,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExamSimulatorModal } from "./ExamSimulatorModal";
import { ExamHistoryDrawer } from "./ExamHistoryDrawer";
import { useApp } from "@/hooks/app/use-app-queries";
import {
  useToggleBlockCompletion,
  useContinueJourney,
  useAppMessage,
  useGenerateStudyPlan,
  useAppMaterials,
} from "@/hooks/app/use-app-actions";
import type { IChapter, IChapterGoal, IKnowledgeBlock, IStudyStep } from "@/types/session";
import { toast } from "sonner";

interface StudyPlanViewProps {
  userName?: string;
  courseTitle?: string;
  chapterProgress?: Record<number, { completed: number; total: number }>;
  onContinueSession?: () => void;
  onOpenUpdatePlan?: () => void;
  onOpenEditPlan?: () => void;
  onSelectTopic?: (topic: any) => void;
  onStartWrittenExam?: () => void;
  onStartOralExam?: () => void;
  onSwitchToChat?: () => void;
  sessionId?: string;
}

// ── Shared Icons Matching Screenshot Exact Geometry ──────────────────────────
export function DiamondIcon({
  completed = false,
  className = "h-3.5 w-2.5",
}: {
  completed?: boolean;
  className?: string;
}) {
  if (completed) {
    return (
      <svg viewBox="0 0 14 18" className={cn("shrink-0", className)} fill="none">
        <path
          d="M7 1L13 9L7 17L1 9Z"
          fill="#A3E635"
          stroke="#4D7C0F"
          strokeWidth="1.2"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 14 18" className={cn("shrink-0", className)} fill="none">
      <path
        d="M7 1L13 9L7 17L1 9Z"
        fill="#FFFFFF"
        stroke="#94A3B8"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function CloverIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("shrink-0", className)} fill="none">
      <path d="M12 2L15 5L12 8L9 5Z" fill="#A3E635" stroke="#4D7C0F" strokeWidth="0.8" />
      <path d="M12 16L15 19L12 22L9 19Z" fill="#A3E635" stroke="#4D7C0F" strokeWidth="0.8" />
      <path d="M5 9L8 12L5 15L2 12Z" fill="#A3E635" stroke="#4D7C0F" strokeWidth="0.8" />
      <path d="M19 9L22 12L19 15L16 12Z" fill="#A3E635" stroke="#4D7C0F" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * ChapterProgressRing renders the chapter number with an outer circular progress track
 * visualizing how far the user has progressed through the specific chapter.
 */
export function ChapterProgressRing({
  number,
  completed,
  total,
  progress,
  size = "md",
  className,
}: {
  number: number;
  completed?: number;
  total?: number;
  progress?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const fraction =
    typeof progress === "number"
      ? progress
      : typeof total === "number" && total > 0
      ? (completed ?? 0) / total
      : 0;

  const isFull = fraction >= 1;
  const isStarted = fraction > 0;

  const sizeClasses = {
    sm: "h-6 w-6 text-[10.5px]",
    md: "h-7 w-7 text-xs",
    lg: "h-8.5 w-8.5 text-[13px]",
  }[size];

  const strokeWidth = size === "sm" ? 2.2 : 2.5;
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - Math.min(Math.max(fraction, 0), 1) * circumference;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-white shadow-2xs shrink-0 select-none transition-transform hover:scale-105",
        sizeClasses,
        className
      )}
      title={`Chapter ${number} Progress: ${completed ?? Math.round(fraction * 100)}/${total ?? 100} completed (${Math.round(fraction * 100)}%)`}
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 28 28">
        {/* Base Unfilled Track */}
        <circle
          cx="14"
          cy="14"
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />

        {/* Dynamic Progress Indicator Arc */}
        {isStarted && (
          <motion.circle
            cx="14"
            cy="14"
            r={radius}
            fill="none"
            stroke={isFull ? "#22C55E" : "#F59E0B"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        )}
      </svg>
      <span className="font-bold text-slate-900 z-10 leading-none">{number}</span>
    </div>
  );
}

export function StudyPlanView({
  userName = "Student",
  courseTitle,
  chapterProgress,
  onContinueSession,
  onOpenUpdatePlan,
  onOpenEditPlan,
  onSelectTopic,
  onStartWrittenExam,
  onStartOralExam,
  onSwitchToChat,
  sessionId,
}: StudyPlanViewProps) {
  const router = useRouter();
  const { data: app } = useApp(sessionId || "");
  const { data: sessionMaterials } = useAppMaterials(sessionId || "");
  const toggleBlockMutation = useToggleBlockCompletion(sessionId || "");
  const continueJourneyMutation = useContinueJourney(sessionId || "");
  const generatePlanMutation = useGenerateStudyPlan(sessionId || "");
  const sendMessageMutation = useAppMessage();

  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({
    1: true,
  });
  const [openLessonsSections, setOpenLessonsSections] = useState<Record<number, boolean>>({});
  const [openStepsMap, setOpenStepsMap] = useState<Record<string, boolean>>({});
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isExamHistoryOpen, setIsExamHistoryOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const hasMaterials =
    (Array.isArray(sessionMaterials) && sessionMaterials.length > 0) ||
    (Array.isArray(app?.materials) && app.materials.length > 0) ||
    (Array.isArray(app?.materialIds) && app.materialIds.length > 0);

  // Extract chapters from live studyPlan
  const chapters: IChapter[] = useMemo(() => {
    if (app?.studyPlan?.chapters && app.studyPlan.chapters.length > 0) {
      return app.studyPlan.chapters;
    }
    return [];
  }, [app?.studyPlan]);

  const toggleChapter = (num: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  const toggleLessonsSection = (chNum: number) => {
    setOpenLessonsSections((prev) => ({
      ...prev,
      [chNum]: !prev[chNum],
    }));
  };

  const toggleStep = (stepKey: string) => {
    setOpenStepsMap((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const handleExpandAll = () => {
    const nextChapters: Record<number, boolean> = {};
    const nextSections: Record<number, boolean> = {};
    const nextSteps: Record<string, boolean> = {};
    chapters.forEach((ch, idx) => {
      const chNum = ch.chapterNumber || idx + 1;
      nextChapters[chNum] = true;
      nextSections[chNum] = true;
      const steps = (ch.steps || ch.goals || []) as any[];
      steps.forEach((step, sIdx) => {
        nextSteps[`${chNum}-${step.stepId || step.goalId || sIdx}`] = true;
      });
    });
    setExpandedChapters(nextChapters);
    setOpenLessonsSections(nextSections);
    setOpenStepsMap(nextSteps);
  };

  const handleCollapseAll = () => {
    const nextChapters: Record<number, boolean> = {};
    const nextSections: Record<number, boolean> = {};
    const nextSteps: Record<string, boolean> = {};
    chapters.forEach((ch, idx) => {
      const chNum = ch.chapterNumber || idx + 1;
      nextChapters[chNum] = false;
      nextSections[chNum] = false;
      const steps = (ch.steps || ch.goals || []) as any[];
      steps.forEach((step, sIdx) => {
        nextSteps[`${chNum}-${step.stepId || step.goalId || sIdx}`] = false;
      });
    });
    setExpandedChapters(nextChapters);
    setOpenLessonsSections(nextSections);
    setOpenStepsMap(nextSteps);
  };

  const isAllExpanded = chapters.length > 0 && chapters.every((ch, idx) => expandedChapters[ch.chapterNumber || idx + 1]);
  const isAllCollapsed = chapters.length > 0 && chapters.every((ch, idx) => !expandedChapters[ch.chapterNumber || idx + 1]);

  // Calculate overall course completion
  const { totalCompleted, totalBlocks } = useMemo(() => {
    let completed = 0;
    let total = 0;
    for (const ch of chapters) {
      const steps = (ch.steps || ch.goals || []) as any[];
      for (const step of steps) {
        const blocks = (step.prerequisites || step.knowledgeBlocks || []) as any[];
        for (const b of blocks) {
          total++;
          if (b.completed || b.isCompleted) completed++;
        }
      }
    }
    return {
      totalCompleted: app?.studyPlan?.completedBlocks ?? completed,
      totalBlocks: app?.studyPlan?.totalBlocks ?? total,
    };
  }, [chapters, app?.studyPlan]);

  const handleBlockToggle = async (blockId: string) => {
    if (!sessionId || !blockId) return;
    try {
      await toggleBlockMutation.mutateAsync(blockId);
    } catch {
      toast.error("Failed to toggle block status");
    }
  };

  const handleContinueChapter = async (ch: IChapter) => {
    if (!sessionId) return;
    const targetStep =
      (ch.steps || ch.goals || []).find((s: any) =>
        (s.prerequisites || s.knowledgeBlocks || []).some(
          (b: any) => !b.completed && !b.isCompleted,
        ),
      ) ||
      (ch.steps && ch.steps[0]) ||
      (ch.goals && ch.goals[0]);

    const step = targetStep as any;
    const stepBlocks = (step?.prerequisites || step?.knowledgeBlocks || []) as any[];
    const targetBlock =
      stepBlocks.find((b: any) => !b.completed && !b.isCompleted) ||
      stepBlocks[0];

    const params = new URLSearchParams();
    const chId = ch.chapterId || (ch as any)._id;
    if (chId) params.set("chapter", String(chId));
    const chNum = ch.chapterNumber || (ch as any).number || 1;
    params.set("chapterNumber", String(chNum));

    const sId = step?.stepId || step?.goalId || step?._id;
    if (sId) params.set("step", String(sId));
    if (step?.title) params.set("topic", step.title);

    const bId = targetBlock?.blockId || targetBlock?._id;
    if (bId) params.set("block", String(bId));

    try {
      continueJourneyMutation.mutate({
        chapterId: chId,
        stepId: sId,
        blockId: bId,
        chapterNumber: chNum,
        topicTitle: targetStep?.title,
      });
    } catch {
      // Non-blocking
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    if (onContinueSession) {
      onContinueSession();
    } else {
      router.push(`/study-session/${sessionId}/session${query}`);
    }
  };

  const handleSelectStep = async (ch: IChapter, step: any) => {
    if (!sessionId) return;
    const targetBlock =
      step.prerequisites?.find((b: any) => !b.completed) ||
      step.knowledgeBlocks?.find((b: any) => !b.isCompleted) ||
      step.prerequisites?.[0] ||
      step.knowledgeBlocks?.[0];

    const params = new URLSearchParams();
    const chId = ch.chapterId || (ch as any)._id;
    if (chId) params.set("chapter", String(chId));
    const chNum = ch.chapterNumber || ch.number || 1;
    params.set("chapterNumber", String(chNum));

    const sId = step.stepId || step.goalId || step._id;
    if (sId) params.set("step", String(sId));
    if (step.title) params.set("topic", step.title);

    const bId = targetBlock?.blockId || targetBlock?._id;
    if (bId) params.set("block", String(bId));

    try {
      continueJourneyMutation.mutate({
        chapterId: chId,
        stepId: sId,
        blockId: bId,
        chapterNumber: chNum,
        topicTitle: step.title,
      });
    } catch {
      // Non-blocking
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    if (onContinueSession) {
      onContinueSession();
    } else {
      router.push(`/study-session/${sessionId}/session${query}`);
    }
  };

  const handleUpdateClick = async () => {
    if (!sessionId) return;
    try {
      await continueJourneyMutation.mutateAsync();
      toast.success("Study plan synchronized with latest progress");
    } catch {
      toast.error("Failed to update study plan");
    }
  };

  const handleGeneratePlan = async () => {
    if (!sessionId || !hasMaterials) return;
    try {
      setIsGenerating(true);
      await generatePlanMutation.mutateAsync();
      toast.success("Study plan generation job queued! It will update shortly.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to trigger study plan generation";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 py-5 antialiased pb-28">
      {/* Center Stack matching screenshot width (~580px) */}
      <div className="w-full max-w-[580px] space-y-4">
        {/* Top Header Row matching screenshot */}
        <div className="flex items-center justify-between pt-0.5">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight">
                Study plan
              </h1>
              {totalBlocks > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4D7C0F] font-mono">
                  {totalCompleted}/{totalBlocks}
                  <CloverIcon className="h-3 w-3" />
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5">
              {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
            </p>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenEditPlan || onOpenUpdatePlan}
              className="flex h-7.5 w-7.5 items-center justify-center rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              title="Edit study plan"
            >
              <Edit2 className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={handleUpdateClick}
              disabled={continueJourneyMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw
                className={cn(
                  "h-2.5 w-2.5 text-slate-400",
                  continueJourneyMutation.isPending && "animate-spin text-[#0C60FC]"
                )}
              />
              <span>{continueJourneyMutation.isPending ? "Updating..." : "Update"}</span>
            </button>

            {/* Expand (≡) / Collapse (=) Global Toggle Buttons */}
            {chapters.length > 0 && (
              <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/70">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className={cn(
                    "flex h-6.5 w-6.5 items-center justify-center rounded-lg cursor-pointer transition",
                    isAllExpanded
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-400 hover:text-slate-700"
                  )}
                  title="Expand all chapters"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-3">
                    <rect y="2" width="16" height="2" rx="1" />
                    <rect y="7" width="16" height="2" rx="1" />
                    <rect y="12" width="16" height="2" rx="1" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className={cn(
                    "flex h-6.5 w-6.5 items-center justify-center rounded-lg cursor-pointer transition",
                    isAllCollapsed
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-400 hover:text-slate-700"
                  )}
                  title="Collapse all chapters"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-3">
                    <rect y="4" width="16" height="2.5" rx="1" />
                    <rect y="9.5" width="16" height="2.5" rx="1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Stack with Dotted Vertical Connector Line ─────────────────── */}
        <div className="relative space-y-4">
          {chapters.length > 1 && (
            <div className="absolute left-[22px] top-10 bottom-10 w-0 border-l-2 border-dotted border-slate-300/80 pointer-events-none z-0" />
          )}

          {chapters.length === 0 ? (
            /* Empty State when no study plan exists */
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-8 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mx-auto">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Ready to map your study journey?
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Z can generate an interactive chapter roadmap with knowledge blocks and exam checkpoints based on your uploaded notes and textbooks.
              </p>
              <div className="pt-2 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={isGenerating || !sessionId || !hasMaterials}
                  title={
                    !hasMaterials
                      ? "Upload study materials to generate a study plan"
                      : undefined
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating roadmap...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>Generate Study Plan with Z</span>
                    </>
                  )}
                </button>
                {!hasMaterials && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    Upload at least one study material in the session to generate a study plan.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Dynamically render all chapters */
            chapters.map((ch, idx) => {
              const chNum = ch.chapterNumber || idx + 1;
              const isExpanded = !!expandedChapters[chNum];
              const isFirst = idx === 0;
              const steps = (ch.steps || ch.goals || []) as any[];

              // Calculate chapter totals
              let chCompleted = 0;
              let chTotal = 0;
              for (const step of steps) {
                const blocks = (step.prerequisites || step.knowledgeBlocks || []) as any[];
                for (const b of blocks) {
                  chTotal++;
                  if (b.completed || b.isCompleted) chCompleted++;
                }
              }

              return (
                <motion.div
                  key={ch.chapterId || chNum}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "relative z-10 rounded-[28px] border border-slate-200/90 bg-white overflow-hidden shadow-xs",
                    !isExpanded && !isFirst && "rounded-full px-4 py-2.5 sm:py-3 cursor-pointer hover:bg-slate-50"
                  )}
                >
                  {/* Recommended Pill Header for First Chapter */}
                  {isFirst && (
                    <div
                      onClick={() => toggleChapter(chNum)}
                      className="bg-linear-to-r from-[#0C60FC] via-[#38BDF8] to-[#6366F1] px-5 py-2.5 flex items-center justify-between cursor-pointer"
                    >
                      <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[9.5px] font-bold text-white uppercase tracking-wider">
                        Recommended
                      </span>
                    </div>
                  )}

                  {isExpanded ? (
                    /* ── Expanded Chapter View ── */
                    <div className="p-5 sm:p-6 space-y-3.5">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          onClick={() => toggleChapter(chNum)}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <ChapterProgressRing
                            number={chNum}
                            completed={chCompleted}
                            total={chTotal}
                          />
                          <h2 className="text-[14.5px] sm:text-base font-bold text-slate-950 tracking-tight hover:text-amber-700 transition">
                            {ch.title}
                          </h2>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="rounded-full bg-slate-50 border border-slate-200/80 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
                            <span>
                              {chCompleted} / {chTotal}
                            </span>
                            <DiamondIcon completed={chCompleted > 0} />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleContinueChapter(ch)}
                            className="rounded-full bg-black hover:bg-slate-850 text-white px-4 py-1.5 text-xs font-bold shadow-xs hover:scale-102 transition cursor-pointer flex items-center gap-1"
                          >
                            <span>Continue</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Chapter Description */}
                      {ch.description && (
                        <p className="text-xs text-slate-500 leading-relaxed pl-10 pr-2 font-sans">
                          {ch.description}
                        </p>
                      )}

                      {/* Lessons Section */}
                      {steps.length > 0 && (() => {
                        const isLessonsOpen = !!openLessonsSections[chNum];
                        const firstStep = steps[0];
                        const firstStepBlocks = (firstStep?.prerequisites || firstStep?.knowledgeBlocks || []) as any[];
                        let firstStepCompleted = 0;
                        for (const b of firstStepBlocks) {
                          if (b.completed || b.isCompleted) firstStepCompleted++;
                        }

                        return (
                          <div className="pt-2">
                            {/* Lessons Header Row */}
                            <div
                              onClick={() => toggleLessonsSection(chNum)}
                              className="flex items-center justify-between py-1 cursor-pointer group select-none"
                            >
                              <div className="flex items-center gap-2 text-xs text-slate-600 font-bold group-hover:text-slate-950 transition">
                                <CloverIcon />
                                <span>Lessons</span>
                                {!isLessonsOpen && (
                                  <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                                    <span>Step 1</span>
                                    <span className="font-mono text-slate-500 font-normal">
                                      {firstStepCompleted} / {firstStepBlocks.length}
                                    </span>
                                    <DiamondIcon completed={firstStepCompleted > 0} className="h-3 w-2" />
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLessonsSection(chNum);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer transition"
                                title={isLessonsOpen ? "Collapse lessons" : "Expand lessons"}
                              >
                                <svg
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  className={cn("h-3 w-3 transition-transform duration-200", isLessonsOpen && "rotate-45")}
                                >
                                  <path
                                    d="M2 6L6 2M6 2H3M6 2V5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M14 10L10 14M10 14H13M10 14V11"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>

                            {/* Steps List with Left Connecting Line - revealed when isLessonsOpen */}
                            <AnimatePresence initial={false}>
                              {isLessonsOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="relative pl-6 space-y-3 pt-1.5"
                                >
                                  {/* Vertical Connecting Line */}
                                  <div className="absolute left-[7px] top-1 bottom-3 w-[1px] border-l border-dashed border-slate-300 pointer-events-none" />

                                  {steps.map((step, sIdx) => {
                                    const stepKey = `${chNum}-${step.stepId || step.goalId || sIdx}`;
                                    const isStepOpen = !!openStepsMap[stepKey];
                                    const blocks = (step.prerequisites || step.knowledgeBlocks || []) as any[];

                                    let stepCompleted = 0;
                                    for (const b of blocks) {
                                      if (b.completed || b.isCompleted) stepCompleted++;
                                    }

                                    // Pair blocks in 2-column rows
                                    const pairedRows: Array<{ left: any; right?: any }> = [];
                                    for (let i = 0; i < blocks.length; i += 2) {
                                      pairedRows.push({
                                        left: blocks[i],
                                        right: blocks[i + 1],
                                      });
                                    }

                                    return (
                                      <div key={step.stepId || step.goalId || sIdx} className="space-y-2">
                                        {/* Step Capsule Pill Bar */}
                                        <div
                                          onClick={() => toggleStep(stepKey)}
                                          className="group relative rounded-full bg-[#FAF9F6] border border-[#E8E6E0] hover:bg-[#F2F0E8] hover:border-slate-300 px-4 py-2 flex items-center justify-between shadow-2xs cursor-pointer transition"
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <span
                                              className={cn(
                                                "flex h-2.5 w-2.5 items-center justify-center rounded-full border shrink-0 transition",
                                                stepCompleted > 0 && stepCompleted === blocks.length
                                                  ? "border-emerald-600 bg-emerald-500"
                                                  : stepCompleted > 0
                                                    ? "border-amber-600 bg-amber-500"
                                                    : "border-slate-400 bg-white"
                                              )}
                                            />
                                            <span className="text-xs sm:text-[13px] font-bold text-slate-950">
                                              Step {sIdx + 1}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
                                            <span>
                                              {stepCompleted} / {blocks.length}
                                            </span>
                                            <DiamondIcon completed={stepCompleted > 0} />
                                          </div>
                                        </div>

                                        {/* Expanded Knowledge Blocks Card - only shown when isStepOpen and pairedRows.length > 0 */}
                                        <AnimatePresence initial={false}>
                                          {isStepOpen && pairedRows.length > 0 && (
                                            <motion.div
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: "auto" }}
                                              exit={{ opacity: 0, height: 0 }}
                                              className="rounded-[22px] bg-[#F7F6F2] border border-[#E8E6E0] p-4 sm:p-5 space-y-2.5 shadow-2xs"
                                            >
                                              <div className="text-[11px] font-semibold text-slate-400 font-sans tracking-wide">
                                                Knowledge blocks
                                              </div>

                                              <div className="space-y-0">
                                                {pairedRows.map((row, rIdx) => (
                                                  <div
                                                    key={rIdx}
                                                    className={cn(
                                                      "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 py-1.5",
                                                      rIdx < pairedRows.length - 1 && "border-b border-[#E8E6E0]/80"
                                                    )}
                                                  >
                                                    {/* Left Block */}
                                                    {row.left && (
                                                      <div
                                                        onClick={() => handleBlockToggle(row.left.blockId || row.left._id)}
                                                        className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-950 transition cursor-pointer min-w-0"
                                                      >
                                                        <DiamondIcon completed={row.left.isCompleted || row.left.completed} />
                                                        <span className="truncate">{row.left.concept || row.left.title || row.left.summary}</span>
                                                      </div>
                                                    )}

                                                    {/* Right Block */}
                                                    {row.right ? (
                                                      <div
                                                        onClick={() => handleBlockToggle(row.right.blockId || row.right._id)}
                                                        className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-950 transition cursor-pointer min-w-0"
                                                      >
                                                        <DiamondIcon completed={row.right.isCompleted || row.right.completed} />
                                                        <span className="truncate">{row.right.concept || row.right.title || row.right.summary}</span>
                                                      </div>
                                                    ) : (
                                                      <div className="hidden sm:block" />
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* ── Collapsed Chapter View ── */
                    <div
                      onClick={() => toggleChapter(chNum)}
                      className={cn(
                        "flex items-center justify-between gap-2.5",
                        isFirst ? "p-3.5 sm:p-4" : ""
                      )}
                    >
                      <div className="flex items-center gap-2.5 cursor-pointer flex-1">
                        <ChapterProgressRing
                          number={chNum}
                          completed={chCompleted}
                          total={chTotal}
                          size="sm"
                        />
                        <h3 className="text-xs font-bold text-slate-900 leading-snug">
                          {ch.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600">
                        <span>
                          {chCompleted} / {chTotal}
                        </span>
                        <DiamondIcon completed={chCompleted > 0} className="h-3 w-2" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}

          {/* ── Time For A Test Card ────────────────────────────────────── */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-10 rounded-[26px] p-[2px] bg-linear-to-r from-[#0C60FC] via-[#38BDF8] to-[#6366F1] shadow-sm"
          >
            <div className="relative rounded-[24px] bg-white pt-6 pb-5 px-5 text-center space-y-3">
              {/* Parchment 'C' Stamp Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#FFF8E7] border border-[#FFE082] text-[10px] font-black text-amber-950 shadow-xs">
                  C
                </span>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-serif font-normal text-slate-950">
                  Time for a test, {userName}
                </h3>
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  Test yourself on oral and written exam simulations.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(true)}
                  className="rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 text-[11px] font-bold text-slate-800 shadow-2xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Pencil className="h-3 w-3 text-slate-600" />
                  <span>Start written exam</span>
                  <Settings className="h-2.5 w-2.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(true)}
                  className="rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 text-[11px] font-bold text-slate-800 shadow-2xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Mic className="h-3 w-3 text-indigo-600" />
                  <span>Start oral exam</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Underneath Link */}
          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={() => setIsExamHistoryOpen(true)}
              className="text-[11px] text-slate-400 hover:text-slate-800 hover:underline cursor-pointer transition font-medium"
            >
              See your past exams
            </button>
          </div>
        </div>
      </div>

      {/* Exam Simulator Modal */}
      {sessionId && (
        <ExamSimulatorModal
          isOpen={isExamModalOpen}
          onClose={() => setIsExamModalOpen(false)}
          sessionId={sessionId}
        />
      )}

      {/* Exam History Drawer */}
      <AnimatePresence>
        {isExamHistoryOpen && (
          <ExamHistoryDrawer
            isOpen={isExamHistoryOpen}
            onClose={() => setIsExamHistoryOpen(false)}
            userName={userName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
