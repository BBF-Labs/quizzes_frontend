"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { api } from "@/lib/api";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import type {
  QuizDetail,
  QuizLecture,
  QuizTopic,
  QuizQuestion,
} from "@/types/session";

import {
  LectureSection,
  QuizStatsBar,
} from "@/components/app/quizzes/quiz-content";

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

  const totalQuestions = quiz?.lectures.reduce(
    (sum, l) =>
      sum +
      l.topics.reduce(
        (s, t) => s + (t.questionCount ?? t.questions?.length ?? 0),
        0,
      ),
    0,
  );

  return (
    <div className="min-h-full px-4 pt-2 pb-8">
      <div className="mx-auto max-w-3xl">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse bg-card/40 border border-border/30"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive">
            {error}
          </div>
        )}

        {quiz && (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {(quiz.courseTitle || quiz.courseCode) && (
                <p className="mb-2 text-[11px] font-mono text-muted-foreground/60">
                  {[quiz.courseTitle, quiz.courseCode]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <QuizStatsBar
                  questionCount={totalQuestions ?? 0}
                  lectureCount={quiz.lectures.length}
                  className="w-full sm:flex-1"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none h-8 gap-1.5 text-[10px] font-mono"
                    onClick={() => router.push("/app")}
                  >
                    <BookOpen className="size-3.5" />
                    Study
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 sm:flex-none h-8 gap-1.5 text-[10px] font-mono"
                    onClick={() => router.push(`/app/quizzes/${id}/take`)}
                  >
                    <PlayCircle className="size-3.5" />
                    Take Quiz
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Lectures */}
            {quiz.lectures.length === 0 ? (
              <p className="text-[11px] font-mono text-muted-foreground/40 text-center py-12">
                No questions found.
              </p>
            ) : (
              <motion.div
                className="flex flex-col gap-3"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.07 } },
                }}
                initial="hidden"
                animate="visible"
              >
                <Accordion type="multiple" className="grid gap-3">
                  {quiz.lectures.map((lecture, idx) => (
                    <motion.div
                      key={`${lecture.lectureTitle}-${idx}`}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.22 },
                        },
                      }}
                    >
                      <LectureSection lecture={lecture} index={idx} />
                    </motion.div>
                  ))}
                </Accordion>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
