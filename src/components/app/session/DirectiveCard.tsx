"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
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
  ZDirective,
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
  variant?: "primary" | "secondary" | "danger" | "ghost";
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
        resolved && "opacity-60 bg-slate-50/70 shadow-none border-slate-200/60",
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
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
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

// ─── Q:A Resolved Display ───────────────────────────────────────────────────

interface QAEntryProps {
  question: string;
  answer: string;
}

function QAResolvedCard({ entries }: { entries: QAEntryProps[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-xl mx-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs divide-y divide-slate-200/60 space-y-3"
    >
      {entries.map((e, i) => (
        <div key={i} className="pt-2 first:pt-0 space-y-1.5">
          <div className="flex items-start gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
              Q:
            </span>
            <div className="text-slate-700 font-medium leading-relaxed">
              <QuestionMarkdown content={e.question} />
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white rounded-xl p-2.5 border border-slate-200/70">
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mt-0.5">
              A:
            </span>
            <p className="text-slate-900 font-bold leading-relaxed">{e.answer || "—"}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ─── True / False Helper Check ───────────────────────────────────────────────

function isTrueFalseOptions(options?: string[]): boolean {
  if (!options || options.length !== 2) return false;
  const lower = options.map((o) => o.trim().toLowerCase());
  return (
    (lower.includes("true") && lower.includes("false")) ||
    (lower.includes("yes") && lower.includes("no"))
  );
}

// ─── ASK_QUESTION ────────────────────────────────────────────────────────────

interface AskQuestionCardProps {
  payload: ZAskQuestionPayload;
  resolved: boolean;
  onSubmitAnswer: (answers: string[], questions?: string[]) => void;
  onRetry: () => void;
  onSkip: () => void;
}

function AskQuestionCard({
  payload,
  resolved,
  onSubmitAnswer,
  onRetry,
  onSkip,
}: AskQuestionCardProps) {
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const submittedAnswerRef = useRef<string>("");

  const isTF = isTrueFalseOptions(payload.options);

  const handleSubmit = (choice?: string) => {
    const ans = choice ?? (payload.options ? selectedOption : textAnswer.trim());
    if (ans) {
      submittedAnswerRef.current = ans;
      onSubmitAnswer([ans], [payload.question]);
    }
  };

  if (resolved) {
    return (
      <QAResolvedCard
        entries={[
          {
            question: payload.question,
            answer: submittedAnswerRef.current || "—",
          },
        ]}
      />
    );
  }

  // Specialized True / False Card View
  if (isTF && payload.options) {
    const falseOpt = payload.options.find((o) =>
      ["false", "no"].includes(o.trim().toLowerCase())
    ) || payload.options[1];
    const trueOpt = payload.options.find((o) =>
      ["true", "yes"].includes(o.trim().toLowerCase())
    ) || payload.options[0];

    return (
      <CardWrapper
        resolved={resolved}
        icon={<HelpCircle className="h-4 w-4 text-[#0C60FC]" />}
        label="True / False"
      >
        <div className="py-2">
          <QuestionMarkdown
            content={payload.question}
            className="text-base sm:text-lg font-bold text-slate-900 leading-snug"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit(falseOpt)}
            className="rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 p-4 flex items-center justify-center gap-2 text-sm font-bold text-slate-800 shadow-xs transition-all cursor-pointer"
          >
            <span>👎</span>
            <span>{falseOpt}</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit(trueOpt)}
            className="rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 p-4 flex items-center justify-center gap-2 text-sm font-bold text-slate-800 shadow-xs transition-all cursor-pointer"
          >
            <span>👍</span>
            <span>{trueOpt}</span>
          </motion.button>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      resolved={resolved}
      icon={<HelpCircle className="h-4 w-4 text-[#0C60FC]" />}
      label="Concept Check"
    >
      <div className="py-1">
        <QuestionMarkdown
          content={payload.question}
          className="text-sm sm:text-base font-bold text-slate-900 leading-snug"
        />
      </div>

      {payload.options ? (
        <div className="flex flex-col gap-2 pt-2">
          {payload.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const letter = String.fromCharCode(65 + i);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSelectedOption(opt)}
                className={cn(
                  "w-full text-left rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm font-semibold transition-all border flex items-center gap-3 cursor-pointer shadow-xs",
                  isSelected
                    ? "border-[#0C60FC] bg-blue-50/70 text-[#0C60FC] ring-2 ring-blue-500/20"
                    : "border-slate-200/80 bg-slate-50/50 text-slate-700 hover:bg-white hover:border-slate-300"
                )}
              >
                <span
                  className={cn(
                    "h-6 w-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                      ? "bg-[#0C60FC] text-white"
                      : "bg-white text-slate-500 border border-slate-200"
                  )}
                >
                  {letter}
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="pt-2">
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Type your explanation or answer here…"
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <ActionButton onClick={onSkip} variant="ghost">
          Skip
        </ActionButton>
        <ActionButton
          onClick={() => handleSubmit()}
          disabled={payload.options ? !selectedOption : !textAnswer.trim()}
          variant="primary"
        >
          <span>Submit answer</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </ActionButton>
      </div>
    </CardWrapper>
  );
}

// ─── ASK_QUESTIONS ───────────────────────────────────────────────────────────

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
  const [answers, setAnswers] = useState<string[]>(
    payload.questions.map(() => ""),
  );
  const submittedRef = useRef<string[]>([]);

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

  const allAnswered = answers.every((a) => a.trim().length > 0);

  const handleSubmit = () => {
    if (!allAnswered) return;
    submittedRef.current = [...answers];
    onSubmitAnswer(
      answers,
      payload.questions.map((q) => q.question),
    );
  };

  if (resolved) {
    return (
      <QAResolvedCard
        entries={payload.questions.map((q, i) => ({
          question: q.question,
          answer: submittedRef.current[i] || "—",
        }))}
      />
    );
  }

  return (
    <CardWrapper
      resolved={resolved}
      icon={<ClipboardList className="h-4 w-4 text-[#0C60FC]" />}
      label="Practice Set"
      badge={`${payload.questions.length} Questions`}
    >
      <div className="space-y-5 divide-y divide-slate-100">
        {payload.questions.map((q, idx) => (
          <div key={idx} className="pt-4 first:pt-0 space-y-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-extrabold text-[#0C60FC]">
                #{idx + 1}
              </span>
              <QuestionMarkdown
                content={q.question}
                className="text-xs sm:text-sm font-bold text-slate-900 leading-snug"
              />
            </div>

            {q.options ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = answers[idx] === opt;
                  const letter = String.fromCharCode(65 + optIdx);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleOptionSelect(idx, opt)}
                      className={cn(
                        "text-left rounded-xl p-3 text-xs font-semibold transition-all border flex items-center gap-2.5 cursor-pointer",
                        isSelected
                          ? "border-[#0C60FC] bg-blue-50 text-[#0C60FC]"
                          : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-white"
                      )}
                    >
                      <span
                        className={cn(
                          "h-5 w-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0",
                          isSelected
                            ? "bg-[#0C60FC] text-white"
                            : "bg-white text-slate-500 border border-slate-200"
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
        ))}
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

// ─── SHOW_QUIZ ───────────────────────────────────────────────────────────────

interface ShowQuizCardProps {
  payload: ZShowQuizPayload;
  resolved: boolean;
  onSubmitAnswer: (answers: string[], questions?: string[]) => void;
  onSkip: () => void;
}

function ShowQuizCard({
  payload,
  resolved,
  onSubmitAnswer,
  onSkip,
}: ShowQuizCardProps) {
  const { questions } = payload;
  const [answers, setAnswers] = useState<string[]>(questions.map(() => ""));
  const submittedRef = useRef<string[]>([]);

  const handleOptionSelect = (qIdx: number, opt: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = opt;
      return next;
    });
  };

  const allAnswered = answers.every((a) => a.trim().length > 0);

  const handleSubmit = () => {
    if (!allAnswered) return;
    submittedRef.current = [...answers];
    onSubmitAnswer(
      answers,
      questions.map((q) => q.question),
    );
  };

  if (resolved) {
    return (
      <QAResolvedCard
        entries={questions.map((q, i) => ({
          question: q.question,
          answer: submittedRef.current[i] || "—",
        }))}
      />
    );
  }

  return (
    <CardWrapper
      resolved={resolved}
      icon={<Sparkles className="h-4 w-4 text-[#0C60FC]" />}
      label="Quiz Challenge"
      badge={`${questions.length} Questions`}
    >
      <div className="space-y-5 divide-y divide-slate-100">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="pt-4 first:pt-0 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-extrabold text-[#0C60FC]">
                Question {qIdx + 1}
              </span>
              <QuestionMarkdown
                content={q.question}
                className="text-xs sm:text-sm font-bold text-slate-900 leading-snug"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oIdx) => {
                const isSelected = answers[qIdx] === opt;
                const letter = String.fromCharCode(65 + oIdx);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleOptionSelect(qIdx, opt)}
                    className={cn(
                      "text-left rounded-xl p-3 text-xs font-semibold transition-all border flex items-center gap-2.5 cursor-pointer",
                      isSelected
                        ? "border-[#0C60FC] bg-blue-50 text-[#0C60FC] ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-white"
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-[#0C60FC] text-white"
                          : "bg-white text-slate-500 border border-slate-200"
                      )}
                    >
                      {letter}
                    </span>
                    <span className="truncate">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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

// ─── SHOW_PLAN ───────────────────────────────────────────────────────────────

interface ShowPlanCardProps {
  payload: ZShowPlanPayload;
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
  const { title = "Structured Study Plan", steps = [] } = payload;

  const pathwayItems: KnowledgeBlockItem[] = steps.map((step, idx) => ({
    id: step.id || String(idx),
    title: step.title,
    status:
      step.status === "completed"
        ? "completed"
        : step.status === "active" || idx === 0
        ? "current"
        : "upcoming",
    description: step.description,
  }));

  return (
    <CardWrapper
      resolved={resolved}
      icon={<ClipboardList className="h-4 w-4 text-emerald-600" />}
      label="Structured Study Plan"
      badge={`${steps.length} Steps`}
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
            <p className="text-xs text-slate-500 mt-0.5">
              {description}
            </p>
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
              : "bg-rose-50 border-rose-200 text-rose-700"
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

// ─── SHOW_SUMMARY ────────────────────────────────────────────────────────────

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
      label="Session Recap"
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
    workMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    intervalsBeforeLongBreak,
    note,
  } = payload;

  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [interval, setInterval_] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [running, setRunning] = useState(!resolved);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phaseDuration = (p: PomodoroPhase) => {
    if (p === "work") return workMinutes * 60;
    if (p === "short_break") return shortBreakMinutes * 60;
    if (p === "long_break") return longBreakMinutes * 60;
    return 0;
  };

  useEffect(() => {
    if (!running || phase === "done") return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhase((prev) => {
            if (prev === "work") {
              const nextInterval = interval + 1;
              const isLong = nextInterval > intervalsBeforeLongBreak;
              if (isLong) {
                setInterval_(1);
                setSecondsLeft(longBreakMinutes * 60);
                return "long_break";
              } else {
                setInterval_(nextInterval);
                setSecondsLeft(shortBreakMinutes * 60);
                return "short_break";
              }
            }
            setSecondsLeft(workMinutes * 60);
            return "work";
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [
    running,
    phase,
    interval,
    workMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    intervalsBeforeLongBreak,
  ]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const total = phaseDuration(phase) || 1;
  const progress = ((total - secondsLeft) / total) * 100;

  const isBreak = phase === "short_break" || phase === "long_break";

  return (
    <CardWrapper
      resolved={resolved}
      icon={<Timer className="h-4 w-4 text-[#0C60FC]" />}
      label={`Pomodoro Focus · ${topicTitle}`}
    >
      <div className="py-6 flex flex-col items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black tabular-nums tracking-tight text-slate-900 leading-none">
          {mm}:{ss}
        </span>

        {/* Progress line */}
        <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isBreak ? "bg-emerald-500" : "bg-[#0C60FC]"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          {isBreak ? "Break Time" : `Focus Round ${interval} of ${intervalsBeforeLongBreak}`}
        </p>

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

// ─── UNKNOWN DIRECTIVE ───────────────────────────────────────────────────────

function UnknownDirectiveCard({
  type,
  payload,
  resolved,
  onContinue,
}: {
  type: string;
  payload: unknown;
  resolved: boolean;
  onContinue: () => void;
}) {
  return (
    <CardWrapper
      resolved={resolved}
      icon={<HelpCircle className="h-4 w-4 text-slate-400" />}
      label={`Action: ${type}`}
    >
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 overflow-auto max-h-36 text-[11px] font-mono text-slate-600">
        <pre>{JSON.stringify(payload, null, 2)}</pre>
      </div>

      {!resolved && (
        <ActionButton onClick={onContinue} variant="primary">
          Got it
        </ActionButton>
      )}
    </CardWrapper>
  );
}

// ─── Public DirectiveCardCallbacks Interface ─────────────────────────────────

export interface DirectiveCardCallbacks {
  onSubmitAnswer: (answers: string[], questions?: string[]) => void;
  onApprove: () => void;
  onContinue: () => void;
  onRetry: () => void;
  onSkip: () => void;
  onExplainDifferently: (topicTitle: string) => void;
  onTestMe: (topicTitle: string) => void;
  onTryMyself: (topicTitle: string) => void;
  onAction: (actionType: string) => void;
  onPomodoroResume: () => void;
}

interface DirectiveCardProps extends DirectiveCardCallbacks {
  directive: ZDirective;
  resolved?: boolean;
}

// ─── Main DirectiveCard Dispatcher ───────────────────────────────────────────

export function DirectiveCard({
  directive,
  resolved = false,
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
}: DirectiveCardProps) {
  switch (directive.type) {
    case "ASK_QUESTION":
      return (
        <AskQuestionCard
          payload={directive.payload}
          resolved={resolved}
          onSubmitAnswer={onSubmitAnswer}
          onRetry={onRetry}
          onSkip={onSkip}
        />
      );
    case "ASK_QUESTIONS":
      return (
        <AskQuestionsCard
          payload={directive.payload}
          resolved={resolved}
          onSubmitAnswer={onSubmitAnswer}
          onSkip={onSkip}
        />
      );
    case "SHOW_QUIZ":
      return (
        <ShowQuizCard
          payload={directive.payload}
          resolved={resolved}
          onSubmitAnswer={onSubmitAnswer}
          onSkip={onSkip}
        />
      );
    case "SHOW_PLAN":
      return (
        <ShowPlanCard
          payload={directive.payload}
          resolved={resolved}
          onApprove={onApprove}
          onSkip={onSkip}
        />
      );
    case "UNLOCK_TOPIC":
      return (
        <UnlockTopicCard payload={directive.payload} resolved={resolved} />
      );
    case "SHOW_RESULT":
      return <ShowResultCard payload={directive.payload} resolved={resolved} />;
    case "SHOW_SUGGESTION":
      return (
        <ShowSuggestionCard
          payload={directive.payload}
          resolved={resolved}
          onExplainDifferently={onExplainDifferently}
          onTestMe={onTestMe}
          onTryMyself={onTryMyself}
          onAction={onAction}
        />
      );
    case "SHOW_SUMMARY":
      return (
        <ShowSummaryCard payload={directive.payload} resolved={resolved} />
      );
    case "POMODORO":
      return (
        <PomodoroCard
          payload={directive.payload}
          resolved={resolved}
          onResume={onPomodoroResume}
        />
      );
    default:
      return (
        <UnknownDirectiveCard
          type={directive.type}
          payload={directive.payload}
          resolved={resolved}
          onContinue={onContinue}
        />
      );
  }
}
