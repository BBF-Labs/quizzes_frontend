"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  Coffee,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  SkipForward,
  Timer,
  Trophy,
  Unlock,
  ThumbsDown,
  ThumbsUp,
  FileText,
  Sparkles,
  ArrowRight,
  Brain,
  Check,
  AlignLeft,
  Volume2,
  Edit3,
  PenTool,
  Layers,
  GraduationCap,
  Target,
  Compass,
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff,
  Shuffle,
  Send,
  CheckCircle,
  XCircle,
  ListOrdered,
  Award,
  BookMarked,
  Sparkle,
  X,
} from "lucide-react";
import {
  QuestionMarkdown,
  QuizOptionBtn,
} from "@/components/app/quizzes/question-renderer";
import { KnowledgePathway, type KnowledgeBlockItem } from "./KnowledgePathway";
import { cn } from "@/lib/utils";
import type {
  ZAskQuestionPayload,
  ZAskQuestionsPayload,
  ZPomodoroPayload,
  ZShowPlanPayload,
  ZShowQuizPayload,
  ZShowResultPayload,
  ZShowSuggestionPayload,
  ZShowSummaryPayload,
  ZUnlockTopicPayload,
} from "@/types/session";

// ─── Shared Sub-Components ───────────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  className?: string;
  disabled?: boolean;
}

