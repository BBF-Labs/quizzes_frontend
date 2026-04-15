"use client";

/**
 * Shared quiz question rendering primitives.
 *
 * QuestionMarkdown  — renders markdown + embedded HTML (rehype-raw)
 * QuestionTypeBadge — type label badge
 * QuizOptionBtn     — MCQ option button with full feedback states
 * QuizQuestionCard  — full interactive question card (take-page)
 */

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { motion, useAnimation } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { QuizQuestion } from "@/types/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FeedbackState = "correct" | "wrong" | null;

// ---------------------------------------------------------------------------
// QuestionMarkdown
// ---------------------------------------------------------------------------

/**
 * Renders a string that may contain Markdown, raw HTML, or a mix of both.
 * react-markdown + rehype-raw handles all three cases transparently.
 */
export function QuestionMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "prose prose-sm prose-invert max-w-none font-mono text-foreground",
        "prose-p:my-0 prose-ul:my-1 prose-ol:my-1 prose-li:my-0",
        "prose-code:bg-muted/40 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.8em]",
        "prose-strong:text-foreground prose-em:text-foreground/80",
        "prose-table:text-[0.75em]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuestionTypeBadge
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  mcq: "MCQ",
  true_false: "True / False",
  short_answer: "Short Answer",
  fill_in_blank: "Fill in Blank",
  fill_in: "Fill in Blank",
  essay: "Essay",
  free_text: "Free Text",
};

export function QuestionTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 uppercase">
      {TYPE_LABELS[type] ?? type}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// QuizOptionBtn
// ---------------------------------------------------------------------------

