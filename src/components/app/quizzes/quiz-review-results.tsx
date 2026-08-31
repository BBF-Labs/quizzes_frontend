"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { QuestionMarkdown, QuestionTypeBadge } from "@/components/app/quizzes/question-renderer";
import { answersMatch } from "@/lib/quiz-answer";
import type { QuizConfig, QuizQuestion, ZGradeResultItem } from "@/types/session";

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
}: {
  q: QuizQuestion;
  given: string;
  index: number;
  zResult?: ZGradeResultItem;
  selfMark: boolean | null;
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

  return (
    <div
      className={`rounded-[24px] border p-5 shadow-xs transition space-y-3 ${
        isCorrect === true
          ? "border-emerald-200 bg-emerald-50/40"
          : isCorrect === false
          ? "border-rose-200 bg-rose-50/40"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
              isCorrect ? "bg-emerald-500" : "bg-rose-500"
            }`}
          >
            {isCorrect ? "✓" : "×"}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            QUESTION {index + 1} · {q.type.toUpperCase()}
          </span>
        </div>
        <span className="text-xs font-extrabold font-mono text-slate-400">
          {isCorrect ? "+5 pts" : "0 pts"}
        </span>
      </div>

      {/* Question Text */}
      <h3 className="text-sm font-bold text-slate-950 leading-snug">
        <QuestionMarkdown content={q.question} />
      </h3>

      {/* Given vs Correct Answer Cards */}
        <div className={`grid gap-3 pt-1 ${isCorrect === true ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
          {isCorrect !== true && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-1">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                YOUR ANSWER
              </p>
              <p className="text-xs font-bold text-rose-600">
                {given || "(No answer given)"}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-1">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-700">
            CORRECT ANSWER
          </p>
          <p className="text-xs font-bold text-emerald-900">
            {q.correctAnswer || "See explanation below"}
          </p>
        </div>
      </div>

      {/* Explanation Box */}
      {q.explanation && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 border-l-4 border-l-[#0C60FC] space-y-1">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#0C60FC]">
            WHY
          </p>
          <p className="text-xs leading-5 text-slate-700 font-semibold">
            {q.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export function QuizReviewResults({
  questions,
  userAnswers,
  zGradingResults = [],
  selfMarkings = {},
  config,
  onReset,
  onGradeWithZ,
  isGradingZ = false,
  quizTitle = "Quiz",
}: {
  questions: QuizQuestion[];
  userAnswers: Record<string, string>;
  zGradingResults?: ZGradeResultItem[];
  selfMarkings?: Record<string, boolean>;
  config: QuizConfig;
  onReset: () => void;
  onGradeWithZ?: () => void;
  isGradingZ?: boolean;
  quizTitle?: string;
}) {
  let totalScore = 0;
  let correctCount = 0;

  // Free-text answers the learner gave that Z hasn't graded yet — these gate
  // the explicit "Grade with Z" call-to-action.
  const ungradedFreeText = questions.filter(
    (q) =>
      isFreeResponseType(q.type) &&
      (userAnswers[q.id] || "").trim() !== "" &&
      !zGradingResults.some((z) => z.questionId === q.id),
  );
  const showGradeWithZ = Boolean(
    config.useZGrading && onGradeWithZ && ungradedFreeText.length > 0,
  );

  questions.forEach((q) => {
    const given = userAnswers[q.id] || "";
    if (q.type === "mcq" || q.type === "true_false") {
      if (answersMatch(q.type, given, q.correctAnswer)) {
        correctCount += 1;
        totalScore += 5;
      }
    } else {
      const zRes = zGradingResults.find((z) => z.questionId === q.id);
      if (zRes?.isCorrect || selfMarkings[q.id]) {
        correctCount += 1;
        totalScore += 5;
      }
    }
  });

  const percentage = Math.round((correctCount / (questions.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] bg-[#F7F9FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Dark Hero Card */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#131B27] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="hand text-2xl text-[#DFFF61]">quiz complete ✦</p>
            <h1 className="display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Here's how you did.
            </h1>
            <p className="max-w-md text-xs leading-5 text-slate-400 font-medium">
              You completed all questions. Review the breakdown below or try again with a new configuration.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold text-slate-200">
                {config.feedbackMode === "immediate" ? "Practice mode" : "Test mode"}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold text-slate-200">
                No timer
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold text-slate-200">
                Pass mark · {config.passingScore || 70}%
              </span>
            </div>

            {/* Explicit Z-grading call-to-action for free-text answers */}
            {showGradeWithZ && (
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onGradeWithZ}
                  disabled={isGradingZ}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#DFFF61] px-5 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGradingZ ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGradingZ
                    ? "Grading…"
                    : `Grade with Z (${ungradedFreeText.length})`}
                </button>
                <p className="mt-2 text-[10px] font-semibold text-slate-500">
                  Z will mark your written answers and update your score.
                </p>
              </div>
            )}
          </div>

          {/* Right Giant Score Circle */}
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-[#DFFF61] bg-white/5 shadow-inner">
            <span className="text-4xl font-black text-white">{percentage}%</span>
          </div>
        </section>

        {/* Main 2-Column Section */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left Column: Question Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#0C60FC]">
                  QUESTION REVIEW
                </p>
                <h2 className="text-lg font-bold text-slate-950">Your answer breakdown</h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-[#0C60FC]">
                {correctCount}/{questions.length}
              </span>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <ReviewItem
                  key={q.id}
                  q={q}
                  given={userAnswers[q.id]}
                  index={idx}
                  zResult={zGradingResults.find((z) => z.questionId === q.id)}
                  selfMark={selfMarkings[q.id] ?? null}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Session Summary */}
          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  SESSION SUMMARY
                </p>
                <h3 className="text-base font-bold text-slate-950 mt-1">Performance</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-100">
                  <p className="text-2xl font-extrabold text-[#0C60FC]">{totalScore} pts</p>
                  <p className="mt-1 text-[9px] font-bold text-slate-500 uppercase">EARNED</p>
                </div>
                <div className="rounded-2xl bg-[#E9FFD3] p-4 border border-lime-200">
                  <p className="text-2xl font-extrabold text-slate-900">{questions.length}</p>
                  <p className="mt-1 text-[9px] font-bold text-slate-600 uppercase">ANSWERS</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-extrabold text-slate-950">Strongest area</p>
                <p className="text-xs text-slate-500 font-semibold">Core Image Concepts & Terminology</p>
              </div>

              <button
                type="button"
                onClick={onReset}
                className="w-full rounded-2xl bg-[#0C60FC] py-3.5 text-center text-xs font-extrabold text-white hover:bg-blue-700 transition shadow-md"
              >
                Try quiz again →
              </button>
            </div>
          </aside>
        </div>

        {/* Bottom Floating Bar */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-4 shadow-lg flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-600">
            Ready for another round?
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
            >
              Configure again
            </button>
            <Link
              href="/app/quizzes"
              className="rounded-2xl bg-slate-950 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#0C60FC] transition"
            >
              Back to quizzes →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
