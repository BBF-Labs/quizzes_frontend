"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  SkipForward,
  Trophy,
  Unlock,
} from "lucide-react";
import { SquareLoader } from "@/components/ui/square-loader";

import { cn } from "@/lib/utils";
import type {
  ZAskQuestionPayload,
  ZAskQuestionsPayload,
  ZDirective,
  ZShowPlanPayload,
  ZShowQuizPayload,
  ZShowResultPayload,
  ZShowSuggestionPayload,
  ZShowSummaryPayload,
  ZUnlockTopicPayload,
} from "@/types/session";

// ─── Shared sub-components ────────────────────────────────────────────────────

function ResolvedIndicator() {
  return (
    <div className="mt-3 flex items-center gap-1.5 text-muted-foreground/60">
      <CheckCircle2 className="size-3" />
      <span className="text-[9px] font-mono uppercase tracking-widest">
        Completed
      </span>
    </div>
  );
}

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
        "text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 border transition-colors",
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
        "border px-4 py-3 space-y-3",
        resolved
          ? "border-border/30 bg-card/20 opacity-60"
          : "border-amber-500/40 bg-amber-500/5",
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

// ─── ASK_QUESTION ─────────────────────────────────────────────────────────────

interface AskQuestionCardProps {
  payload: ZAskQuestionPayload;
  resolved: boolean;
  onSubmitAnswer: (answers: string[]) => void;
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

  const handleSubmit = () => {
    const ans = payload.options ? selectedOption : textAnswer.trim();
    if (ans) onSubmitAnswer([ans]);
  };

