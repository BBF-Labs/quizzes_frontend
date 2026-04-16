"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Coffee,
  FlaskConical,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  SkipForward,
  Timer,
  Trophy,
  Unlock,
} from "lucide-react";
import { SquareLoader } from "@/components/ui/square-loader";
import { QuestionMarkdown, QuizOptionBtn } from "@/components/app/quizzes/question-renderer";

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

// ─── Shared sub-components ────────────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

function ActionButton({
  onClick,
  children,
  variant = "secondary",
  className,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-(--radius) text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 border transition-colors",
        variant === "primary" &&
          "border-primary/60 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
        variant === "secondary" &&
          "border-border/50 bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground",
        variant === "danger" &&
          "border-destructive/40 bg-transparent text-destructive/70 hover:border-destructive hover:text-destructive",
        className,
      )}
    >
      {children}
    </button>
  );
}

interface CardWrapperProps {
  resolved: boolean;
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function CardWrapper({ resolved, icon, label, children }: CardWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-(--radius) border border-amber-500/40 bg-amber-500/5 px-4 py-3 space-y-3 transition-opacity",
        resolved && "opacity-50",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-amber-500">{icon}</span>
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-500">
          {label}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Q:A resolved display (shared by question-type directives) ─────────────────

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
      className="rounded-(--radius) border border-border/25 bg-muted/10 px-4 py-3 font-mono text-xs divide-y divide-border/20"
    >
      {entries.map((e, i) => (
        <div key={i} className="py-3 first:pt-0 last:pb-0 space-y-2">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 block mb-1">
              Q
            </span>
            <QuestionMarkdown
              content={e.question}
              className="text-muted-foreground leading-relaxed"
            />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest text-primary/60 block mb-1">
              A
            </span>
            <p className="text-foreground leading-relaxed">{e.answer || "—"}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ─── ASK_QUESTION ─────────────────────────────────────────────────────────────

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

  const handleSubmit = () => {
    const ans = payload.options ? selectedOption : textAnswer.trim();
    if (ans) {
      submittedAnswerRef.current = ans;
      onSubmitAnswer([ans], [payload.question]);
    }
  };

  if (resolved) {
    return (
      <QAResolvedCard
        entries={[{ question: payload.question, answer: submittedAnswerRef.current || "—" }]}
      />
    );
  }

  return (
    <CardWrapper
      resolved={resolved}
      icon={<HelpCircle className="size-3" />}
      label="Question"
    >
      <QuestionMarkdown content={payload.question} />

      {payload.options ? (
        <div className="flex flex-col gap-1.5">
          {payload.options.map((opt, i) => (
            <QuizOptionBtn
              key={opt}
              opt={opt}
              index={i}
              selected={selectedOption === opt}
              feedbackState={null}
              isCorrectOption={false}
              disabled={false}
              onClick={() => setSelectedOption(opt)}
            />
          ))}
        </div>
      ) : (
        <textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Type your answer…"
          rows={3}
          className="rounded-(--radius) w-full resize-none border border-border/50 bg-background/50 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton onClick={handleSubmit} variant="primary">
          Submit Answer
        </ActionButton>
        <ActionButton onClick={onRetry}>
          <RotateCcw className="inline size-2.5 mr-1" />
          Retry
        </ActionButton>
        <ActionButton onClick={onSkip} variant="danger">
          <SkipForward className="inline size-2.5 mr-1" />
          Skip
        </ActionButton>
      </div>
    </CardWrapper>
  );
}

// ─── ASK_QUESTIONS ────────────────────────────────────────────────────────────

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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const submittedAnswersRef = useRef<string[]>([]);

  const setAnswer = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = () => {
    const all = payload.questions.map((q) => answers[q.id] ?? "");
    if (all.some((a) => a.trim())) {
      submittedAnswersRef.current = all;
      onSubmitAnswer(all, payload.questions.map((q) => q.question));
    }
  };

  if (resolved) {
    return (
      <QAResolvedCard
        entries={payload.questions.map((q, i) => ({
          question: q.question,
          answer: submittedAnswersRef.current[i] ?? "—",
        }))}
      />
    );
  }

  return (
    <CardWrapper
      resolved={resolved}
      icon={<ClipboardList className="size-3" />}
      label="Questions"
    >
      <div className="space-y-4">
        {payload.questions.map((q, i) => (
          <div key={q.id} className="space-y-2">
            <div className="flex gap-2">
              <span className="font-mono text-[10px] text-muted-foreground shrink-0 mt-0.5">
                {i + 1}.
              </span>
              <QuestionMarkdown content={q.question} />
            </div>
            {q.options ? (
              <div className="flex flex-col gap-1">
                {q.options.map((opt, oi) => (
                  <QuizOptionBtn
                    key={opt}
                    opt={opt}
                    index={oi}
                    selected={answers[q.id] === opt}
                    feedbackState={null}
                    isCorrectOption={false}
                    disabled={false}
                    onClick={() => setAnswer(q.id, opt)}
                  />
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder="Your answer…"
                className="rounded-(--radius) w-full border border-border/50 bg-background/50 px-3 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton onClick={handleSubmit} variant="primary">
          Submit All
        </ActionButton>
        <ActionButton onClick={onSkip} variant="danger">
          <SkipForward className="inline size-2.5 mr-1" />
          Skip
        </ActionButton>
      </div>
    </CardWrapper>
  );
}

// ─── SHOW_QUIZ ────────────────────────────────────────────────────────────────

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
  const [selected, setSelected] = useState<Record<string, string>>({});
  const submittedRef = useRef<Record<string, string>>({});

  const handleSubmit = () => {
    const answers = payload.questions.map((q) => selected[q.id] ?? "");
    if (answers.some((a) => a)) {
      submittedRef.current = selected;
      onSubmitAnswer(answers, payload.questions.map((q) => q.question));
    }
  };

  if (resolved) {
    return (
      <QAResolvedCard
        entries={payload.questions.map((q) => ({
          question: q.question,
          answer: submittedRef.current[q.id] ?? "—",
        }))}
      />
    );
  }

  return (
    <CardWrapper
      resolved={resolved}
      icon={<FlaskConical className="size-3" />}
      label="Quiz"
    >
      <div className="space-y-4">
        {payload.questions.map((q, i) => (
          <div key={q.id} className="space-y-2">
            <div className="flex gap-2">
              <span className="font-mono text-[10px] text-muted-foreground shrink-0 mt-0.5">
                Q{i + 1}.
              </span>
              <QuestionMarkdown content={q.question} />
            </div>
            <div className="flex flex-col gap-1">
              {q.options.map((opt, oi) => (
                <QuizOptionBtn
                  key={opt}
                  opt={opt}
                  index={oi}
                  selected={selected[q.id] === opt}
                  feedbackState={null}
                  isCorrectOption={false}
                  disabled={false}
                  onClick={() => setSelected((prev) => ({ ...prev, [q.id]: opt }))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton onClick={handleSubmit} variant="primary">
          Submit Quiz
        </ActionButton>
        <ActionButton onClick={onSkip} variant="danger">
          <SkipForward className="inline size-2.5 mr-1" />
          Skip
        </ActionButton>
      </div>
    </CardWrapper>
  );
}

// ─── SHOW_PLAN ────────────────────────────────────────────────────────────────

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
  const steps = payload.steps ?? [];
  const total = steps.length;
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  // True once Z starts populating statuses (implementation phase re-emissions)
  const hasStatuses = steps.some((s) => s.status !== undefined);

  // Compact resolved snapshot — shows progress at the time this card was emitted
  if (resolved) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="rounded-(--radius) border border-border/25 bg-card/10 overflow-hidden font-mono text-xs"
      >
        <div className="px-4 py-2.5 flex items-center gap-3">
          <div className="w-5 h-5 border border-primary/25 bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 rounded-(--radius) text-[9px]">
            Z
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 flex-1 truncate">
            {payload.title || "Study Plan"}
          </span>
          {hasStatuses && (
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest shrink-0">
              {completedCount}/{total} done
            </span>
          )}
        </div>
        {hasStatuses && total > 0 && (
          <div className="px-4 pb-2.5">
            <div className="h-px bg-border/30 overflow-hidden">
              <div
                className="h-full bg-primary/50 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-(--radius) border border-border/50 overflow-hidden font-mono text-xs"
    >
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-border/50 bg-background/80 flex items-center gap-3">
        <div className="w-6 h-6 border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 rounded-(--radius)">
          Z
        </div>
        <div className="font-bold text-foreground uppercase tracking-widest flex items-center gap-2 flex-1">
          <span className="w-1.5 h-1.5 bg-primary block animate-pulse shrink-0" />
          <span>{payload.title || "Study Plan"}</span>
        </div>
        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest shrink-0">
          {total} steps
        </span>
      </div>

      {/* Step list */}
      <div className="px-5 py-4 space-y-3 bg-card/20">
        {steps.map((step, i) => {
          const isDone = step.status === "completed";
          const isActive = step.status === "active";
          return (
            <motion.div
              key={step.id ?? i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
              className="flex items-start gap-3"
            >
              <div
                className={cn(
                  "mt-0.5 w-4 h-4 border shrink-0 rounded-(--radius) flex items-center justify-center",
                  isDone
                    ? "border-primary/60 bg-primary/20"
                    : isActive
                      ? "border-primary/40 bg-primary/5"
                      : "border-muted-foreground/30",
                )}
              >
                {isDone && <CheckCircle2 className="size-2.5 text-primary" />}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "uppercase tracking-wider text-[11px]",
                    isDone
                      ? "text-muted-foreground/35 line-through"
                      : isActive
                        ? "text-foreground font-bold"
                        : "text-muted-foreground/50",
                  )}
                >
                  {step.title}
                </span>
                {step.description && !isDone && (
                  <QuestionMarkdown
                    content={step.description}
                    className="text-[10px] italic text-muted-foreground/60 mt-0.5"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 border-t border-border/50 bg-background/50">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-2 font-bold uppercase tracking-widest">
          <span>System Progress</span>
          <span className={completedCount > 0 ? "text-primary" : "text-muted-foreground/40"}>
            {progressPct}% Complete
          </span>
        </div>
        <div className="h-px bg-border/50 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Actions — only shown for initial planning-phase emission (no statuses yet) */}
      {!hasStatuses && (
        <div className="px-5 py-3 border-t border-border/50 flex items-center gap-2">
          <ActionButton onClick={onApprove} variant="primary">
            <CheckCircle2 className="inline size-2.5 mr-1" />
            Approve Plan
          </ActionButton>
          <ActionButton onClick={onSkip} variant="danger">
            <SkipForward className="inline size-2.5 mr-1" />
            Skip
          </ActionButton>
        </div>
      )}
    </motion.div>
  );
}

// ─── UNLOCK_TOPIC ─────────────────────────────────────────────────────────────

interface UnlockTopicCardProps {
  payload: ZUnlockTopicPayload;
  resolved: boolean;
}

function UnlockTopicCard({
  payload,
  resolved,
}: UnlockTopicCardProps) {
  return (
    <CardWrapper
      resolved={resolved}
      icon={<Unlock className="size-3" />}
      label="Topic Unlocked"
    >
      <p className="text-sm font-bold text-foreground">{payload.topicTitle}</p>
      {payload.description && (
        <QuestionMarkdown
          content={payload.description}
          className="text-sm text-muted-foreground leading-relaxed"
        />
      )}
    </CardWrapper>
  );
}

// ─── SHOW_RESULT ──────────────────────────────────────────────────────────────

interface ShowResultCardProps {
  payload: ZShowResultPayload;
  resolved: boolean;
}

function ShowResultCard({
  payload,
  resolved,
}: ShowResultCardProps) {
  const hasScore =
    typeof payload.score === "number" && typeof payload.total === "number";

  return (
    <CardWrapper
      resolved={resolved}
      icon={<Trophy className="size-3" />}
      label="Result"
    >
      {hasScore && (
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-primary">{payload.score}</span>
          <span className="text-muted-foreground font-mono text-sm">/ {payload.total}</span>
        </div>
      )}
      {payload.topicTitle && (
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          {payload.topicTitle}
        </p>
      )}
      {payload.message && (
        <QuestionMarkdown
          content={payload.message}
          className="text-sm text-foreground leading-relaxed"
        />
      )}
    </CardWrapper>
  );
}

// ─── SHOW_SUGGESTION ──────────────────────────────────────────────────────────

interface ShowSuggestionCardProps {
  payload: ZShowSuggestionPayload;
  resolved: boolean;
  onExplainDifferently: (topicTitle: string) => void;
  onTestMe: (topicTitle: string) => void;
  onTryMyself: (topicTitle: string) => void;
  onAction: (actionType: string) => void;
}

function ShowSuggestionCard({
  payload,
  resolved,
  onExplainDifferently,
  onTestMe,
  onTryMyself,
  onAction,
}: ShowSuggestionCardProps) {
  return (
    <CardWrapper
      resolved={resolved}
      icon={<Lightbulb className="size-3" />}
      label="Suggestion"
    >
      {payload.topicTitle && (
        <p className="text-sm font-bold text-foreground">{payload.topicTitle}</p>
      )}
      {payload.description && (
        <QuestionMarkdown
          content={payload.description}
          className="text-sm text-muted-foreground leading-relaxed"
        />
      )}

      {!resolved && (
        <div className="flex flex-wrap items-center gap-2">
          {payload.topicTitle && (
            <>
              <ActionButton
                onClick={() => onExplainDifferently(payload.topicTitle!)}
                variant="secondary"
              >
                Explain differently
              </ActionButton>
              <ActionButton
                onClick={() => onTestMe(payload.topicTitle!)}
                variant="secondary"
              >
                Test me
              </ActionButton>
              <ActionButton
                onClick={() => onTryMyself(payload.topicTitle!)}
                variant="secondary"
              >
                Try myself
              </ActionButton>
            </>
          )}
          {payload.suggestions?.map((s) => (
            <ActionButton
              key={s.actionType}
              onClick={() => onAction(s.actionType)}
              variant="secondary"
            >
              {s.label}
            </ActionButton>
          ))}
          {!payload.topicTitle && !payload.suggestions?.length && payload.actionType && (
            <ActionButton
              onClick={() => onAction(payload.actionType!)}
              variant="primary"
            >
              {payload.label ?? payload.actionType}
            </ActionButton>
          )}
        </div>
      )}
    </CardWrapper>
  );
}

// ─── SHOW_SUMMARY ─────────────────────────────────────────────────────────────

interface ShowSummaryCardProps {
  payload: ZShowSummaryPayload;
  resolved: boolean;
}

function ShowSummaryCard({
  payload,
  resolved,
}: ShowSummaryCardProps) {
  return (
    <CardWrapper
      resolved={resolved}
      icon={<ClipboardList className="size-3" />}
      label="Summary"
    >
      {payload.topicTitle && (
        <p className="text-sm font-bold text-foreground">{payload.topicTitle}</p>
      )}
      {payload.content && (
        <QuestionMarkdown
          content={payload.content}
          className="text-sm text-foreground leading-relaxed"
        />
      )}
      {payload.keyPoints && payload.keyPoints.length > 0 && (
        <ul className="space-y-1">
          {payload.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <ChevronRight className="mt-0.5 size-3 shrink-0 text-primary" />
              <QuestionMarkdown content={point} className="flex-1" />
            </li>
          ))}
        </ul>
      )}
    </CardWrapper>
  );
}

// ─── UNKNOWN_DIRECTIVE (Fallback) ─────────────────────────────────────────────

function UnknownDirectiveCard({
  type,
  payload,
  resolved,
  onContinue,
}: {
  type: string;
  payload: any;
  resolved: boolean;
  onContinue: () => void;
}) {
  return (
    <CardWrapper
      resolved={resolved}
      icon={<HelpCircle className="size-3" />}
      label={`Action: ${type}`}
    >
      <div className="space-y-2">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest italic">
          New system action received. Some controls may be limited.
        </p>
        <div className="rounded-(--radius) border border-border/40 bg-muted/20 p-2 overflow-auto max-h-40">
          <pre className="text-[10px] font-mono text-muted-foreground leading-tight">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>

      {!resolved && (
        <ActionButton onClick={onContinue} variant="primary">
          <ChevronRight className="inline size-2.5 mr-1" />
          Got it
        </ActionButton>
      )}
    </CardWrapper>
  );
}

// ─── POMODORO ─────────────────────────────────────────────────────────────────

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

  // Tick
  useEffect(() => {
    if (!running || phase === "done") return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Advance phase
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
            // break → back to work
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
  }, [running, phase, interval, workMinutes, shortBreakMinutes, longBreakMinutes, intervalsBeforeLongBreak]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const total = phaseDuration(phase) || 1;
  const progress = ((total - secondsLeft) / total) * 100;

  const phaseLabel =
    phase === "work"
      ? `Work · Round ${interval}`
      : phase === "short_break"
        ? "Short Break"
        : phase === "long_break"
          ? "Long Break"
          : "Done";

  const isBreak = phase === "short_break" || phase === "long_break";

  if (resolved) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-(--radius) border border-border/25 bg-card/10 px-4 py-2.5 flex items-center gap-3 font-mono text-xs opacity-50"
      >
        <Timer className="size-3 text-muted-foreground/50 shrink-0" />
        <span className="text-muted-foreground/60 uppercase tracking-widest truncate flex-1">
          Pomodoro · {topicTitle}
        </span>
        <span className="text-muted-foreground/40 uppercase tracking-widest shrink-0">
          {workMinutes}m work / {shortBreakMinutes}m break
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-(--radius) border overflow-hidden font-mono text-xs",
        isBreak
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-primary/30 bg-primary/5",
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3">
        {isBreak ? (
          <Coffee className="size-3.5 text-emerald-400 shrink-0" />
        ) : (
          <Timer className="size-3.5 text-primary shrink-0" />
        )}
        <span
          className={cn(
            "text-[9px] font-bold uppercase tracking-widest flex-1",
            isBreak ? "text-emerald-400" : "text-primary",
          )}
        >
          {phaseLabel}
        </span>
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest shrink-0 truncate max-w-32">
          {topicTitle}
        </span>
      </div>

      {/* Countdown */}
      <div className="px-4 py-6 flex flex-col items-center gap-4">
        <div
          className={cn(
            "text-5xl font-black tabular-nums tracking-tight",
            isBreak ? "text-emerald-400" : "text-primary",
          )}
        >
          {mm}:{ss}
        </div>

        {/* Progress bar */}
        <div className="w-full h-px bg-border/30 overflow-hidden">
          <motion.div
            className={cn(
              "h-full",
              isBreak ? "bg-emerald-400" : "bg-primary",
            )}
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Interval dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: intervalsBeforeLongBreak }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                i < interval
                  ? isBreak
                    ? "bg-emerald-400"
                    : "bg-primary"
                  : "bg-border/50",
              )}
            />
          ))}
          <span className="ml-2 text-[9px] uppercase tracking-widest text-muted-foreground/40">
            until long break
          </span>
        </div>
      </div>

      {/* Note */}
      {note && (
        <div className="px-4 pb-3">
          <p className="text-[10px] italic text-muted-foreground/50 leading-relaxed">{note}</p>
        </div>
      )}

      {/* Controls */}
      <div className="px-4 py-3 border-t border-border/30 flex items-center gap-2">
        <ActionButton
          onClick={() => setRunning((r) => !r)}
          variant="secondary"
        >
          {running ? "Pause" : "Resume Timer"}
        </ActionButton>
        <ActionButton onClick={onResume} variant="primary">
          <ChevronRight className="inline size-2.5 mr-1" />
          Done, Continue
        </ActionButton>
      </div>
    </motion.div>
  );
}

// ─── Public DirectiveCardCallbacks interface ──────────────────────────────────

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

// ─── Main DirectiveCard dispatcher ───────────────────────────────────────────

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
        <UnlockTopicCard
          payload={directive.payload}
          resolved={resolved}
        />
      );
    case "SHOW_RESULT":
      return (
        <ShowResultCard
          payload={directive.payload}
          resolved={resolved}
        />
      );
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
        <ShowSummaryCard
          payload={directive.payload}
          resolved={resolved}
        />
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
