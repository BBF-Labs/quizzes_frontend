"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  PlayCircle,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Target,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { cn } from "@/lib/utils";
import type { QuizDetail } from "@/types/session";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLectures, setExpandedLectures] = useState<Set<number>>(
    new Set([0]),
  );

  useEffect(() => {
    api
      .get<{ data: QuizDetail }>(`/app/quizzes/${id}`)
      .then((res) => setQuiz(res.data?.data ?? null))
      .catch((err) => {
        console.error("[QuizDetailPage] load failed", err);
        setError("Failed to load quiz.");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (quiz?.title) {
      useBreadcrumbStore.getState().setDynamicTitle(quiz.title);
    }
    return () => useBreadcrumbStore.getState().setDynamicTitle(null);
  }, [quiz?.title]);

  const toggleLecture = (idx: number) => {
    setExpandedLectures((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const totalQuestions =
    quiz?.lectures.reduce(
      (sum, l) =>
        sum +
        l.topics.reduce(
          (s, t) => s + (t.questionCount ?? t.questions?.length ?? 0),
          0,
        ),
      0,
    ) ?? 0;

  const courseCode = quiz?.courseCode ?? "QUIZ";
  const noAttempts = quiz?.remainingAttempts === 0;

  return (
    <div className="min-h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-[#F7F9FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* ── Loading Skeleton ── */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 rounded-[28px] bg-slate-200" />
            <div className="h-32 rounded-[28px] bg-slate-100" />
            <div className="h-32 rounded-[28px] bg-slate-100" />
          </div>
        )}

        {/* ── Error State ── */}
        {!isLoading && error && (
          <div className="rounded-[28px] border border-rose-200 bg-white p-10 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-400 mb-3" />
            <p className="text-base font-bold text-slate-950">
              Failed to load quiz
            </p>
            <p className="mt-2 text-xs text-slate-500 font-semibold max-w-xs mx-auto">
              {error}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}

        {/* ── Main Content ── */}
        {quiz && (
          <>
            {/* Hero Dark Header Card */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[28px] bg-[#131B27] p-6 sm:p-8 text-white shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="space-y-3">
                  {/* Course pill */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-200">
                      {courseCode}
                    </span>
                    {quiz.courseTitle && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                        {quiz.courseTitle}
                      </span>
                    )}
                  </div>

                  <p className="hand text-xl text-[#DFFF61]">ready to test yourself? ✦</p>

                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl leading-tight">
                    {quiz.title}
                  </h1>

                  {/* Stat Pills Row */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold text-slate-200">
                      <BookOpen className="h-3 w-3" />
                      {quiz.lectures.length}{" "}
                      {quiz.lectures.length === 1 ? "Lecture" : "Lectures"}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold text-slate-200">
                      <Target className="h-3 w-3" />
                      {totalQuestions} Questions
                    </span>
                    {quiz.remainingAttempts !== null && (
                      <span
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border bg-white/5 px-3 py-1.5 text-[10px] font-extrabold",
                          noAttempts
                            ? "border-amber-400/30 text-amber-200"
                            : "border-white/10 text-slate-200",
                        )}
                      >
                        <CheckCircle2
                          className={cn(
                            "h-3 w-3",
                            noAttempts ? "text-amber-300" : "text-[#DFFF61]",
                          )}
                        />
                        {quiz.remainingAttempts === null
                          ? "Unlimited"
                          : `${quiz.remainingAttempts} left`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right CTA Column */}
                <div className="flex flex-col gap-3 shrink-0 md:items-end">
                  {noAttempts && (
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 max-w-xs text-right">
                      <p className="text-xs font-bold text-amber-300">
                        Attempt Limit Reached
                      </p>
                      <p className="text-[10px] text-amber-200/80 mt-1 font-semibold">
                        You&apos;ve used your free attempts for this window.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push("/app/billing")}
                        className="mt-2 flex items-center gap-1.5 rounded-xl bg-[#DFFF61] px-3 py-1.5 text-[10px] font-extrabold text-slate-950 hover:bg-yellow-300 transition ml-auto"
                      >
                        <Sparkles className="h-3 w-3" />
                        Upgrade
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => router.push("/app/library")}
                      className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-extrabold text-white hover:bg-white/20 transition"
                    >
                      Library
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/app/quizzes/${id}/take`)}
                      disabled={noAttempts}
                      className="rounded-2xl bg-[#0C60FC] px-7 py-3 text-xs font-extrabold text-white hover:bg-blue-500 transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Take Quiz →
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* ── Lecture Accordion List ── */}
            {quiz.lectures.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200/90 bg-white p-12 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-400">
                  No questions found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="px-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                    COURSE CONTENT
                  </p>
                  <h2 className="text-lg font-bold text-slate-950 mt-0.5">
                    {quiz.lectures.length} lectures · {totalQuestions}{" "}
                    questions
                  </h2>
                </div>

                {quiz.lectures.map((lecture, idx) => {
                  const lectureQCount = (lecture.topics || []).reduce(
                    (s, t) =>
                      s +
                      (t.questionCount ?? t.questions?.length ?? 0),
                    0,
                  );
                  const isOpen = expandedLectures.has(idx);

                  return (
                    <motion.div
                      key={`${lecture.lectureTitle}-${idx}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="rounded-[24px] border border-slate-200/90 bg-white shadow-xs overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleLecture(idx)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/60 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[10px] font-extrabold text-[#0C60FC]">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-950 leading-snug">
                              {lecture.lectureTitle}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              {(lecture.topics || []).length} topics ·{" "}
                              {lectureQCount} questions
                            </p>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-100 divide-y divide-slate-100">
                          {(lecture.topics || []).map((topic, ti) => {
                            const topicQCount =
                              topic.questionCount ??
                              topic.questions?.length ??
                              0;
                            return (
                              <div
                                key={`topic-${ti}`}
                                className="flex items-center justify-between px-5 py-3.5 bg-slate-50/40"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#0C60FC] shrink-0" />
                                  <span className="text-xs font-semibold text-slate-700">
                                    {topic.topicTitle}
                                  </span>
                                </div>
                                <span className="text-[10px] font-extrabold text-slate-400 font-mono">
                                  {topicQCount}Q
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Bottom CTA Strip */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-4 shadow-lg flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-600">
                {totalQuestions} questions ready · {quiz.lectures.length}{" "}
                lectures
              </span>
              <button
                type="button"
                onClick={() => router.push(`/app/quizzes/${id}/take`)}
                disabled={noAttempts}
                className="rounded-2xl bg-[#0C60FC] px-7 py-3 text-xs font-extrabold text-white hover:bg-blue-700 transition shadow-md disabled:opacity-40"
              >
                Take quiz →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}