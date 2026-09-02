"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { motion, useAnimation } from "framer-motion";
import { CheckCircle2, XCircle, Flame, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { QuizQuestion } from "@/types/session";

export type FeedbackState = "correct" | "wrong" | null;

const MOTIVATION_BANK: Record<string, string[]> = {
  mcq: [
    "Trust your first read, then verify the detail.",
    "Eliminate the weak options and move with confidence.",
    "Look for the one choice that fits everything else.",
  ],
  true_false: [
    "Short and sharp: decide, then commit.",
    "Watch for the small wording traps.",
    "If it feels obvious, read it once more.",
  ],
  short_answer: [
    "Keep it concise and answer the exact prompt.",
    "Use the key term first, then expand if needed.",
    "Simple is strong when the wording is tight.",
  ],
  fill_in: [
    "Pull the missing word from the sentence around it.",
    "Match the exact context before you type.",
    "Read the full line, then fill the gap.",
  ],
  fill_in_blank: [
    "Look at the sentence structure for the missing piece.",
    "Let the surrounding words guide the answer.",
    "Keep the phrasing tight and exact.",
  ],
  free_text: [
    "Write the core idea first, then refine it.",
    "Clarity beats length every time.",
    "Keep the answer direct and relevant.",
  ],
  essay: [
    "Start with the thesis and build from there.",
    "Use structure to keep your argument moving.",
    "A clear line of thought will do the heavy lifting.",
  ],
  default: [
    "Stay steady and answer one step at a time.",
    "Read carefully, then move with purpose.",
    "The clean answer is usually the strongest one.",
  ],
};

const TIP_BANK: Record<string, string[]> = {
  mcq: [
    "Cross out the options that break the rule.",
    "Check for absolutes like always or never.",
    "Use the stem to anchor your choice.",
  ],
  true_false: [
    "Pay attention to one changed word.",
    "False statements often hide in qualifiers.",
    "Read for precision, not just familiarity.",
  ],
  short_answer: [
    "Answer in the simplest correct wording.",
    "If you know the term, use it directly.",
    "Don’t pad the answer unless the prompt asks for it.",
  ],
  fill_in: [
    "Think of the sentence as a sentence, not a blank.",
    "The grammar around the gap can reveal the answer.",
    "Use the nearby subject and verb to guide you.",
  ],
  fill_in_blank: [
    "Watch for singular/plural agreement.",
    "The blank usually sits where the key term belongs.",
    "Read the full sentence before filling anything in.",
  ],
  free_text: [
    "One strong sentence can be enough.",
    "Answer the point, not the whole universe around it.",
    "Use the terms you know accurately.",
  ],
  essay: [
    "Lead with your main claim, then support it.",
    "A simple outline keeps the answer focused.",
    "Give the reader a clear path through your reasoning.",
  ],
  default: [
    "Keep your pace steady and deliberate.",
    "Small, correct steps beat rushed guesses.",
    "Choose the answer that best matches the full context.",
  ],
};

function pickCycleItem(items: string[], index: number): string {
  if (items.length === 0) return "";
  return items[index % items.length];
}

function getQuestionTypeKey(type: QuizQuestion["type"]): string {
  return type in MOTIVATION_BANK ? type : "default";
}

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
        "prose prose-sm max-w-none font-sans text-slate-900",
        "prose-p:my-0 prose-ul:my-1 prose-ol:my-1 prose-li:my-0",
        "prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.85em]",
        "prose-strong:text-slate-950 prose-em:text-slate-700",
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

const TYPE_LABELS: Record<string, string> = {
  mcq: "• MULTIPLE CHOICE",
  multiple_select: ":: MULTIPLE SELECT",
  true_false: "• TRUE / FALSE",
  short_answer: "• SHORT ANSWER",
  fill_in_blank: "• FILL IN BLANK",
  fill_in: "• FILL IN BLANK",
  essay: "• ESSAY",
  free_text: "• FREE TEXT",
};

export function QuestionTypeBadge({ type }: { type: string }) {
  return (
    <span className="rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-[10px] font-extrabold uppercase text-[#0C60FC]">
      {TYPE_LABELS[type] ?? `• ${type.toUpperCase()}`}
    </span>
  );
}

function cleanOptionText(text: string): string {
  if (typeof text !== "string") return String(text ?? "");
  return text
    .replace(/^(\(?[A-Za-z0-9][\)\.\:\-\]]|\b[A-Za-z0-9][\)\.\:\-])\s*/, "")
    .trim();
}