  return (
    <CardWrapper
      resolved={resolved}
      icon={<HelpCircle className="size-3" />}
      label="Question"
    >
      <p className="text-sm text-foreground leading-relaxed">
        {payload.question}
      </p>

      {!resolved && (
        <>
          {payload.options ? (
            <div className="flex flex-col gap-1.5">
              {payload.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedOption(opt)}
                  className={cn(
                    "text-left px-3 py-2 text-sm font-mono border transition-colors",
                    selectedOption === opt
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border/40 bg-transparent text-foreground hover:border-primary/40",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer…"
              rows={3}
              className="w-full resize-none border border-border/50 bg-background/50 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
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
        </>
      )}

      {resolved && <ResolvedIndicator />}
    </CardWrapper>
  );
}

// ─── ASK_QUESTIONS ────────────────────────────────────────────────────────────

interface AskQuestionsCardProps {
  payload: ZAskQuestionsPayload;
  resolved: boolean;
  onSubmitAnswer: (answers: string[]) => void;
  onSkip: () => void;
}

function AskQuestionsCard({
  payload,
  resolved,
  onSubmitAnswer,
  onSkip,
}: AskQuestionsCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const setAnswer = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = () => {
    const all = payload.questions.map((q) => answers[q.id] ?? "");
    if (all.some((a) => a.trim())) onSubmitAnswer(all);
  };

  return (
    <CardWrapper
      resolved={resolved}
      icon={<ClipboardList className="size-3" />}
      label="Questions"
    >
      <div className="space-y-4">
        {payload.questions.map((q, i) => (
          <div key={q.id} className="space-y-2">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-mono text-[10px] text-muted-foreground mr-2">
                {i + 1}.
              </span>
              {q.question}
            </p>
            {!resolved &&
              (q.options ? (
                <div className="flex flex-col gap-1">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswer(q.id, opt)}
                      className={cn(
                        "text-left px-3 py-1.5 text-sm font-mono border transition-colors",
                        answers[q.id] === opt
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border/40 bg-transparent text-foreground hover:border-primary/40",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="Your answer…"
                  className="w-full border border-border/50 bg-background/50 px-3 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
                />
              ))}
          </div>
        ))}
      </div>

      {!resolved && (
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton onClick={handleSubmit} variant="primary">
            Submit All
          </ActionButton>
          <ActionButton onClick={onSkip} variant="danger">
            <SkipForward className="inline size-2.5 mr-1" />
            Skip
          </ActionButton>
        </div>
      )}

      {resolved && <ResolvedIndicator />}
    </CardWrapper>
  );
}

// ─── SHOW_QUIZ ────────────────────────────────────────────────────────────────

interface ShowQuizCardProps {
  payload: ZShowQuizPayload;
  resolved: boolean;
  onSubmitAnswer: (answers: string[]) => void;
  onSkip: () => void;
}

function ShowQuizCard({
  payload,
  resolved,
  onSubmitAnswer,
  onSkip,
}: ShowQuizCardProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const answers = payload.questions.map((q) => selected[q.id] ?? "");
    if (answers.some((a) => a)) onSubmitAnswer(answers);
  };

  return (
    <CardWrapper
      resolved={resolved}
      icon={<FlaskConical className="size-3" />}
      label="Quiz"
    >
      <div className="space-y-4">
        {payload.questions.map((q, i) => (
          <div key={q.id} className="space-y-2">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-mono text-[10px] text-muted-foreground mr-2">
                Q{i + 1}.
              </span>
              {q.question}
            </p>
            {!resolved && (
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setSelected((prev) => ({ ...prev, [q.id]: opt }))
                    }
                    className={cn(
                      "text-left px-3 py-1.5 text-sm font-mono border transition-colors",
                      selected[q.id] === opt
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/40 bg-transparent text-foreground hover:border-primary/40",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!resolved && (
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton onClick={handleSubmit} variant="primary">
            Submit Quiz
          </ActionButton>
          <ActionButton onClick={onSkip} variant="danger">
            <SkipForward className="inline size-2.5 mr-1" />
            Skip
          </ActionButton>
        </div>
      )}

      {resolved && <ResolvedIndicator />}
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
  // SHOW_PLAN steps are always pending before approval
  const progressPct = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "border overflow-hidden font-mono text-xs",
        resolved ? "border-border/30 opacity-60" : "border-border/50",
      )}
    >
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-border/50 bg-background/80 flex items-center gap-3">
        <div className="w-6 h-6 border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 rounded-(--radius)">
          Z
        </div>
        <div className="font-bold text-foreground uppercase tracking-widest flex items-center gap-2 flex-1">
          {!resolved && (
            <span className="w-1.5 h-1.5 bg-primary block animate-pulse shrink-0" />
          )}
          <span>{payload.title || "Study Plan"}</span>
        </div>
        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest shrink-0">
          {total} steps
        </span>
      </div>

      {/* Step log */}
      <div className="px-5 py-4 space-y-3 bg-card/20">
        {steps.map((step, i) => {
          // SHOW_PLAN steps do not have status until they become tasks
          const isDone = false;
          const isActive = false;
          return (
            <motion.div
              key={step.id ?? i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
              className="flex items-start gap-3"
            >
              {/* Status icon */}
              {isDone && (
                <div className="mt-0.5 w-4 h-4 border border-primary bg-primary/20 flex items-center justify-center shrink-0 rounded-(--radius)">
                  <CheckCircle2 className="w-2.5 h-2.5 text-primary" />
                </div>
              )}
              {isActive && (
                <div className="mt-0.5 shrink-0">
                  <SquareLoader size={16} strokeWidth={1.5} />
                </div>
              )}
              {!isDone && !isActive && (
                <div className="mt-0.5 w-4 h-4 border border-muted-foreground/30 shrink-0 rounded-(--radius)" />
              )}

              {/* Step text */}
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "uppercase tracking-wider text-[11px]",
                    isDone && "text-foreground font-medium",
                    isActive && "text-primary font-bold",
                    !isDone && !isActive && "text-muted-foreground/50",
                  )}
                >
                  {step.title}
                </span>
                {step.description && !resolved && (
                  <p className="text-muted-foreground/60 text-[10px] mt-0.5 normal-case tracking-normal">
                    {step.description}
                  </p>
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
          <span
            className={cn(
              progressPct > 0 ? "text-primary" : "text-muted-foreground/40",
            )}
          >
            {progressPct}% Complete
          </span>
        </div>
        <div className="h-px bg-border/50 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Actions */}
      {!resolved && (
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

      {resolved && (
        <div className="px-5 py-3 border-t border-border/50">
          <ResolvedIndicator />
        </div>
      )}
    </motion.div>
  );
}

// ─── UNLOCK_TOPIC ─────────────────────────────────────────────────────────────

interface UnlockTopicCardProps {
  payload: ZUnlockTopicPayload;
  resolved: boolean;
  onContinue: () => void;
}

function UnlockTopicCard({
  payload,
  resolved,
  onContinue,
}: UnlockTopicCardProps) {
  return (
    <CardWrapper
      resolved={resolved}
      icon={<Unlock className="size-3" />}
      label="Topic Unlocked"
    >
      <p className="text-sm font-bold text-foreground">{payload.topicTitle}</p>
      {payload.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {payload.description}
        </p>
      )}

      {!resolved && (
        <ActionButton onClick={onContinue} variant="primary">
          <ChevronRight className="inline size-2.5 mr-1" />
          Continue
        </ActionButton>
      )}

      {resolved && <ResolvedIndicator />}
    </CardWrapper>
  );
}

// ─── SHOW_RESULT ──────────────────────────────────────────────────────────────

interface ShowResultCardProps {
  payload: ZShowResultPayload;
  resolved: boolean;
  onContinue: () => void;
}

function ShowResultCard({
  payload,
  resolved,
  onContinue,
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
          <span className="text-3xl font-black text-primary">
            {payload.score}
          </span>
          <span className="text-muted-foreground font-mono text-sm">
            / {payload.total}
          </span>
        </div>
      )}
      {payload.topicTitle && (
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          {payload.topicTitle}
        </p>
      )}
      {payload.message && (
        <p className="text-sm text-foreground leading-relaxed">
          {payload.message}
        </p>
      )}

      {!resolved && (
        <ActionButton onClick={onContinue} variant="primary">
          <ChevronRight className="inline size-2.5 mr-1" />
          Continue
        </ActionButton>
      )}

      {resolved && <ResolvedIndicator />}
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
        <p className="text-sm font-bold text-foreground">
          {payload.topicTitle}
        </p>
      )}
      {payload.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {payload.description}
        </p>
      )}

      {!resolved && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Topic-specific action buttons */}
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

          {/* Pre-defined suggestion list */}
          {payload.suggestions?.map((s) => (
            <ActionButton
              key={s.actionType}
              onClick={() => onAction(s.actionType)}
              variant="secondary"
            >
              {s.label}
            </ActionButton>
          ))}

          {/* Single generic action */}
          {!payload.topicTitle &&
            !payload.suggestions?.length &&
            payload.actionType && (
              <ActionButton
                onClick={() => onAction(payload.actionType!)}
                variant="primary"
              >
                {payload.label ?? payload.actionType}
              </ActionButton>
            )}
        </div>
      )}

      {resolved && <ResolvedIndicator />}
    </CardWrapper>
  );
}

// ─── SHOW_SUMMARY ─────────────────────────────────────────────────────────────

interface ShowSummaryCardProps {
  payload: ZShowSummaryPayload;
  resolved: boolean;
  onContinue: () => void;
}

function ShowSummaryCard({
  payload,
  resolved,
  onContinue,
}: ShowSummaryCardProps) {
  return (
    <CardWrapper
      resolved={resolved}
      icon={<ClipboardList className="size-3" />}
      label="Summary"
    >
      {payload.topicTitle && (
        <p className="text-sm font-bold text-foreground">
          {payload.topicTitle}
        </p>
      )}
      {payload.content && (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {payload.content}
        </p>
      )}
      {payload.keyPoints && payload.keyPoints.length > 0 && (
        <ul className="space-y-1">
          {payload.keyPoints.map((point, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <ChevronRight className="mt-0.5 size-3 shrink-0 text-primary" />
              {point}
            </li>
          ))}
        </ul>
      )}

      {!resolved && (
        <ActionButton onClick={onContinue} variant="primary">
          <ChevronRight className="inline size-2.5 mr-1" />
          Continue
        </ActionButton>
      )}

      {resolved && <ResolvedIndicator />}
    </CardWrapper>
  );
}

// ─── Public DirectiveCardCallbacks interface ──────────────────────────────────

export interface DirectiveCardCallbacks {
  onSubmitAnswer: (answers: string[]) => void;
  onApprove: () => void;
  onContinue: () => void;
  onRetry: () => void;
  onSkip: () => void;
  onExplainDifferently: (topicTitle: string) => void;
  onTestMe: (topicTitle: string) => void;
  onTryMyself: (topicTitle: string) => void;
  onAction: (actionType: string) => void;
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
          onContinue={onContinue}
        />
      );
    case "SHOW_RESULT":
      return (
        <ShowResultCard
          payload={directive.payload}
          resolved={resolved}
          onContinue={onContinue}
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
          onContinue={onContinue}
        />
      );
  }
}
