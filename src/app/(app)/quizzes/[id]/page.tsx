"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, PlayCircle, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSystemQuiz } from "@/hooks/app/use-quizzes";
import type { QuizLecture, QuizTopic, QuizQuestion } from "@/types/session";
import { useState } from "react";

// ─── Question row ─────────────────────────────────────────────────────────────

function QuestionRow({ q }: { q: QuizQuestion }) {
  return (
    <div className="border border-border/30 bg-card/20 px-4 py-3">
      <div className="flex items-start gap-2">
        <Badge
          variant="outline"
          className="shrink-0 text-[8px] font-mono h-4 px-1.5 uppercase mt-0.5"
        >
          {q.type === "mcq" ? "MCQ" : q.type === "true_false" ? "T/F" : q.type}
        </Badge>
        <p className="text-[12px] font-mono text-foreground leading-relaxed">{q.question}</p>
      </div>
      {q.options && q.options.length > 0 && (
        <ul className="mt-2 ml-8 flex flex-col gap-1">
          {q.options.map((opt, i) => (
            <li
              key={i}
              className={`text-[10px] font-mono ${
                opt === q.correctAnswer ? "text-green-500" : "text-muted-foreground/60"
              }`}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </li>
          ))}
        </ul>
      )}
      {q.correctAnswer && (!q.options || q.options.length === 0) && (
        <p className="mt-2 ml-8 text-[10px] font-mono text-muted-foreground/50">
          Answer: <span className="text-green-500">{q.correctAnswer}</span>
        </p>
      )}
    </div>
  );
}

// ─── Topic accordion ──────────────────────────────────────────────────────────

function TopicSection({ topic }: { topic: QuizTopic }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 py-2 text-left"
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground/40" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40" />
        )}
        <span className="text-[11px] font-mono font-semibold text-foreground">
          {topic.topicTitle}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/40">
          {topic.questions.length} Qs
        </span>
      </button>
      {open && (
        <div className="ml-5 flex flex-col gap-2 mb-3">
          {topic.questions.map((q) => (
            <QuestionRow key={q.id} q={q} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lecture accordion ────────────────────────────────────────────────────────

function LectureSection({ lecture }: { lecture: QuizLecture }) {
  const [open, setOpen] = useState(true);
  const totalQ = lecture.topics.reduce((s, t) => s + t.questions.length, 0);
  return (
    <div className="border border-border/40 bg-card/20 px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 text-left"
      >
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground/50" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
        )}
        <span className="font-mono font-bold text-sm text-foreground flex-1 truncate">
          {lecture.lectureTitle}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0">
          {lecture.topics.length} topics · {totalQ} Qs
        </span>
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-0">
          {lecture.topics.map((t) => (
            <TopicSection key={t.topicTitle} topic={t} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemQuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: quiz, isLoading, error } = useSystemQuiz(id);

  const totalQuestions = quiz?.lectures.reduce(
    (sum, l) => sum + l.topics.reduce((s, t) => s + t.questions.length, 0),
    0,
  );

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
              <div key={i} className="h-16 animate-pulse bg-card/40 border border-border/30" />
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
              <h1 className="text-xl font-black tracking-tight mb-3">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-sm font-mono text-muted-foreground/70 mb-3">
                  {quiz.description}
                </p>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5">
                    {totalQuestions} questions
                  </Badge>
                  <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5">
                    {quiz.lectures.length} lectures
                  </Badge>
                  <Badge variant="secondary" className="text-[9px] font-mono h-4 px-1.5">
                    Pass {quiz.passingScore}%
                  </Badge>
                  {quiz.settings.timeLimit && (
                    <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5">
                      {quiz.settings.timeLimit}m
                    </Badge>
                  )}
                </div>
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

              {quiz.tags.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <Tag className="size-3 text-muted-foreground/30 shrink-0" />
                  {quiz.tags.map((tag) => (
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
                {quiz.lectures.map((lecture) => (
                  <motion.div
                    key={lecture.lectureTitle}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
                    }}
                  >
                    <LectureSection lecture={lecture} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
