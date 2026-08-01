"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  AlertCircle,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Target,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useSystemQuiz } from "@/hooks/app/use-quizzes";
import { useState } from "react";
import {
  formatNextAttemptTime,
  formatNextAttemptWindow,
} from "@/lib/attempt-window";

export default function SystemQuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: quiz, isLoading, error } = useSystemQuiz(id);
  const [showAllTags, setShowAllTags] = useState(false);
  const [expandedLectures, setExpandedLectures] = useState<Set<number>>(new Set([0]));

  const toggleLecture = (idx: number) => {
    setExpandedLectures((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const totalQuestions =
    quiz?.lectures?.reduce((sum, l) => {
      return (
        sum +
        (l.topics ?? []).reduce((s, t) => {
          return (
            s +
            (t.questions?.length ??
              t.questionTypes?.reduce(
                (acc, qt) => acc + (qt.questions?.length ?? 0),
                0
              ) ??
              0)
          );
        }, 0)
      );
    }, 0) ?? 0;

  const courseCode =
    quiz?.title?.match(/([A-Z]{3,4}\s*\d{3})/i)?.[1]?.toUpperCase() ?? "QUIZ";

  return (
    <div className="min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-[#F7F9FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Back link */}
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-[#0C60FC] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Quizzes
        </Link>

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
              {error instanceof Error && error.message === "UNAUTHENTICATED"
                ? "Sign in to take this quiz"
                : "Failed to load quiz"}
            </p>
            <p className="mt-2 text-xs text-slate-500 font-semibold max-w-xs mx-auto">
              {error instanceof Error && error.message === "UNAUTHENTICATED"
                ? "You need an active session to participate and track your scores."
                : "There was a problem retrieving the quiz data. Please try again."}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {error instanceof Error && error.message === "UNAUTHENTICATED" ? (
                <button
                  onClick={() => router.push(`/login?redirectUrl=/quizzes/${id}`)}
                  className="rounded-2xl bg-[#0C60FC] px-6 py-3 text-xs font-extrabold text-white hover:bg-blue-700 transition"
                >
                  Login to Start
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
                >
                  Refresh Page
                </button>
              )}
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
                  {/* Tags — smart truncated display */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-200">
                      {courseCode}
                    </span>
                    {((showAllTags ? quiz.tags : quiz.tags?.slice(0, 3)) ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold text-slate-300 uppercase tracking-widest"
                      >
                        {tag}
                      </span>
                    ))}
                    {(quiz.tags?.length ?? 0) > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllTags((v) => !v)}
                        className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-extrabold text-slate-400 hover:text-white hover:bg-white/10 transition"
                      >
                        {showAllTags ? "Show less" : `+${(quiz.tags?.length ?? 0) - 3} more`}
                      </button>
                    )}
                  </div>

                  <p className="hand text-xl text-[#DFFF61]">ready to test yourself? ✦</p>

                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl leading-tight">
                    {quiz.title}
                  </h1>

                  {quiz.description && (
                    <p className="text-sm leading-relaxed text-slate-400 font-medium max-w-lg">
                      {quiz.description}
                    </p>
                  )}

                  {/* Stat Pills Row */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold text-slate-200">
                      <BookOpen className="h-3 w-3" />
                      {quiz.lectures.length} {quiz.lectures.length === 1 ? "Lecture" : "Lectures"}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold text-slate-200">
                      <Target className="h-3 w-3" />
                      {totalQuestions} Questions
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold text-slate-200">
                      <CheckCircle2 className="h-3 w-3 text-[#DFFF61]" />
                      Pass: {quiz.passingScore ?? 70}%
                    </span>
                    {quiz.settings?.timeLimit && quiz.settings.timeLimit > 0 && (
                      <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold text-slate-200">
                        <Clock className="h-3 w-3" />
                        Timed
                      </span>
                    )}
                  </div>
                </div>

                {/* Right CTA Column */}
                <div className="flex flex-col gap-3 shrink-0 md:items-end">
                  {/* Attempt limit warning */}
                  {quiz.remainingAttempts === 0 && (
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 max-w-xs text-right">
                      <p className="text-xs font-bold text-amber-300">Attempt Limit Reached</p>
                      <p className="text-[10px] text-amber-200/80 mt-1 font-semibold">
                        {quiz.nextAttemptAt
                          ? `Next attempt in ${formatNextAttemptWindow(quiz.nextAttemptAt)} (${formatNextAttemptTime(quiz.nextAttemptAt)})`
                          : "You've used your free attempts for this window."}
                      </p>
                      <button
                        onClick={() => router.push("/pricing")}
                        className="mt-2 flex items-center gap-1.5 rounded-xl bg-[#DFFF61] px-3 py-1.5 text-[10px] font-extrabold text-slate-950 hover:bg-yellow-300 transition ml-auto"
                      >
                        <Sparkles className="h-3 w-3" />
                        Upgrade
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/quizzes/${id}/take?mode=view`)}
                      className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-extrabold text-white hover:bg-white/20 transition"
                    >
                      View Answers
                    </button>
                    <button
                      onClick={() => router.push(`/quizzes/${id}/take`)}
                      disabled={quiz.remainingAttempts === 0}
                      className="rounded-2xl bg-[#0C60FC] px-7 py-3 text-xs font-extrabold text-white hover:bg-blue-500 transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Start quiz →
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* ── Lecture Accordion List ── */}
            {quiz.lectures.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200/90 bg-white p-12 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-400">No questions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="px-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                    COURSE CONTENT
                  </p>
                  <h2 className="text-lg font-bold text-slate-950 mt-0.5">
                    {quiz.lectures.length} lectures · {totalQuestions} questions
                  </h2>
                </div>

                {quiz.lectures.map((lecture, idx) => {
                  const lectureQCount = (lecture.topics ?? []).reduce(
                    (s, t) =>
                      s +
                      (t.questions?.length ??
                        t.questionTypes?.reduce(
                          (acc, qt) => acc + (qt.questions?.length ?? 0),
                          0
                        ) ??
                        0),
                    0
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
                              {lecture.topics?.length ?? 0} topics · {lectureQCount} questions
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
                          {(lecture.topics ?? []).map((topic, ti) => {
                            const topicQCount =
                              topic.questions?.length ??
                              topic.questionTypes?.reduce(
                                (acc, qt) => acc + (qt.questions?.length ?? 0),
                                0
                              ) ??
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
                {totalQuestions} questions ready · {quiz.lectures.length} lectures
              </span>
              <button
                onClick={() => router.push(`/quizzes/${id}/take`)}
                disabled={quiz.remainingAttempts === 0}
                className="rounded-2xl bg-[#0C60FC] px-7 py-3 text-xs font-extrabold text-white hover:bg-blue-700 transition shadow-md disabled:opacity-40"
              >
                Start quiz →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
