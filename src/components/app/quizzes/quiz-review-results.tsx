"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  Flame,
  Loader2,
  RotateCcw,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  QuestionMarkdown,
  QuestionTypeBadge,
} from "@/components/app/quizzes/question-renderer";
import { answersMatch } from "@/lib/quiz-answer";
import type {
  QuizConfig,
  QuizQuestion,
  ZGradeResultItem,
} from "@/types/session";

function isFreeResponseType(type: QuizQuestion["type"]): boolean {
  return (
    type === "free_text" ||
    type === "short_answer" ||
    type === "essay" ||
    type === "fill_in_blank" ||
    type === "fill_in"
  );
}

function ReviewItem({
  q,
  given,
  index,
  zResult,
  selfMark,
  onSelfMark,
}: {
  q: QuizQuestion;
  given: string;
  index: number;
  zResult?: ZGradeResultItem;
  selfMark: boolean | null;
  onSelfMark?: (v: boolean) => void;
}) {
  const autoGrade =
    (q.type === "mcq" || q.type === "true_false") && q.correctAnswer
      ? answersMatch(q.type, given, q.correctAnswer)
      : null;
  const zGraded = isFreeResponseType(q.type) && zResult != null;
  const isCorrect =
    q.type === "mcq" || q.type === "true_false"
      ? autoGrade
      : zGraded
        ? zResult!.isCorrect
        : selfMark;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const borderColor =
    isCorrect === true
      ? "border-green-500/30 bg-green-500/5"
      : isCorrect === false
        ? "border-red-500/30 bg-red-500/5"
        : "border-border/30 bg-card/20";

  return (
    <div className={`rounded-(--radius) border px-4 py-3 ${borderColor}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <QuestionTypeBadge type={q.type} />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-mono text-muted-foreground/40">
            Q{index + 1}
          </span>
          {zGraded && (
            <span className="text-[9px] font-mono text-primary/60 flex items-center gap-0.5">
              <Zap className="size-2.5" /> Z: {zResult!.score}%
            </span>
          )}
          {isCorrect === true && (
            <CheckCircle2 className="size-4 text-green-500" />
          )}
          {isCorrect === false && <XCircle className="size-4 text-red-500" />}
        </div>
      </div>

      <div className="mb-3">
        <QuestionMarkdown content={q.question} className="text-[11px]" />
      </div>

      {(q.type === "mcq" || q.type === "true_false") && q.options && (
        <div className="flex flex-col gap-1 mb-1">
          {q.options.map((opt, i) => {
            const isSelected =
              q.type === "true_false"
                ? answersMatch("true_false", given, opt)
                : given === opt;
            const isRight =
              q.type === "true_false"
                ? answersMatch("true_false", opt, q.correctAnswer)
                : opt === q.correctAnswer;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-2 py-0.5 text-[10px] font-mono ${
                  isRight
                    ? "text-green-500"
                    : isSelected
                      ? "text-red-400"
                      : "text-muted-foreground/30"
                }`}
              >
                <span>{letters[i]}.</span>
                <QuestionMarkdown
                  content={opt}
                  className="text-[10px] flex-1"
                />
                {isRight && (
                  <span className="ml-auto text-[9px] uppercase tracking-widest text-green-500/60">
                    correct
                  </span>
                )}
                {isSelected && !isRight && (
                  <span className="ml-auto text-[9px] uppercase tracking-widest text-red-400/60">
                    yours
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isFreeResponseType(q.type) && (
        <div className="space-y-2">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 mb-0.5">
              Your answer
            </p>
            <p className="text-[11px] font-mono text-foreground/80 leading-relaxed">
              {given || (
                <span className="text-muted-foreground/30 italic">
                  No answer
                </span>
              )}
            </p>
          </div>
          {q.correctAnswer && (
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 mb-0.5">
                Reference answer
              </p>
              <QuestionMarkdown
                content={q.correctAnswer}
                className="text-[11px] text-green-500"
              />
            </div>
          )}
          {zGraded && (
            <div className="rounded-(--radius) border border-primary/20 bg-primary/5 px-3 py-2 mt-2">
              <p className="text-[9px] font-mono uppercase tracking-widest text-primary/60 mb-1 flex items-center gap-1">
                <Zap className="size-2.5" /> Z Feedback
              </p>
              <p className="text-[11px] font-mono text-foreground/80 leading-relaxed">
                {zResult!.feedback}
              </p>
            </div>
          )}
          {!zGraded && selfMark === null && onSelfMark && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => onSelfMark(true)}
                className="rounded-(--radius) flex items-center gap-1 text-[10px] font-mono border border-green-500/40 text-green-500 px-2 py-1 hover:bg-green-500/10 transition-colors"
              >
                <CheckCircle2 className="size-3" />
                Correct
              </button>
              <button
                type="button"
                onClick={() => onSelfMark(false)}
                className="rounded-(--radius) flex items-center gap-1 text-[10px] font-mono border border-red-500/40 text-red-400 px-2 py-1 hover:bg-red-500/10 transition-colors"
              >
                <XCircle className="size-3" />
                Incorrect
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuizReviewResults({
  questions,
  answers,
  selfMarks,
  onSelfMark,
  zResults,
  onGradeWithZ,
  isGrading,
  onRetake,
  quizTitle,
  passingScore,
  maxStreak,
  config,
  canUseZGrading = true,
  onBack,
}: {
  questions: QuizQuestion[];
  answers: Record<string, string>;
  selfMarks: Record<string, boolean | null>;
  onSelfMark: (id: string, v: boolean) => void;
  zResults: Record<string, ZGradeResultItem>;
  onGradeWithZ: () => void;
  isGrading: boolean;
  onRetake: () => void;
  quizTitle: string;
  passingScore: number;
  maxStreak: number;
  config: QuizConfig;
  canUseZGrading?: boolean;
  onBack?: () => void;
}) {
  const graded = questions.map((q) => {
    if (q.type === "mcq" || q.type === "true_false") {
      const ans = answers[q.id] ?? "";
      if (!ans) return null;
      const correct = q.correctAnswer;
      return correct ? answersMatch(q.type, ans, String(correct)) : null;
    }
    const z = zResults[q.id];
    if (z) return z.isCorrect;
    const sm = selfMarks[q.id];
    return sm ?? null;
  });

  const gradedCount = graded.filter((g) => g !== null).length;
  const correctCount = graded.filter((g) => g === true).length;
  const pct =
    gradedCount > 0 ? Math.round((correctCount / gradedCount) * 100) : 0;
  const pass = pct >= passingScore;

  const unansweredFreeText = questions.filter(
    (q) =>
      isFreeResponseType(q.type) &&
      answers[q.id] &&
      !zResults[q.id] &&
      selfMarks[q.id] == null,
  );
  const hasUngradedFreeText = unansweredFreeText.length > 0;
  const isPctFinal =
    gradedCount === questions.filter((q) => !!answers[q.id]).length;
  const allowManualSelfMark = !config.useZGrading || !canUseZGrading;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-(--radius) border px-5 py-6 mb-6 text-center ${
          isPctFinal
            ? pass
              ? "border-green-500/30 bg-green-500/5"
              : "border-red-500/20 bg-red-500/5"
            : "border-border/40 bg-card/30"
        }`}
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
          {quizTitle}
        </p>

        <p className="text-6xl font-black tabular-nums">
          {isPctFinal ? `${pct}%` : "-%"}
        </p>

        {isPctFinal && (
          <p
            className={`mt-1 text-[11px] font-mono font-bold uppercase tracking-widest ${
              pass ? "text-green-500" : "text-red-500"
            }`}
          >
            {pass ? "Passed" : "Failed"} · {passingScore}% required
          </p>
        )}

        <p className="mt-2 text-[10px] font-mono text-muted-foreground/50">
          {correctCount} / {gradedCount} correct
          {!isPctFinal && (
            <span className="ml-2 text-amber-500/80">
              · mark remaining below
            </span>
          )}
        </p>

        {maxStreak >= 3 && (
          <div className="rounded-(--radius) mt-3 inline-flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5">
            <Flame className="size-3 text-amber-500" />
            <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">
              Best streak: {maxStreak}
            </span>
          </div>
        )}

        {config.useZGrading && canUseZGrading && hasUngradedFreeText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-(--radius) border border-primary/20 bg-primary/5 px-4 py-4 mt-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-left">
                <p className="text-[11px] font-mono font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" />
                  Grade with Z
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                  Z will score your {unansweredFreeText.length} free-text{" "}
                  {unansweredFreeText.length === 1 ? "answer" : "answers"} with
                  detailed feedback.
                </p>
              </div>
              <Button
                size="sm"
                className="h-7 text-[10px] font-mono shrink-0"
                onClick={onGradeWithZ}
                disabled={isGrading}
              >
                {isGrading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  "Grade now"
                )}
              </Button>
            </div>
          </motion.div>
        )}

        <div className="flex justify-center gap-2 mt-4">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] font-mono gap-1"
              onClick={onBack}
            >
              <ChevronLeft className="size-3" />
              Back
            </Button>
          )}
          <button
            type="button"
            onClick={onRetake}
            className="rounded-(--radius) inline-flex items-center gap-1.5 border border-border/50 px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
          >
            <RotateCcw className="size-3" />
            Retake
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <ReviewItem
            key={q.id}
            q={q}
            given={answers[q.id] ?? ""}
            index={i}
            zResult={zResults[q.id]}
            selfMark={
              isFreeResponseType(q.type) ? (selfMarks[q.id] ?? null) : null
            }
            onSelfMark={
              allowManualSelfMark &&
              isFreeResponseType(q.type) &&
              !zResults[q.id]
                ? (v) => onSelfMark(q.id, v)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
