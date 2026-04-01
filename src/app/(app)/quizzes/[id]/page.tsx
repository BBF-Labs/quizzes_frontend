"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { useSystemQuiz } from "@/hooks/app/use-quizzes";
import type { QuizLecture, QuizTopic, QuizQuestion } from "@/types/session";
import { useState } from "react";

import {
  LectureSection,
  QuizStatsBar,
} from "@/components/app/quizzes/quiz-content";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemQuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: quiz, isLoading, error } = useSystemQuiz(id);

  const totalQuestions =
    quiz?.lectures?.reduce((sum, l) => {
      const lectureTotal = (l.topics ?? []).reduce((s, t) => {
        const qCount =
          t.questions?.length ??
          t.questionTypes?.reduce(
            (acc, qt) => acc + (qt.questions?.length ?? 0),
            0,
          ) ??
          0;
        return s + qCount;
      }, 0);
      return sum + lectureTotal;
    }, 0) ?? 0;

  return (
    <div className="min-h-full px-4 pt-4 pb-8">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          All Quizzes
        </Link>
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

        {!isLoading && error && (
          <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive">
            Failed to load quiz.
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
              <h1 className="text-xl font-black tracking-tight mb-3">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-sm font-mono text-muted-foreground/70 mb-3">
                  {quiz.description}
                </p>
              )}

              <div className="flex items-start justify-between gap-4">
                <QuizStatsBar
                  questionCount={totalQuestions}
                  lectureCount={quiz.lectures.length}
                  passingScore={quiz.passingScore}
                  settings={quiz.settings}
                  className="flex-1"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-[10px] font-mono"
                    onClick={() => router.push("/app")}
                  >
                    <BookOpen className="size-3" />
                    Study
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 gap-1 text-[10px] font-mono"
                    onClick={() => router.push(`/quizzes/${id}/take`)}
                  >
                    <PlayCircle className="size-3" />
                    Take Quiz
                  </Button>
                </div>
              </div>

              {(quiz.tags?.length ?? 0) > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <Tag className="size-3 text-muted-foreground/30 shrink-0" />
                  {quiz.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-mono text-muted-foreground/50 border border-border/30 px-1.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Lectures */}
            {quiz.lectures.length === 0 ? (
              <p className="text-[11px] font-mono text-muted-foreground/40 text-center py-12">
                No questions yet.
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