function ActionButton({
  onClick,
  children,
  variant = "secondary",
  className,
  disabled = false,
}: ActionButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-2xl text-xs font-bold px-4 py-2.5 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-slate-950 text-white hover:bg-[#0C60FC] shadow-slate-900/10",
        variant === "secondary" &&
          "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60",
        variant === "success" &&
          "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600",
        variant === "danger" &&
          "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200",
        variant === "ghost" &&
          "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

interface CardWrapperProps {
  resolved: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  citation?: string;
  children: React.ReactNode;
  className?: string;
}

function CardWrapper({
  resolved,
  icon,
  label,
  badge,
  citation,
  children,
  className,
}: CardWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full max-w-xl mx-auto rounded-[28px] border border-slate-200/80 bg-white p-5 sm:p-7 shadow-lg shadow-slate-200/40 space-y-4 transition-all text-slate-900",
        resolved && "opacity-80 bg-slate-50/70 shadow-none border-slate-200/60",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
            {label}
          </span>
        </div>
        {badge && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60 truncate max-w-44">
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-3">{children}</div>

      {citation && (
        <div className="pt-2 flex justify-end">
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 flex items-center gap-1.5">
            <FileText className="h-3 w-3 text-slate-400" />
            <span>{citation}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Speech Helper ───────────────────────────────────────────────────────────

function handleSpeak(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    // Clean markdown syntax before speaking
    const cleanText = text.replace(/[*#_`~\[\]]/g, "").replace(/\n+/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
  }
}

// ─── Q:A Resolved Display ───────────────────────────────────────────────────

interface QAEntryProps {
  question: string;
  answer: string;
  explanation?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
}

function QAResolvedCard({ entries }: { entries: QAEntryProps[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto rounded-[22px] border border-slate-200/90 bg-[#FAFBFD] p-4 sm:p-5 text-xs shadow-2xs space-y-3.5"
    >
      {entries.map((e, i) => {
        const normAns = normalizeOptionText(e.answer).trim().toLowerCase();
        const normCorrect = e.correctAnswer ? normalizeOptionText(e.correctAnswer).trim().toLowerCase() : "";
        const isActuallyCorrect = e.isCorrect !== undefined
          ? e.isCorrect
          : normCorrect
          ? normAns === normCorrect || normAns.includes(normCorrect) || normCorrect.includes(normAns)
          : true;

        return (
          <div key={i} className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
                Q:
              </span>
              <div className="text-slate-900 font-bold leading-relaxed text-xs sm:text-[13px] flex-1">
                <QuestionMarkdown content={e.question} />
              </div>
            </div>

            <div
              className={cn(
                "rounded-2xl p-3 sm:p-3.5 border transition-all space-y-2",
                isActuallyCorrect
                  ? "border-emerald-200/80 bg-white"
                  : "border-rose-200/80 bg-white",
              )}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-0.5 flex items-center gap-1",
                    isActuallyCorrect
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800",
                  )}
                >
                  {isActuallyCorrect ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-700 stroke-[3]" />
                      <span>A:</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-rose-700 stroke-[3]" />
                      <span>A:</span>
                    </>
                  )}
                </span>
                <div className="flex-1 space-y-1.5">
                  <p className="text-slate-950 font-bold text-xs sm:text-[13px] leading-snug">
                    {e.answer || "—"}
                  </p>

                  {!isActuallyCorrect && e.correctAnswer && e.correctAnswer !== e.answer && (
                    <p className="text-[11.5px] text-emerald-800 font-semibold flex items-center gap-1.5 pt-0.5">
                      <span className="text-emerald-600 font-bold">Correct answer:</span>
                      <span className="underline decoration-emerald-400 underline-offset-2">
                        {e.correctAnswer}
                      </span>
                    </p>
                  )}

                  {e.explanation && (
                    <p className="text-[11px] text-slate-600 font-normal leading-relaxed pt-1 border-t border-slate-100">
                      {e.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

// ─── Helper to Normalize Option Strings ───────────────────────────────────────

function normalizeOptionText(opt: any): string {
  let str = "";
  if (typeof opt === "string") {
    str = opt;
  } else if (opt && typeof opt === "object") {
    str = opt.text || opt.label || opt.value || opt.id || JSON.stringify(opt);
  } else {
    str = String(opt ?? "");
  }
  // Strip leading prefixes like "A) ", "A. ", "A: ", "(A) ", "[A] ", "a) ", "1. ", "1) ", etc.
  return str
    .replace(/^(\(?[A-Za-z0-9][\)\.\:\-\]]|\b[A-Za-z0-9][\)\.\:\-])\s*/, "")
    .trim();
}

function isTrueFalseOptions(options?: any[]): boolean {
  if (!options || options.length !== 2) return false;
  const lower = options.map((o) => normalizeOptionText(o).trim().toLowerCase());
  return (
    (lower.some((s) => s === "true" || s.startsWith("true") || s === "a) true") &&
      lower.some((s) => s === "false" || s.startsWith("false") || s === "b) false")) ||
    (lower.some((s) => s === "yes" || s.startsWith("yes")) &&
      lower.some((s) => s === "no" || s.startsWith("no")))
  );
}

// ─── ASK_QUESTION / QUESTION ARTIFACT ────────────────────────────────────────

interface AskQuestionCardProps {
  payload: any;
  resolved: boolean;
  onSubmitAnswer?: (answers: string[], questions?: string[]) => void;
  onRetry?: () => void;
  onSkip?: () => void;
}

function AskQuestionCard({
  payload,
  resolved,
  onSubmitAnswer = () => {},
  onRetry = () => {},
  onSkip = () => {},
}: AskQuestionCardProps) {
  const rawQuestion =
    payload.question ||
    payload.text ||
    payload.prompt ||
    payload.title ||
    "Knowledge Check";

  const rawOptions: any[] = Array.isArray(payload.options) ? payload.options : [];
  const options = rawOptions.map(normalizeOptionText);

  const correctAnswer =
    payload.correctAnswer ||
    payload.solution ||
    payload.answer ||
    "";
  const explanation = payload.explanation || "";
  const hint = payload.hint || "";

  // Check user-submitted responses only — payload.answer is the model's solution key
  const persistedAnswer =
    payload.userAnswer ||
    payload.submittedAnswer ||
    payload.selectedOption ||
    (Array.isArray(payload.userAnswers) && payload.userAnswers[0]) ||
    "";

  const [textAnswer, setTextAnswer] = useState(persistedAnswer);
  const [selectedOption, setSelectedOption] = useState<string | null>(
    persistedAnswer || null,
  );
  const [showHint, setShowHint] = useState(false);
  const [evaluatedChoice, setEvaluatedChoice] = useState<string | null>(
    persistedAnswer || null,
  );

  useEffect(() => {
    if (persistedAnswer && !evaluatedChoice) {
      setEvaluatedChoice(persistedAnswer);
      setSelectedOption(persistedAnswer);
    }
  }, [persistedAnswer, evaluatedChoice]);

  const matchOption = (optText: string, index: number, target: string | null | undefined): boolean => {
    if (!target) return false;
    const normTarget = normalizeOptionText(target).trim().toLowerCase();
    const normOpt = normalizeOptionText(optText).trim().toLowerCase();
    const letter = String.fromCharCode(65 + index).toLowerCase();

    if (normOpt === normTarget || normOpt.includes(normTarget) || normTarget.includes(normOpt)) {
      return true;
    }
    const cleanTarget = normTarget.replace(/[^a-z0-9]/g, "");
    if (cleanTarget === letter) {
      return true;
    }
    const optCleanLetter = normOpt.replace(/[^a-z0-9]/g, "").slice(0, 1);
    if (cleanTarget.length === 1 && optCleanLetter === cleanTarget) {
      return true;
    }
    return false;
  };

  const isUserCorrect = useMemo(() => {
    if (!evaluatedChoice) return false;
    if (!correctAnswer) return true;

    const chosenIndex = options.findIndex((o, idx) => matchOption(o, idx, evaluatedChoice));
    if (chosenIndex >= 0) {
      return matchOption(options[chosenIndex], chosenIndex, correctAnswer);
    }

    const normChoice = normalizeOptionText(evaluatedChoice).trim().toLowerCase();
    const normCorrect = normalizeOptionText(correctAnswer).trim().toLowerCase();
    return normChoice === normCorrect || normChoice.includes(normCorrect) || normCorrect.includes(normChoice);
  }, [evaluatedChoice, correctAnswer, options]);

  const correctOptIndex = options.findIndex((o, idx) => matchOption(o, idx, correctAnswer));
  const correctOptDisplay = correctOptIndex >= 0
    ? `${String.fromCharCode(65 + correctOptIndex)}. ${options[correctOptIndex]}`
    : correctAnswer;

  const isTF = isTrueFalseOptions(options);

  const handleSelectChoice = (choice: string) => {
    if (evaluatedChoice) return;

    setEvaluatedChoice(choice);
    setSelectedOption(choice);
    onSubmitAnswer([choice], [rawQuestion]);
  };

  const handleTextSubmit = () => {
    const ans = textAnswer.trim();
    if (!ans || evaluatedChoice) return;
    setEvaluatedChoice(ans);
    onSubmitAnswer([ans], [rawQuestion]);
  };

  // Specialized True / False Card View
  if (isTF && options.length === 2) {
    const falseOpt =
      options.find((o) =>
        ["false", "no", "b) false"].some((k) => o.trim().toLowerCase().includes(k))
      ) || options[1];
    const trueOpt =
      options.find((o) =>
        ["true", "yes", "a) true"].some((k) => o.trim().toLowerCase().includes(k))
      ) || options[0];

    const isFalseChosen = matchOption(falseOpt, 0, evaluatedChoice);
    const isTrueChosen = matchOption(trueOpt, 1, evaluatedChoice);
    const isFalseCorrect = matchOption(falseOpt, 0, correctAnswer);
    const isTrueCorrect = matchOption(trueOpt, 1, correctAnswer);

    let falseClasses = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800";
    let trueClasses = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800";

    if (evaluatedChoice) {
      if (isFalseChosen) {
        falseClasses = isUserCorrect
          ? "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/30"
          : "border-rose-500 bg-rose-50/90 text-rose-950 font-bold ring-2 ring-rose-500/30";
      } else if (!isUserCorrect && isFalseCorrect) {
        falseClasses = "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-1.5 ring-emerald-400/50";
      } else {
        falseClasses = "opacity-45 border-slate-200 bg-slate-50/50 text-slate-400 pointer-events-none";
      }

      if (isTrueChosen) {
        trueClasses = isUserCorrect
          ? "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/30"
          : "border-rose-500 bg-rose-50/90 text-rose-950 font-bold ring-2 ring-rose-500/30";
      } else if (!isUserCorrect && isTrueCorrect) {
        trueClasses = "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-1.5 ring-emerald-400/50";
      } else {
        trueClasses = "opacity-45 border-slate-200 bg-slate-50/50 text-slate-400 pointer-events-none";
      }
    }

    return (
      <CardWrapper
        resolved={resolved}
        icon={<HelpCircle className="h-4 w-4 text-[#0C60FC]" />}
        label="True / False Check"
        badge={payload.topicTitle || payload.title}
      >
        <div className="py-2">
          <QuestionMarkdown
            content={rawQuestion}
            className="text-base sm:text-lg font-bold text-slate-900 leading-snug"
          />
        </div>

        {hint && (
          <div className="text-xs text-amber-700 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
            <span className="font-bold">Hint: </span>
            {hint}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <motion.button
            type="button"
            whileHover={!evaluatedChoice ? { scale: 1.01 } : {}}
            whileTap={!evaluatedChoice ? { scale: 0.99 } : {}}
            onClick={() => handleSelectChoice(falseOpt)}
            disabled={Boolean(evaluatedChoice)}
            className={cn(
              "rounded-2xl border p-4 flex items-center justify-center gap-2 text-sm font-bold shadow-xs transition-all cursor-pointer",
              falseClasses,
            )}
          >
            <span>👎</span>
            <span>{falseOpt}</span>
            {evaluatedChoice && isFalseChosen && (
              isUserCorrect ? <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> : <X className="h-4 w-4 text-rose-600 stroke-[3]" />
            )}
            {evaluatedChoice && !isFalseChosen && isFalseCorrect && (
              <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />
            )}
          </motion.button>

          <motion.button
            type="button"
            whileHover={!evaluatedChoice ? { scale: 1.01 } : {}}
            whileTap={!evaluatedChoice ? { scale: 0.99 } : {}}
            onClick={() => handleSelectChoice(trueOpt)}
            disabled={Boolean(evaluatedChoice)}
            className={cn(
              "rounded-2xl border p-4 flex items-center justify-center gap-2 text-sm font-bold shadow-xs transition-all cursor-pointer",
              trueClasses,
            )}
          >
            <span>👍</span>
            <span>{trueOpt}</span>
            {evaluatedChoice && isTrueChosen && (
              isUserCorrect ? <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> : <X className="h-4 w-4 text-rose-600 stroke-[3]" />
            )}
            {evaluatedChoice && !isTrueChosen && isTrueCorrect && (
              <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />
            )}
          </motion.button>
        </div>

        {evaluatedChoice && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "rounded-2xl p-3.5 sm:p-4 border transition-all space-y-2 mt-2",
              isUserCorrect
                ? "border-emerald-200/90 bg-emerald-50/40"
                : "border-rose-200/90 bg-rose-50/40"
            )}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span
                className={cn(
                  "text-xs font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5",
                  isUserCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                )}
              >
                {isUserCorrect ? (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    Correct
                  </>
                ) : (
                  <>
                    <X className="h-3.5 w-3.5 stroke-[3]" />
                    Incorrect
                  </>
                )}
              </span>
            </div>

            {explanation && (
              <div className="text-xs text-slate-700 leading-relaxed font-normal pt-1.5 border-t border-slate-200/60">
                <QuestionMarkdown content={explanation} />
              </div>
            )}
          </motion.div>
        )}
      </CardWrapper>
    );
  }

  const optionBadgeColors = [
    "bg-[#FFEDD5] text-[#C2410C]", // A - orange
    "bg-[#DCFCE7] text-[#15803D]", // B - green
    "bg-[#FEF9C3] text-[#A16207]", // C - yellow
    "bg-[#E0E7FF] text-[#4338CA]", // D - blue
    "bg-[#F3E8FF] text-[#7E22CE]", // E - purple
    "bg-[#FCE7F3] text-[#BE185D]", // F - pink
  ];

  // Multiple Choice Question
  if (options.length > 0) {
    return (
      <CardWrapper
        resolved={resolved}
        icon={
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-blue-600">
            <HelpCircle className="h-3 w-3" />
          </span>
        }
        label="Concept Check"
        badge={payload.topicTitle || payload.title}
      >
        <div className="py-1">
          <QuestionMarkdown
            content={rawQuestion}
            className="text-xs sm:text-[13.5px] font-semibold text-slate-900 leading-snug"
          />
        </div>

        {hint && (
          <div className="pt-1">
            {!showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-[11px] text-amber-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Lightbulb className="h-3 w-3" />
                <span>Show hint</span>
              </button>
            ) : (
              <div className="text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                <span className="font-bold">Hint: </span>
                {hint}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1">
          {options.map((opt, i) => {
            const isSelected = matchOption(opt, i, evaluatedChoice);
            const isCorrectOption = matchOption(opt, i, correctAnswer);
            const letter = String.fromCharCode(65 + i);
            const badgeClass = optionBadgeColors[i % optionBadgeColors.length];

            let optionClasses = "border-slate-200/90 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/60";
            let badgeStyle = badgeClass;
            let statusIcon = null;

            if (evaluatedChoice) {
              if (isSelected) {
                if (isUserCorrect) {
                  optionClasses = "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/30 scale-[1.005]";
                  badgeStyle = "bg-emerald-600 text-white font-extrabold";
                  statusIcon = <Check className="h-4 w-4 text-emerald-600 stroke-[3] shrink-0" />;
                } else {
                  optionClasses = "border-rose-500 bg-rose-50/90 text-rose-950 font-bold ring-2 ring-rose-500/30 scale-[0.995]";
                  badgeStyle = "bg-rose-600 text-white font-extrabold";
                  statusIcon = <X className="h-4 w-4 text-rose-600 stroke-[3] shrink-0" />;
                }
              } else if (!isUserCorrect && isCorrectOption) {
                optionClasses = "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-1.5 ring-emerald-400/50";
                badgeStyle = "bg-emerald-600 text-white font-extrabold";
                statusIcon = <Check className="h-4 w-4 text-emerald-600 stroke-[3] shrink-0" />;
              } else {
                optionClasses = "opacity-45 border-slate-200 bg-slate-50/50 text-slate-400 pointer-events-none";
              }
            }

            return (
              <motion.button
                key={i}
                type="button"
                whileHover={!evaluatedChoice ? { scale: 1.005 } : {}}
                whileTap={!evaluatedChoice ? { scale: 0.995 } : {}}
                onClick={() => handleSelectChoice(opt)}
                disabled={Boolean(evaluatedChoice)}
                className={cn(
                  "w-full text-left rounded-[18px] p-3 text-xs font-semibold transition-all border flex items-center gap-3 cursor-pointer shadow-2xs",
                  optionClasses,
                )}
              >
                <span
                  className={cn(
                    "h-6 w-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs transition-colors",
                    badgeStyle,
                  )}
                >
                  {letter}
                </span>
                <span className="flex-1 font-sans leading-relaxed">{opt}</span>
                {statusIcon}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback & Explanation Section */}
        {evaluatedChoice && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "rounded-2xl p-3.5 sm:p-4 border transition-all space-y-2 mt-1",
              isUserCorrect
                ? "border-emerald-200/90 bg-emerald-50/40"
                : "border-rose-200/90 bg-rose-50/40"
            )}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span
                className={cn(
                  "text-xs font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5",
                  isUserCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                )}
              >
                {isUserCorrect ? (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    Correct
                  </>
                ) : (
                  <>
                    <X className="h-3.5 w-3.5 stroke-[3]" />
                    Incorrect
                  </>
                )}
              </span>

              {!isUserCorrect && correctOptDisplay && (
                <span className="text-[11.5px] font-bold text-emerald-800">
                  Correct answer: <span className="font-extrabold underline decoration-emerald-400 underline-offset-2">{correctOptDisplay}</span>
                </span>
              )}
            </div>

            {explanation && (
              <div className="text-xs text-slate-700 leading-relaxed font-normal pt-1.5 border-t border-slate-200/60">
                <QuestionMarkdown content={explanation} />
              </div>
            )}
          </motion.div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => handleSpeak(rawQuestion)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Read aloud"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
          {!evaluatedChoice && (
            <ActionButton onClick={onSkip} variant="ghost">
              Skip
            </ActionButton>
          )}
        </div>
      </CardWrapper>
    );
  }

  // Open-Ended Question
  return (
    <CardWrapper
      resolved={resolved}
      icon={
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-50 border border-amber-200 text-amber-700">
          <Edit3 className="h-3 w-3" />
        </span>
      }
      label="Open-ended Question"
      badge={payload.topicTitle || payload.title}
    >
      <div className="space-y-2 py-1">
        <QuestionMarkdown
          content={rawQuestion}
          className="text-xs sm:text-[13.5px] font-semibold text-slate-900 leading-relaxed font-sans"
        />

        {hint && (
          <div className="text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
            <span className="font-bold">Hint: </span>
            {hint}
          </div>
        )}

        {evaluatedChoice ? (
          <div className="pt-2 space-y-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 shadow-2xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Your Answer:
              </span>
              <p className="leading-relaxed">{evaluatedChoice}</p>
            </div>

            {(explanation || correctAnswer) && (
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3 text-xs text-slate-700 space-y-1.5">
                {correctAnswer && (
                  <p className="text-[11px] text-emerald-800 font-bold">
                    Suggested Answer: {correctAnswer}
                  </p>
                )}
                {explanation && (
                  <div className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60">
                    <QuestionMarkdown content={explanation} />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="pt-2">
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your response here..."
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0C60FC] focus:outline-none transition"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => handleSpeak(rawQuestion)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title="Read aloud"
        >
          <Volume2 className="h-3.5 w-3.5" />
        </button>

        {!evaluatedChoice && (
          <div className="flex items-center gap-2">
            <ActionButton onClick={onSkip} variant="ghost">
              Skip
            </ActionButton>
            <ActionButton
              onClick={() => handleTextSubmit()}
              disabled={!textAnswer.trim()}
              variant="primary"
            >
              <span>Submit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </ActionButton>
          </div>
        )}
      </div>
    </CardWrapper>
  );
}

// ─── ASK_QUESTIONS / PRACTICE SET ────────────────────────────────────────────

interface AskQuestionsCardProps {
  payload: ZAskQuestionsPayload;
  resolved: boolean;
  onSubmitAnswer: (answers: string[], questions?: string[]) => void;
  onSkip: () => void;
}

function AskQuestionsCard({
  payload,
  resolved,
  onSubmitAnswer,
  onSkip,
}: AskQuestionsCardProps) {
  const persistedAnswers =
    (payload as any).userAnswers || (payload as any).answers || [];

  const rawQuestions = payload.questions || [];

  const [answers, setAnswers] = useState<string[]>(
    rawQuestions.map((_, i) => persistedAnswers[i] || ""),
  );
  const submittedRef = useRef<string[]>(persistedAnswers);

  const handleTextChange = (idx: number, val: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleOptionSelect = (idx: number, opt: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = opt;
      return next;
    });
  };

  const allAnswered = answers.every((a) => a && a.trim().length > 0);

  const handleSubmit = () => {
    if (!allAnswered) return;
    submittedRef.current = [...answers];
    onSubmitAnswer(
      answers,
      rawQuestions.map((q) => q.question || (q as any).text || ""),
    );
  };

  if (
    resolved ||
    (persistedAnswers.length > 0 &&
      persistedAnswers.some((a: string) => a && a.trim().length > 0))
  ) {
    return (
      <QAResolvedCard
        entries={rawQuestions.map((q, i) => ({
          question: q.question || (q as any).text || "",
          answer: submittedRef.current[i] || persistedAnswers[i] || "—",
        }))}
      />
    );
  }

  return (
    <CardWrapper
      resolved={resolved}
      icon={<ClipboardList className="h-4 w-4 text-[#0C60FC]" />}
      label="Practice Set"
      badge={`${rawQuestions.length} Questions`}
    >
      <div className="space-y-5 divide-y divide-slate-100">
        {rawQuestions.map((q, idx) => {
          const qText = q.question || (q as any).text || `Question ${idx + 1}`;
          const qOpts: string[] = (q.options || []).map(normalizeOptionText);

          return (
            <div key={idx} className="pt-4 first:pt-0 space-y-2.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-extrabold text-[#0C60FC]">
                  #{idx + 1}
                </span>
                <QuestionMarkdown
                  content={qText}
                  className="text-xs sm:text-sm font-bold text-slate-900 leading-snug"
                />
              </div>

              {qOpts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {qOpts.map((opt, optIdx) => {
                    const isSelected = answers[idx] === opt;
                    const letter = String.fromCharCode(65 + optIdx);
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionSelect(idx, opt)}
                        className={cn(
                          "text-left rounded-xl p-3 text-xs font-semibold transition-all border flex items-center gap-2.5 cursor-pointer",
                          isSelected
                            ? "border-[#0C60FC] bg-blue-50 text-[#0C60FC]"
                            : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-white",
                        )}
                      >
                        <span
                          className={cn(
                            "h-5 w-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0",
                            isSelected
                              ? "bg-[#0C60FC] text-white"
                              : "bg-white text-slate-500 border border-slate-200",
                          )}
                        >
                          {letter}
                        </span>
                        <span className="truncate">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[idx] || ""}
                  onChange={(e) => handleTextChange(idx, e.target.value)}
                  placeholder="Type your response…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#0C60FC]"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <ActionButton onClick={onSkip} variant="ghost">
          Skip
        </ActionButton>
        <ActionButton
          onClick={handleSubmit}
          disabled={!allAnswered}
          variant="primary"
        >
          <span>Submit all</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </ActionButton>
      </div>
    </CardWrapper>
  );
}

// ─── FLASHCARD SET ARTIFACT ──────────────────────────────────────────────────

interface FlashcardItem {
  cardId?: string;
  front: string;
  back: string;
  tags?: string[];
}

interface FlashcardSetCardProps {
  payload: {
    title?: string;
    cards: FlashcardItem[];
  };
  resolved: boolean;
  onContinue?: () => void;
}

function FlashcardSetCard({ payload, resolved }: FlashcardSetCardProps) {
  const cards = payload.cards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex] || cards[0];
  const tags = currentCard.tags || [];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <CardWrapper
      resolved={resolved}
      icon={<Layers className="h-4 w-4 text-indigo-600" />}
      label="Flashcard Set"
      badge={`${currentIndex + 1} of ${cards.length}`}
    >
      <div className="space-y-4">
        {payload.title && (
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
            {payload.title}
          </h4>
        )}

        {/* Interactive Flip Card Container */}
        <div
          onClick={() => setIsFlipped((f) => !f)}
          className="relative w-full min-h-48 sm:min-h-56 rounded-2xl bg-linear-to-br from-indigo-50/60 via-white to-slate-50 border border-indigo-100/90 p-6 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md transition-all group"
        >
          {/* Card Top Pill */}
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <Sparkles className="h-3 w-3" />
              <span>{isFlipped ? "Answer / Definition" : "Prompt / Question"}</span>
            </span>
            <span className="text-slate-400 group-hover:text-slate-700 flex items-center gap-1">
              {isFlipped ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              <span>Click to flip</span>
            </span>
          </div>

          {/* Card Content with Animation */}
          <div className="py-4 my-auto">
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0, rotateX: -20 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 20 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-900 text-sm sm:text-base font-bold text-center leading-relaxed"
                >
                  <QuestionMarkdown content={currentCard.front} />
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ opacity: 0, rotateX: 20 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-800 text-xs sm:text-sm font-medium text-center leading-relaxed font-sans"
                >
                  <QuestionMarkdown content={currentCard.back} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tags & Audio */}
          <div className="flex items-center justify-between pt-2 border-t border-indigo-50/80">
            <div className="flex flex-wrap gap-1">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md"
                >
                  {t}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak(isFlipped ? currentCard.back : currentCard.front);
              }}
              className="h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Read card"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Navigation Footer */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handlePrev}
            disabled={cards.length <= 1}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Prev</span>
          </button>

          {/* Card Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {cards.slice(0, 10).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentIndex
                    ? "w-4 bg-indigo-600"
                    : "w-1.5 bg-slate-200",
                )}
              />
            ))}
            {cards.length > 10 && (
              <span className="text-[10px] text-slate-400">+{cards.length - 10}</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={cards.length <= 1}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── WALKTHROUGH ARTIFACT ────────────────────────────────────────────────────

interface WalkthroughCardProps {
  payload: {
    title?: string;
    type?: "full" | "mini" | string;
    goalTitle?: string;
    sessionSummary?: string;
    mastered?: string[];
    gaps?: string[];
    recommendations?: string[];
    nextSteps?: string[];
  };
  resolved: boolean;
}

function WalkthroughCard({ payload, resolved }: WalkthroughCardProps) {
  const {
    title = "Session Walkthrough",
    type = "full",
    sessionSummary,
    mastered = [],
    gaps = [],
    recommendations = [],
    nextSteps = [],
  } = payload;

  const [activeTab, setActiveTab] = useState<"summary" | "mastered" | "gaps" | "next">("summary");

  return (
    <CardWrapper
      resolved={resolved}
      icon={<Award className="h-4 w-4 text-emerald-600" />}
      label="Session Walkthrough"
      badge={type === "full" ? "Comprehensive Signoff" : "Milestone Review"}
      className="bg-linear-to-b from-white via-white to-emerald-50/20 border-emerald-100/90"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-950">
            {title}
          </h3>
          {payload.goalTitle && (
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">
              Goal: {payload.goalTitle}
            </p>
          )}
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0",
              activeTab === "summary"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            Summary
          </button>
          {mastered.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("mastered")}
              className={cn(
                "px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0",
                activeTab === "mastered"
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-700 hover:bg-emerald-50",
              )}
            >
              <span>Mastered</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {mastered.length}
              </span>
            </button>
          )}
          {gaps.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("gaps")}
              className={cn(
                "px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0",
                activeTab === "gaps"
                  ? "bg-amber-600 text-white"
                  : "text-amber-700 hover:bg-amber-50",
              )}
            >
              <span>Knowledge Gaps</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {gaps.length}
              </span>
            </button>
          )}
          {nextSteps.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("next")}
              className={cn(
                "px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0",
                activeTab === "next"
                  ? "bg-indigo-600 text-white"
                  : "text-indigo-700 hover:bg-indigo-50",
              )}
            >
              Next Steps
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="pt-1 text-xs leading-relaxed text-slate-700">
          {activeTab === "summary" && sessionSummary && (
            <div className="space-y-3">
              <p className="font-serif sm:text-[13px] leading-relaxed text-slate-800 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
                {sessionSummary}
              </p>
              {recommendations.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">
                    Recommendations
                  </span>
                  <ul className="space-y-1.5">
                    {recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "mastered" && (
            <ul className="space-y-2">
              {mastered.map((m, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-emerald-950">{m}</span>
                </li>
              ))}
            </ul>
          )}

          {activeTab === "gaps" && (
            <ul className="space-y-2">
              {gaps.map((g, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100"
                >
                  <Target className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-amber-950">{g}</span>
                </li>
              ))}
            </ul>
          )}

          {activeTab === "next" && (
            <ul className="space-y-2">
              {nextSteps.map((n, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100"
                >
                  <ArrowRight className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-indigo-950">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── VERIFICATION ARTIFACT ───────────────────────────────────────────────────

interface VerificationCardProps {
  payload: {
    method?: "quiz" | "teachback" | "both" | string;
    teachbackPrompt?: string;
    studentResponse?: string;
    passed?: boolean;
    feedback?: string;
    score?: number;
  };
  resolved: boolean;
  onSubmitAnswer?: (answers: string[], questions?: string[]) => void;
  onContinue?: () => void;
}

function VerificationCard({
  payload,
  resolved,
  onSubmitAnswer = () => {},
  onContinue = () => {},
}: VerificationCardProps) {
  const {
    method = "teachback",
    teachbackPrompt = "Explain what you've learned in your own words.",
    studentResponse = "",
    passed = false,
    feedback = "",
    score,
  } = payload;

  const [response, setResponse] = useState(studentResponse);
  const [submitted, setSubmitted] = useState(Boolean(studentResponse || resolved));

  const handleTeachbackSubmit = () => {
    if (!response.trim()) return;
    setSubmitted(true);
    onSubmitAnswer([response.trim()], [teachbackPrompt]);
  };

  return (
    <CardWrapper
      resolved={resolved}
      icon={<GraduationCap className="h-4 w-4 text-[#0C60FC]" />}
      label="Concept Mastery Verification"
      badge={passed ? "Passed" : submitted ? "Pending Review" : "Active Check"}
      className={cn(
        passed && "border-emerald-200 bg-emerald-50/30",
        !passed && submitted && "border-blue-200 bg-blue-50/20",
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
            {method === "both"
              ? "Comprehensive Teachback & Knowledge Verification"
              : method === "quiz"
              ? "Verification Quiz Challenge"
              : "Teachback Mastery Check"}
          </h4>
          {typeof score === "number" && (
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
              Score: {score}%
            </span>
          )}
        </div>

        {teachbackPrompt && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">
              Verification Prompt:
            </span>
            <QuestionMarkdown content={teachbackPrompt} />
          </div>
        )}

        {submitted ? (
          <div className="space-y-2 pt-1">
            {response && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">
                  Your Teachback Response:
                </span>
                <p className="leading-relaxed font-sans">{response}</p>
              </div>
            )}
            {feedback && (
              <div
                className={cn(
                  "p-3.5 rounded-xl border text-xs leading-relaxed",
                  passed
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-blue-50 border-blue-200 text-blue-900",
                )}
              >
                <span className="font-bold block mb-0.5">Evaluation Feedback:</span>
                <p>{feedback}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Explain the concepts clearly in your own words to prove your understanding..."
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:outline-none transition shadow-2xs"
            />
            <div className="flex justify-end gap-2">
              <ActionButton
                onClick={handleTeachbackSubmit}
                disabled={!response.trim()}
                variant="primary"
              >
                <span>Submit Teachback</span>
                <Send className="h-3.5 w-3.5" />
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </CardWrapper>
  );
}

// ─── SHOW_QUIZ / QUIZ ARTIFACT ───────────────────────────────────────────────

interface ShowQuizCardProps {
  payload: any;
  resolved: boolean;
  onSubmitAnswer: (answers: string[], questions?: string[]) => void;
  onSkip: () => void;
}

function extractAllQuizQuestions(payload: any): any[] {
  if (Array.isArray(payload.questions) && payload.questions.length > 0) {
    return payload.questions;
  }
  if (Array.isArray(payload.lectures)) {
    const extracted: any[] = [];
    payload.lectures.forEach((lec: any) => {
      (lec.topics || []).forEach((top: any) => {
        (top.questions || []).forEach((q: any) => {
          extracted.push(q);
        });
      });
    });
    if (extracted.length > 0) return extracted;
  }
  return [];
}

function ShowQuizCard({
  payload,
  resolved,
  onSubmitAnswer,
  onSkip,
}: ShowQuizCardProps) {
  const questions = extractAllQuizQuestions(payload);
  const persistedAnswers =
    payload.userAnswers || payload.answers || [];

  const [answers, setAnswers] = useState<string[]>(
    questions.map((_, i) => persistedAnswers[i] || ""),
  );
  const submittedRef = useRef<string[]>(persistedAnswers);

  const handleOptionSelect = (qIdx: number, opt: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = opt;
      return next;
    });
  };

  const handleTextChange = (qIdx: number, val: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = val;
      return next;
    });
  };

  const allAnswered =
    answers.length > 0 && answers.every((a) => a && a.trim().length > 0);

  const handleSubmit = () => {
    if (!allAnswered) return;
    submittedRef.current = [...answers];
    onSubmitAnswer(
      answers,
      questions.map((q) => q.question || q.text || ""),
    );
  };

  if (
    resolved ||
    (persistedAnswers.length > 0 &&
      persistedAnswers.some((a: string) => a && a.trim().length > 0))
  ) {
    return (
      <QAResolvedCard
        entries={questions.map((q, i) => ({
          question: q.question || q.text || "",
          answer: submittedRef.current[i] || persistedAnswers[i] || "—",
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }))}
      />
    );
  }

  if (questions.length === 0) return null;

  return (
    <CardWrapper
      resolved={resolved}
      icon={<Sparkles className="h-4 w-4 text-[#0C60FC]" />}
      label="Quiz Challenge"
      badge={`${questions.length} Question${questions.length > 1 ? "s" : ""}`}
    >
      <div className="space-y-5 divide-y divide-slate-100">
        {questions.map((q, qIdx) => {
          const qText = q.question || q.text || `Question ${qIdx + 1}`;
          const rawOpts: any[] = Array.isArray(q.options) ? q.options : [];
          const opts = rawOpts.map(normalizeOptionText);

          return (
            <div key={qIdx} className="pt-4 first:pt-0 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-extrabold text-[#0C60FC]">
                  Question {qIdx + 1}
                </span>
                <QuestionMarkdown
                  content={qText}
                  className="text-xs sm:text-sm font-bold text-slate-900 leading-snug"
                />
              </div>

              {opts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {opts.map((opt, oIdx) => {
                    const isSelected = answers[qIdx] === opt;
                    const letter = String.fromCharCode(65 + oIdx);
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleOptionSelect(qIdx, opt)}
                        className={cn(
                          "text-left rounded-xl p-3 text-xs font-semibold transition-all border flex items-center gap-2.5 cursor-pointer",
                          isSelected
                            ? "border-[#0C60FC] bg-blue-50 text-[#0C60FC] ring-2 ring-blue-500/20"
                            : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-white",
                        )}
                      >
                        <span
                          className={cn(
                            "h-5 w-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0",
                            isSelected
                              ? "bg-[#0C60FC] text-white"
                              : "bg-white text-slate-500 border border-slate-200",
                          )}
                        >
                          {letter}
                        </span>
                        <span className="truncate">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[qIdx] || ""}
                  onChange={(e) => handleTextChange(qIdx, e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#0C60FC]"
                />
              )}

              {q.hint && (
                <p className="text-[11px] text-amber-700 italic">
                  💡 Hint: {q.hint}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <ActionButton onClick={onSkip} variant="ghost">
          Skip
        </ActionButton>
        <ActionButton
          onClick={handleSubmit}
          disabled={!allAnswered}
          variant="primary"
        >
          <span>Complete Quiz</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </ActionButton>
      </div>
    </CardWrapper>
  );
}

// ─── SHOW_PLAN / STUDY PLAN ARTIFACT ─────────────────────────────────────────

interface ShowPlanCardProps {
  payload: any;
  resolved: boolean;
  onApprove: () => void;
  onSkip: () => void;
}

function ShowPlanCard({
  payload,
  resolved,
  onApprove,
  onSkip,
}: ShowPlanCardProps) {
  const title = payload.title || payload.goal || "Structured Study Plan";
  const rawSteps = payload.steps || payload.chapters?.[0]?.steps || [];

  const pathwayItems: KnowledgeBlockItem[] = rawSteps.map((step: any, idx: number) => ({
    id: step.stepId || step.id || String(idx),
    title: step.title,
    status:
      step.status === "completed" || step.isCompleted
        ? "completed"
        : step.status === "active" || idx === 0
        ? "current"
        : "upcoming",
    description: step.description || step.coreIdea,
  }));

  return (
    <CardWrapper
      resolved={resolved}
      icon={<ClipboardList className="h-4 w-4 text-emerald-600" />}
      label="Structured Study Plan"
      badge={`${pathwayItems.length} Topics`}
    >
      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-black text-slate-950">
          {title}
        </h3>
        <p className="text-xs text-slate-500">
          Here is the suggested learning pathway tailored for your session:
        </p>
      </div>

      <KnowledgePathway items={pathwayItems} compact />

      {!resolved && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <ActionButton onClick={onSkip} variant="ghost">
            Adjust plan
          </ActionButton>
          <ActionButton onClick={onApprove} variant="primary">
            <span>Approve &amp; Start</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </ActionButton>
        </div>
      )}
    </CardWrapper>
  );
}

// ─── UNLOCK_TOPIC ────────────────────────────────────────────────────────────

interface UnlockTopicCardProps {
  payload: ZUnlockTopicPayload;
  resolved: boolean;
}

function UnlockTopicCard({ payload, resolved }: UnlockTopicCardProps) {
  const { topicTitle, description } = payload;

  return (
    <CardWrapper
      resolved={resolved}
      icon={<Unlock className="h-4 w-4 text-emerald-600" />}
      label="Milestone Completed"
      className="bg-emerald-50/40 border-emerald-200"
    >
      <div className="flex items-center gap-3 py-1">
        <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
          <Check className="h-5 w-5 stroke-[2.5]" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
            {topicTitle}
          </h4>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── SHOW_RESULT ─────────────────────────────────────────────────────────────

interface ShowResultCardProps {
  payload: ZShowResultPayload;
  resolved: boolean;
}

function ShowResultCard({ payload, resolved }: ShowResultCardProps) {
  const { score = 0, total = 1, message, topicTitle } = payload;
  const pct = Math.round((score / Math.max(total, 1)) * 100);
  const passed = pct >= 70;

  return (
    <CardWrapper
      resolved={resolved}
      icon={<Trophy className="h-4 w-4 text-amber-500" />}
      label="Quiz Results"
      badge={topicTitle}
    >
      <div className="flex items-center gap-4 py-2">
        <div
          className={cn(
            "h-16 w-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm border",
            passed
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700",
          )}
        >
          <span className="text-xl font-black">{pct}%</span>
          <span className="text-[10px] font-extrabold uppercase">
            {score}/{total}
          </span>
        </div>

        <div className="space-y-1 flex-1">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
            {passed ? "Great understanding!" : "Keep practicing!"}
          </h4>
          {message && (
            <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── SHOW_SUGGESTION ─────────────────────────────────────────────────────────

interface ShowSuggestionCardProps {
  payload: ZShowSuggestionPayload;
  resolved: boolean;
  onExplainDifferently: (topic: string) => void;
  onTestMe: (topic: string) => void;
  onTryMyself: (topic: string) => void;
  onAction: (action: string) => void;
}

function ShowSuggestionCard({
  payload,
  resolved,
  onExplainDifferently,
  onTestMe,
  onTryMyself,
  onAction,
}: ShowSuggestionCardProps) {
  const { topicTitle, suggestions } = payload;

  if (resolved) return null;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-wrap items-center justify-center gap-2 py-3">
      {suggestions?.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onAction(s.actionType || s.label)}
          className="rounded-full bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition-all hover:scale-102 cursor-pointer flex items-center gap-1.5"
        >
          <span>{s.label}</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
        </button>
      ))}

      {!suggestions && topicTitle && (
        <>
          <button
            type="button"
            onClick={() => onExplainDifferently(topicTitle)}
            className="rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition cursor-pointer"
          >
            Explain differently
          </button>
          <button
            type="button"
            onClick={() => onTestMe(topicTitle)}
            className="rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition cursor-pointer"
          >
            Test me
          </button>
          <button
            type="button"
            onClick={() => onTryMyself(topicTitle)}
            className="rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition cursor-pointer"
          >
            I&apos;ll try myself
          </button>
        </>
      )}
    </div>
  );
}

// ─── SHOW_EXPOSITION / LESSON ARTIFACT ───────────────────────────────────────

interface ShowExpositionCardProps {
  payload: any;
  resolved: boolean;
  onOpenSource?: (materialId: string, pageNumber?: number) => void;
  onFeedback?: (type: "too_easy" | "too_hard") => void;
  onContinue?: () => void;
}

function ShowExpositionCard({
  payload,
  resolved,
  onOpenSource,
  onFeedback,
  onContinue = () => {},
}: ShowExpositionCardProps) {
  // Extract text content from various backend formats
  const rawMarkdown =
    payload.markdown ||
    payload.body ||
    payload.content ||
    payload.text ||
    payload.explanation ||
    (Array.isArray(payload.sections)
      ? payload.sections.map((s: any) => s.content || s.body || "").join("\n\n")
      : "") ||
    "";

  const title = payload.topicTitle || payload.title || "Concept Exposition";
  const initialCitations = Array.isArray(payload.citations)
    ? payload.citations
    : payload.citation
    ? [payload.citation]
    : [];

  const SOURCE_REGEX = /\s*\((?:Source|Ref):\s*([^,)]+)(?:,\s*Chapter\s*[^,)]+)?(?:,\s*p(?:p)?\.?\s*(\d+))?.*?\)\s*$/im;

  let parsedCitations = [...initialCitations];
  let markdownText = rawMarkdown;

  const match = rawMarkdown.match(SOURCE_REGEX);
  if (match) {
    markdownText = rawMarkdown.replace(SOURCE_REGEX, "").trim();
    if (parsedCitations.length === 0) {
      const docName = match[1]?.trim() || "Source Document";
      const pageNum = match[2] ? parseInt(match[2], 10) : undefined;
      parsedCitations.push({
        filename: docName,
        pageNumber: pageNum,
      });
    }
  }

  // Extract inline bracket citations like [20] if no citations exist yet
  const bracketMatches = Array.from(markdownText.matchAll(/\[(\d+)\]/g));
  if (bracketMatches.length > 0 && parsedCitations.length === 0) {
    const firstMatch = bracketMatches[0] as unknown as RegExpMatchArray;
    const pageNum = parseInt(firstMatch[1], 10);
    parsedCitations.push({
      filename: "Source Material",
      pageNumber: pageNum,
    });
  }
  // Strip all inline numeric bracket citations from the rendered prose
  markdownText = markdownText.replace(/\s*\[\d+\]/g, "").trim();

  return (
    <CardWrapper
      resolved={resolved}
      icon={<AlignLeft className="h-3.5 w-3.5 text-[#0C60FC]" />}
      label="Concept Exposition"
      badge={title}
    >
      <div className="space-y-3">
        {title && title !== "Concept Exposition" && (
          <h3 className="text-sm sm:text-base font-extrabold text-slate-950">
            {title}
          </h3>
        )}

        <div className="text-xs sm:text-[13px] leading-relaxed space-y-2.5 font-serif text-slate-900 prose prose-slate max-w-none">
          <QuestionMarkdown content={markdownText} />
        </div>

        {/* Citations list */}
        {parsedCitations.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-100">
            {parsedCitations.map((c: any, i: number) => {
              const filename = c.filename || "Study Material";
              const pageNumber = c.pageNumber || c.page;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onOpenSource?.(c.materialId, pageNumber)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 px-3 py-1 text-[11px] font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
                >
                  <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate max-w-36">
                    {filename.replace(/\.pdf$/i, "")}
                  </span>
                  {pageNumber && (
                    <span className="text-slate-400 font-normal">Page {pageNumber}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Audio & Action */}
        <div className="pt-1 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleSpeak(markdownText)}
            className="flex h-6.5 w-6.5 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Read aloud"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>

          {!resolved && (
            <ActionButton onClick={onContinue} variant="primary">
              <span>Got it, continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </ActionButton>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── SHOW_SUMMARY / RECAP ARTIFACT ───────────────────────────────────────────

interface ShowSummaryCardProps {
  payload: ZShowSummaryPayload;
  resolved: boolean;
}

function ShowSummaryCard({ payload, resolved }: ShowSummaryCardProps) {
  const { topicTitle = "Session Summary", content, keyPoints } = payload;

  return (
    <CardWrapper
      resolved={resolved}
      icon={<Lightbulb className="h-4 w-4 text-amber-500" />}
      label="Concept Recap"
      badge={topicTitle}
    >
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-black text-slate-950">
          {topicTitle}
        </h3>

        {content && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {content}
          </p>
        )}

        {keyPoints && keyPoints.length > 0 && (
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pt-1">
            {keyPoints.map((k: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{k}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CardWrapper>
  );
}

// ─── NOTES ARTIFACT ──────────────────────────────────────────────────────────

function NotesArtifactCard({ payload, resolved }: { payload: any; resolved: boolean }) {
  const sections = Array.isArray(payload.sections) ? payload.sections : [];

  return (
    <CardWrapper
      resolved={resolved}
      icon={<BookMarked className="h-4 w-4 text-purple-600" />}
      label="Study Notes"
      badge={`${sections.length} Section${sections.length > 1 ? "s" : ""}`}
    >
      <div className="space-y-4">
        {payload.title && (
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
            {payload.title}
          </h3>
        )}
        <div className="space-y-3 divide-y divide-slate-100">
          {sections.map((sec: any, i: number) => (
            <div key={i} className="pt-3 first:pt-0 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {sec.title}
              </h4>
              <div className="text-xs text-slate-700 leading-relaxed font-sans">
                <QuestionMarkdown content={sec.body || sec.content || ""} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── POMODORO ────────────────────────────────────────────────────────────────

type PomodoroPhase = "work" | "short_break" | "long_break" | "done";

interface PomodoroCardProps {
  payload: ZPomodoroPayload;
  resolved: boolean;
  onResume: () => void;
}

function PomodoroCard({ payload, resolved, onResume }: PomodoroCardProps) {
  const {
    topicTitle,
    workMinutes = 25,
    shortBreakMinutes = 5,
    longBreakMinutes = 15,
    intervalsBeforeLongBreak = 4,
    note,
  } = payload;

  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [interval, setInterval_] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [running, setRunning] = useState(!resolved);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phaseDuration = (p: PomodoroPhase) => {
    switch (p) {
      case "work":
        return workMinutes * 60;
      case "short_break":
        return shortBreakMinutes * 60;
      case "long_break":
        return longBreakMinutes * 60;
      case "done":
        return 0;
    }
  };

  useEffect(() => {
    if (!running) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }

    tickRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (phase === "work") {
            const nextPhase: PomodoroPhase =
              interval % intervalsBeforeLongBreak === 0
                ? "long_break"
                : "short_break";
            setPhase(nextPhase);
            return phaseDuration(nextPhase);
          } else {
            setInterval_((i) => i + 1);
            setPhase("work");
            return workMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running, phase, interval, workMinutes, intervalsBeforeLongBreak]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const phaseLabel = {
    work: "Focus Block",
    short_break: "Short Break",
    long_break: "Long Break",
    done: "Complete",
  }[phase];

  const phaseColor = {
    work: "text-blue-600 bg-blue-50 border-blue-200",
    short_break: "text-emerald-600 bg-emerald-50 border-emerald-200",
    long_break: "text-amber-600 bg-amber-50 border-amber-200",
    done: "text-slate-600 bg-slate-50 border-slate-200",
  }[phase];

  return (
    <CardWrapper
      resolved={resolved}
      icon={<Timer className="h-4 w-4 text-blue-600" />}
      label="Pomodoro Focus"
      badge={`Interval ${interval}`}
    >
      <div className="flex flex-col items-center justify-center py-4 space-y-3">
        <span
          className={cn(
            "text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border",
            phaseColor,
          )}
        >
          {phaseLabel}
        </span>

        <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 font-mono">
          {timeStr}
        </span>

        {topicTitle && (
          <p className="text-xs font-semibold text-slate-700 text-center">
            {topicTitle}
          </p>
        )}
        {note && <p className="text-xs italic text-slate-500 text-center">{note}</p>}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-100">
        <ActionButton onClick={() => setRunning((r) => !r)} variant="secondary">
          {running ? "Pause Timer" : "Resume Timer"}
        </ActionButton>
        <ActionButton onClick={onResume} variant="primary">
          <span>Done, Continue</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </ActionButton>
      </div>
    </CardWrapper>
  );
}


// ─── Public ArtifactCardCallbacks Interface ──────────────────────────────────

export interface ArtifactCardCallbacks {
  onSubmitAnswer?: (
    answers: string[],
    questions?: string[],
    artifactId?: string,
  ) => void;
  onApprove?: (artifactId?: string) => void;
  onContinue?: (artifactId?: string) => void;
  onRetry?: (artifactId?: string) => void;
  onSkip?: (artifactId?: string) => void;
  onExplainDifferently?: (topicTitle: string, artifactId?: string) => void;
  onTestMe?: (topicTitle: string, artifactId?: string) => void;
  onTryMyself?: (topicTitle: string, artifactId?: string) => void;
  onAction?: (actionType: string, artifactId?: string) => void;
  onPomodoroResume?: (artifactId?: string) => void;
  onOpenSource?: (materialId: string, pageNumber?: number) => void;
  onFeedback?: (type: "too_easy" | "too_hard", artifactId?: string) => void;
}

export interface ArtifactCardProps extends ArtifactCardCallbacks {
  artifact?: any;
  resolved?: boolean;
}

// ─── Main ArtifactCard Dispatcher ────────────────────────────────────────────

export function ArtifactCard({
  artifact,
  resolved = false,
  onSubmitAnswer = () => {},
  onApprove = () => {},
  onContinue = () => {},
  onRetry = () => {},
  onSkip = () => {},
  onExplainDifferently = () => {},
  onTestMe = () => {},
  onTryMyself = () => {},
  onAction = () => {},
  onPomodoroResume = () => {},
  onOpenSource,
  onFeedback,
}: ArtifactCardProps) {
  const currentArtifactId =
    artifact?.artifactId ||
    artifact?.id ||
    (artifact?.content as any)?.artifactId;

  const handleAnswer = (answers: string[], questions?: string[]) => {
    onSubmitAnswer(answers, questions, currentArtifactId);
  };
  const handleApprove = () => onApprove(currentArtifactId);
  const handleContinue = () => onContinue(currentArtifactId);
  const handleRetry = () => onRetry(currentArtifactId);
  const handleSkip = () => onSkip(currentArtifactId);
  const handleExplainDifferently = (topic: string) =>
    onExplainDifferently(topic, currentArtifactId);
  const handleTestMe = (topic: string) => onTestMe(topic, currentArtifactId);
  const handleTryMyself = (topic: string) =>
    onTryMyself(topic, currentArtifactId);
  const handleAction = (act: string) => onAction(act, currentArtifactId);
  const handlePomodoroResume = () => onPomodoroResume(currentArtifactId);
  const handleFeedback = (type: "too_easy" | "too_hard") =>
    onFeedback?.(type, currentArtifactId);

  // If artifact is provided, map it to the corresponding card view
  if (artifact) {
    const artType = String(artifact.type || "").toLowerCase();
    const content = artifact.content || {};

    // 1. Flashcard Set
    if (
      artType === "flashcard_set" ||
      artType === "flashcards" ||
      artType === "flashcard"
    ) {
      const payload = {
        title: artifact.title || content.title,
        cards: content.cards || (Array.isArray(content) ? content : []),
      };
      return (
        <FlashcardSetCard
          payload={payload}
          resolved={resolved}
          onContinue={handleContinue}
        />
      );
    }

    // 2. Walkthrough
    if (artType === "walkthrough" || artType === "mini_walkthrough") {
      const payload = {
        title: artifact.title || "Session Walkthrough",
        type: content.type || (artType === "mini_walkthrough" ? "mini" : "full"),
        goalTitle: content.goalTitle,
        sessionSummary: content.sessionSummary,
        mastered: content.mastered || [],
        gaps: content.gaps || [],
        recommendations: content.recommendations || [],
        nextSteps: content.nextSteps || [],
      };
      return <WalkthroughCard payload={payload} resolved={resolved} />;
    }

    // 3. Verification
    if (artType === "verification") {
      const payload = {
        method: content.method || "teachback",
        teachbackPrompt: content.teachbackPrompt,
        studentResponse: content.studentResponse,
        passed: Boolean(content.passed),
        feedback: content.feedback,
        score: content.score,
      };
      return (
        <VerificationCard
          payload={payload}
          resolved={resolved}
          onSubmitAnswer={handleAnswer}
          onContinue={handleContinue}
        />
      );
    }

    // 4. Exposition / Lesson
    if (artType === "exposition" || artType === "lesson") {
      const payload: any = {
        title: artifact.title || content.title || content.topicTitle || "Concept Exposition",
        markdown:
          content.markdown ||
          content.body ||
          content.explanation ||
          (content.sections && Array.isArray(content.sections)
            ? content.sections.map((s: any) => s.content || s.body || "").join("\n\n")
            : "") ||
          (typeof content === "string" ? content : ""),
        citations: content.citations || (content.citation ? [content.citation] : []),
        topicTitle: artifact.title || content.topicTitle,
      };
      return (
        <ShowExpositionCard
          payload={payload}
          resolved={resolved}
          onOpenSource={onOpenSource}
          onFeedback={handleFeedback}
          onContinue={handleContinue}
        />
      );
    }

    // 5. Concept Check Question
    if (artType === "question" || artType === "ask_question") {
      const isCardResolved = Boolean(
        artifact.resolved ||
        content.resolved ||
        content.status === "completed" ||
        content.userAnswer ||
        content.submittedAnswer ||
        content.selectedOption ||
        (Array.isArray(content.userAnswers) && content.userAnswers.length > 0) ||
        resolved,
      );

      const payload: any = {
        title: artifact.title || content.title || "Knowledge Check",
        question: content.question || content.text || content.prompt || artifact.title,
        options: content.options || [],
        correctAnswer: content.correctAnswer || content.solution || content.answer,
        explanation: content.explanation,
        hint: content.hint,
        topicTitle: artifact.title || content.topicTitle,
        userAnswer:
          content.userAnswer ||
          content.submittedAnswer ||
          content.selectedOption ||
          (Array.isArray(content.userAnswers) && content.userAnswers[0]) ||
          undefined,
        userAnswers: content.userAnswers || undefined,
        selectedOption: content.selectedOption || undefined,
        submittedAnswer: content.submittedAnswer || undefined,
        resolved: isCardResolved,
      };
      return (
        <AskQuestionCard
          payload={payload}
          resolved={isCardResolved}
          onSubmitAnswer={handleAnswer}
          onRetry={handleRetry}
          onSkip={handleSkip}
        />
      );
    }

    // 6. Quiz Challenge
    if (artType === "quiz") {
      const isQuizResolved = Boolean(
        artifact.resolved ||
        content.resolved ||
        content.status === "completed" ||
        (Array.isArray(content.userAnswers) && content.userAnswers.length > 0) ||
        resolved,
      );
      const payload: any = content.questions || content.lectures ? content : { questions: [content] };
      return (
        <ShowQuizCard
          payload={payload}
          resolved={isQuizResolved}
          onSubmitAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      );
    }

    // 7. Study Notes
    if (artType === "notes") {
      return (
        <NotesArtifactCard
          payload={{ title: artifact.title, sections: content.sections || [] }}
          resolved={resolved}
        />
      );
    }

    // 8. Recap / Summary
    if (artType === "summary" || artType === "recap") {
      const payload: any = {
        topicTitle: artifact.title || content.topicTitle || "Concept Recap",
        content: content.content || content.summary || (typeof content === "string" ? content : ""),
        keyPoints: content.keyPoints || content.keyTakeaways || [],
      };
      return <ShowSummaryCard payload={payload} resolved={resolved} />;
    }

    // 9. Study Plan
    if (artType === "study_plan") {
      const payload: any = content.chapters ? content : { steps: content.steps || [] };
      return (
        <ShowPlanCard
          payload={payload}
          resolved={resolved}
          onApprove={handleApprove}
          onSkip={handleSkip}
        />
      );
    }
  }

  return null;
}