export function QuizOptionBtn({
  opt,
  index,
  selected,
  feedbackState,
  isCorrectOption,
  disabled,
  onClick,
}: {
  opt: string;
  index: number;
  selected: boolean;
  feedbackState: FeedbackState;
  isCorrectOption: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[index];

  const isWrongSelected = feedbackState === "wrong" && selected;
  const isRevealedCorrect = feedbackState === "wrong" && isCorrectOption;
  const isCorrectSelected = feedbackState === "correct" && selected;

  const containerClass =
    isCorrectSelected || isRevealedCorrect
      ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
      : isWrongSelected
        ? "border-red-500/60 bg-red-500/10 text-red-400"
        : selected && !feedbackState
          ? "border-primary bg-primary/10 text-foreground"
          : disabled
            ? "border-border/20 bg-card/10 text-muted-foreground/30 cursor-default"
            : "border-border/40 bg-card/20 text-muted-foreground hover:border-primary/50 hover:text-foreground cursor-pointer";

  const letterClass =
    isCorrectSelected || isRevealedCorrect
      ? "border-primary text-primary bg-primary/10"
      : isWrongSelected
        ? "border-red-500/60 text-red-400 bg-red-500/10"
        : selected && !feedbackState
          ? "border-primary text-primary bg-primary/10"
          : "border-border/40";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={`rounded-(--radius) w-full text-left px-4 py-3 border font-mono text-[11px] transition-all flex items-start gap-3 ${containerClass}`}
    >
      <span
        className={`rounded-(--radius) shrink-0 size-5 border flex items-center justify-center text-[9px] font-bold mt-0.5 ${letterClass}`}
      >
        {letter}
      </span>
      <span className="leading-relaxed flex-1">
        <QuestionMarkdown content={opt} className="prose-p:leading-relaxed" />
      </span>
      {(isCorrectSelected || isRevealedCorrect) && (
        <CheckCircle2 className="size-3.5 text-primary ml-auto mt-0.5 shrink-0" />
      )}
      {isWrongSelected && (
        <XCircle className="size-3.5 text-red-500 ml-auto mt-0.5 shrink-0" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// QuizQuestionCard  (full interactive card — used in take page)
// ---------------------------------------------------------------------------

export function QuizQuestionCard({
  q,
  index,
  total,
  answer,
  onAnswer,
  feedbackState,
  mode,
  disabled,
  showHints,
  hintsRevealed,
  onRevealHint,
}: {
  q: QuizQuestion;
  index: number;
  total: number;
  answer: string;
  onAnswer: (v: string) => void;
  feedbackState: FeedbackState;
  mode: "immediate" | "deferred";
  disabled: boolean;
  showHints: boolean;
  hintsRevealed: Record<string, boolean>;
  onRevealHint: (id: string) => void;
}) {
  const controls = useAnimation();

  const borderClass =
    feedbackState === "correct"
      ? "border-primary/40 bg-primary/5"
      : feedbackState === "wrong"
        ? "border-red-500/40 bg-red-500/5"
        : "border-border/40 bg-card/20";

  const isRevealed = !!feedbackState;
  const isAnswered = !!answer;
  const showExplanation =
    isRevealed && mode === "immediate" && isAnswered && feedbackState === "wrong";
  const showHintUI = hintsRevealed[q.id];

  const isFreeForm =
    q.type === "short_answer" ||
    q.type === "essay" ||
    q.type === "free_text" ||
    q.type === "fill_in_blank" ||
    q.type === "fill_in";

  useEffect(() => {
    if (feedbackState === "correct") {
      controls.start({
        scale: [1, 1.025, 1],
        transition: { duration: 0.45, ease: "easeInOut" },
      });
    } else if (feedbackState === "wrong") {
      controls.start({
        x: [0, -10, 10, -7, 7, -4, 4, 0],
        transition: { duration: 0.45, ease: "easeInOut" },
      });
    }
  }, [feedbackState, controls]);

  return (
    <motion.div animate={controls}>
      <div className={`rounded-(--radius) px-5 py-5 border transition-colors ${borderClass}`}>
        {/* Badge + counter on the same row — badge left, counter right */}
        <div className="flex items-center justify-between mb-3">
          <QuestionTypeBadge type={q.type} />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted-foreground/40">
              {index + 1} / {total}
            </span>
            {mode === "deferred" && answer && (
              <span className="text-[9px] font-mono text-primary/60 uppercase tracking-widest">
                answered
              </span>
            )}
          </div>
        </div>

        {/* Question text */}
        <div className="mb-5">
          <QuestionMarkdown content={q.question} />
        </div>

        {/* MCQ options */}
        {q.type === "mcq" && q.options && (
          <div className="flex flex-col gap-2">
            {q.options.map((opt, i) => (
              <QuizOptionBtn
                key={i}
                opt={opt}
                index={i}
                selected={answer === opt}
                feedbackState={mode === "immediate" ? feedbackState : null}
                isCorrectOption={opt === q.correctAnswer}
                disabled={disabled}
                onClick={() => onAnswer(opt)}
              />
            ))}
          </div>
        )}

        {/* True / False */}
        {q.type === "true_false" && (
          <div className="flex flex-col gap-2">
            {["true", "false"].map((val, i) => (
              <QuizOptionBtn
                key={val}
                opt={val.charAt(0).toUpperCase() + val.slice(1)}
                index={i}
                selected={answer === val}
                feedbackState={mode === "immediate" ? feedbackState : null}
                isCorrectOption={val === q.correctAnswer}
                disabled={disabled}
                onClick={() => onAnswer(val)}
              />
            ))}
          </div>
        )}

        {/* Free-form input */}
        {isFreeForm && (
          <textarea
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={
              q.type === "fill_in_blank" || q.type === "fill_in"
                ? "Fill in the blank…"
                : "Type your answer…"
            }
            rows={q.type === "essay" ? 6 : 4}
            disabled={disabled}
            className="rounded-(--radius) w-full border border-border/50 bg-card/30 px-4 py-3 font-mono text-[12px] placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 resize-none transition-colors disabled:opacity-40"
          />
        )}

        {/* Hint / Explanation panel */}
        {(showHintUI || showExplanation) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 border border-primary/20 bg-primary/5 px-4 py-3"
          >
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary/60 mb-1">
              {showHintUI ? "HINT" : "EXPLANATION"}
            </p>
            <QuestionMarkdown
              content={
                showHintUI
                  ? (q.hint ?? "")
                  : (q.explanation || `The correct answer is ${q.correctAnswer}`)
              }
              className="text-[11px] italic"
            />
          </motion.div>
        )}

        {/* Reveal hint button */}
        {showHints && q.hint && !isRevealed && !showHintUI && (
          <button
            onClick={() => onRevealHint(q.id)}
            className="mt-4 text-[10px] font-mono uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <div className="size-1.5 rounded-full bg-primary animate-pulse" />
            Show Hint
          </button>
        )}
      </div>
    </motion.div>
  );
}