export function QuizOptionBtn({
  opt,
  index,
  selected,
  feedbackState,
  isCorrectOption,
  disabled,
  revealCorrectAnswer = false,
  onClick,
}: {
  opt: string;
  index: number;
  selected: boolean;
  feedbackState: FeedbackState;
  isCorrectOption: boolean;
  disabled: boolean;
  revealCorrectAnswer?: boolean;
  onClick: () => void;
}) {
  const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[index];
  const cleanedContent = cleanOptionText(opt);

  const isWrongSelected = feedbackState === "wrong" && selected;
  const isRevealedCorrect =
    feedbackState === "wrong" && isCorrectOption && revealCorrectAnswer;
  const isCorrectSelected = feedbackState === "correct" && selected;

  let containerClass =
    "border-slate-200 bg-white text-slate-900 hover:border-[#0C60FC]/60 hover:bg-blue-50/20";
  let letterClass = "border-slate-300 bg-slate-50 text-slate-700";

  if (isCorrectSelected || isRevealedCorrect) {
    containerClass =
      "border-emerald-500 bg-emerald-50/60 text-slate-950 font-bold";
    letterClass = "border-emerald-500 bg-emerald-500 text-white";
  } else if (isWrongSelected) {
    containerClass = "border-rose-500 bg-rose-50/60 text-slate-950 font-bold";
    letterClass = "border-rose-500 bg-rose-500 text-white";
  } else if (selected && !feedbackState) {
    containerClass =
      "border-[#0C60FC] bg-blue-50/60 text-slate-950 font-bold shadow-xs";
    letterClass = "border-[#0C60FC] bg-[#0C60FC] text-white";
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={`rounded-2xl w-full text-left p-4 border text-xs font-bold transition-all flex items-center gap-3.5 ${containerClass}`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold transition ${letterClass}`}
      >
        {letter}
      </span>
      <span className="leading-snug flex-1">
        <QuestionMarkdown content={cleanedContent} className="prose-p:leading-snug" />
      </span>
      {(isCorrectSelected || isRevealedCorrect) && (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 ml-auto shrink-0" />
      )}
      {isWrongSelected && (
        <XCircle className="h-4 w-4 text-rose-600 ml-auto shrink-0" />
      )}
    </button>
  );
}

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
  streak = 0,
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
  streak?: number;
}) {
  const controls = useAnimation();
  const [hintVisible, setHintVisible] = useState(() => !!hintsRevealed[q.id]);
  const typeKey = getQuestionTypeKey(q.type);
  const motivation = pickCycleItem(MOTIVATION_BANK[typeKey], index);
  const tip = pickCycleItem(TIP_BANK[typeKey], index + 1);

  useEffect(() => {
    if (hintsRevealed[q.id]) {
      setHintVisible(true);
    }
  }, [hintsRevealed[q.id]]);

  const isAnswered = !!answer;
  const showHintUI = hintVisible && !!q.hint;

  const isFreeForm =
    q.type === "short_answer" ||
    q.type === "essay" ||
    q.type === "free_text" ||
    q.type === "fill_in_blank" ||
    q.type === "fill_in";

  useEffect(() => {
    if (feedbackState === "correct") {
      controls.start({
        scale: [1, 1.015, 1],
        transition: { duration: 0.3, ease: "easeInOut" },
      });
    } else if (feedbackState === "wrong") {
      controls.start({
        x: [0, -8, 8, -5, 5, 0],
        transition: { duration: 0.35, ease: "easeInOut" },
      });
    }
  }, [feedbackState, controls]);

  return (
    <motion.div animate={controls} className="w-full">
      <div className="rounded-[28px] border border-slate-200/90 bg-white shadow-xl overflow-hidden flex flex-col md:flex-row min-h-105">
        {/* Left Side Blue Brand Box */}
        <div className="bg-[#0C60FC] text-white p-6 sm:p-8 md:w-57.5 flex flex-col justify-between items-center text-center shrink-0">
          <div className="flex flex-col items-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DFFF61] text-slate-950 font-extrabold text-2xl shadow-md">
              •.•
            </span>
            <p className="hand text-xl text-[#DFFF61] mt-3">you've got this!</p>
            <p className="mt-3 text-xs leading-5 text-blue-100 font-medium">
              Focus on one choice at a time. Your first instinct is often
              useful.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/15 w-full text-center">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-blue-200">
              Current Streak
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-black text-white">
              {streak > 0 ? (
                <>
                  <span className="text-base">🔥</span>
                  {streak} in a row
                </>
              ) : (
                <span className="text-blue-300 font-bold text-xs">—</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Main Question Content Area */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <QuestionTypeBadge type={q.type} />
              <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-mono font-extrabold text-white">
                5 POINTS
              </span>
            </div>

            {/* Hand script accent */}
            <p className="hand text-lg text-[#0C60FC]">{motivation}</p>

            <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-3 text-xs text-slate-600">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                TIP
              </p>
              <p className="font-medium leading-5">{tip}</p>
            </div>

            {/* Question Text */}
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl leading-snug">
              <QuestionMarkdown content={q.question} />
            </h2>
            <p className="text-xs font-semibold text-slate-400">
              {q.type === "mcq"
                ? "Choose one answer."
                : "Select every correct answer."}
            </p>

            {/* Options List */}
            {q.type === "mcq" && q.options && (
              <div className="space-y-2.5 pt-2">
                {q.options.map((opt, i) => (
                  <QuizOptionBtn
                    key={i}
                    opt={opt}
                    index={i}
                    selected={answer === opt}
                    feedbackState={mode === "immediate" ? feedbackState : null}
                    isCorrectOption={opt === q.correctAnswer}
                    disabled={disabled}
                    revealCorrectAnswer={showHints}
                    onClick={() => onAnswer(opt)}
                  />
                ))}
              </div>
            )}

            {/* True / False */}
            {q.type === "true_false" && (
              <div className="space-y-2.5 pt-2">
                {["true", "false"].map((val, i) => (
                  <QuizOptionBtn
                    key={val}
                    opt={val.charAt(0).toUpperCase() + val.slice(1)}
                    index={i}
                    selected={answer === val}
                    feedbackState={mode === "immediate" ? feedbackState : null}
                    isCorrectOption={val === q.correctAnswer}
                    disabled={disabled}
                    revealCorrectAnswer={showHints}
                    onClick={() => onAnswer(val)}
                  />
                ))}
              </div>
            )}

            {/* Free-form Text */}
            {isFreeForm && (
              <div className="pt-2">
                <textarea
                  value={answer}
                  onChange={(e) => onAnswer(e.target.value)}
                  placeholder={
                    q.type === "fill_in_blank" || q.type === "fill_in"
                      ? "Fill in the blank…"
                      : "Type your answer…"
                  }
                  rows={4}
                  disabled={disabled}
                  className="w-full rounded-2xl border border-slate-200 bg-[#F7F9FC] p-4 text-xs font-semibold text-slate-900 outline-none focus:border-[#0C60FC] focus:bg-white transition resize-none disabled:opacity-50"
                />
              </div>
            )}
          </div>

          {showHints && q.hint && (
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => {
                  setHintVisible((prev) => {
                    const next = !prev;
                    if (next) {
                      onRevealHint(q.id);
                    }
                    return next;
                  });
                }}
                className="rounded-full border border-[#0C60FC]/20 bg-[#0C60FC]/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#0C60FC] transition hover:bg-[#0C60FC]/10"
              >
                {hintVisible ? "Hide hint" : "Show hint"}
              </button>
            </div>
          )}

          {/* Hint callout */}
          {showHintUI && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs"
            >
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#0C60FC] mb-1">
                HINT
              </p>
              <QuestionMarkdown
                content={q.hint ?? ""}
                className="text-xs italic text-slate-700"
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
