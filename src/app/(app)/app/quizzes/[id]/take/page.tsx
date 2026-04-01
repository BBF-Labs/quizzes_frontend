"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { QuizDetail, QuizQuestion } from "@/types/session";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenQuestions(quiz: QuizDetail): QuizQuestion[] {
  return quiz.lectures.flatMap((l) => l.topics.flatMap((t) => t.questions));
}

function gradeAnswer(q: QuizQuestion, given: string): boolean | null {
  if (!q.correctAnswer) return null;
  return given.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;
  return (
    <div className="w-full h-0.5 bg-border/30">
      <motion.div
        className="h-full bg-primary"
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

// ─── Question card ────────────────────────────────────────────────────────────

interface QuestionCardProps {
  q: QuizQuestion;
  index: number;
  total: number;
  answer: string;
  onAnswer: (val: string) => void;
}

function QuestionCard({ q, index, total, answer, onAnswer }: QuestionCardProps) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2 }}
    >
      {/* Question meta */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 uppercase">
          {q.type === "mcq" ? "MCQ" : "Free Text"}
        </Badge>
        <span className="text-[10px] font-mono text-muted-foreground/50">
          {index + 1} / {total}
        </span>
      </div>

      {/* Question text */}
      <p className="font-mono text-sm leading-relaxed text-foreground mb-6">
        {q.question}
      </p>

      {/* MCQ options */}
      {q.type === "mcq" && q.options && q.options.length > 0 && (
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const selected = answer === opt;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onAnswer(opt)}
                className={`w-full text-left px-4 py-3 border font-mono text-[11px] transition-all flex items-start gap-3 ${
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/40 bg-card/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span
                  className={`shrink-0 size-5 border text-[10px] flex items-center justify-center font-bold ${
                    selected ? "border-primary text-primary" : "border-border/50"
                  }`}
                >
                  {letters[i]}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Free text input */}
      {q.type === "free_text" && (
        <textarea
          value={answer}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Type your answer…"
          rows={4}
          className="w-full border border-border/50 bg-card/30 px-4 py-3 font-mono text-[12px] placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 resize-none transition-colors"
        />
      )}
    </motion.div>
  );
}

// ─── Review item ──────────────────────────────────────────────────────────────

function ReviewItem({
  q,
  given,
  index,
  selfMark,
  onSelfMark,
}: {
  q: QuizQuestion;
  given: string;
  index: number;
  selfMark: boolean | null;
  onSelfMark?: (v: boolean) => void;
}) {
  const autoGrade = q.type === "mcq" ? gradeAnswer(q, given) : null;
  const isCorrect = q.type === "mcq" ? autoGrade : selfMark;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return (
    <div
      className={`border px-4 py-3 ${
        isCorrect === true
          ? "border-green-500/30 bg-green-500/5"
          : isCorrect === false
          ? "border-destructive/30 bg-destructive/5"
          : "border-border/30 bg-card/20"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/50">
            Q{index + 1}
          </span>
          <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 uppercase">
            {q.type === "mcq" ? "MCQ" : "Free"}
          </Badge>
        </div>
        {isCorrect === true && <CheckCircle2 className="size-4 text-green-500 shrink-0" />}
        {isCorrect === false && <XCircle className="size-4 text-destructive shrink-0" />}
      </div>

      {/* Question */}
      <p className="font-mono text-[11px] text-foreground leading-relaxed mb-3">
        {q.question}
      </p>

      {/* MCQ: show all options */}
      {q.type === "mcq" && q.options && (
        <div className="flex flex-col gap-1 mb-2">
          {q.options.map((opt, i) => {
            const isSelected = given === opt;
            const isRight = opt === q.correctAnswer;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-2 py-1 text-[10px] font-mono ${
                  isRight
                    ? "text-green-500"
                    : isSelected
                    ? "text-destructive"
                    : "text-muted-foreground/40"
                }`}
              >
                <span className="shrink-0">{letters[i]}.</span>
                <span>{opt}</span>
                {isRight && (
                  <span className="ml-auto text-[9px] uppercase tracking-widest text-green-500/70">
                    correct
                  </span>
                )}
                {isSelected && !isRight && (
                  <span className="ml-auto text-[9px] uppercase tracking-widest text-destructive/70">
                    your answer
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Free text: show given and correct */}
      {q.type === "free_text" && (
        <div className="space-y-2">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-0.5">
              Your answer
            </p>
            <p className="text-[11px] font-mono text-foreground/80">
              {given || <span className="text-muted-foreground/30 italic">No answer</span>}
            </p>
          </div>
          {q.correctAnswer && (
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-0.5">
                Correct answer
              </p>
              <p className="text-[11px] font-mono text-green-500">{q.correctAnswer}</p>
            </div>
          )}
          {/* Self-mark buttons */}
          {selfMark === null && onSelfMark && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => onSelfMark(true)}
                className="flex items-center gap-1 text-[10px] font-mono border border-green-500/40 text-green-500 px-2 py-1 hover:bg-green-500/10 transition-colors"
              >
                <CheckCircle2 className="size-3" />
                Got it right
              </button>
              <button
                type="button"
                onClick={() => onSelfMark(false)}
                className="flex items-center gap-1 text-[10px] font-mono border border-destructive/40 text-destructive px-2 py-1 hover:bg-destructive/10 transition-colors"
              >
                <XCircle className="size-3" />
                Got it wrong
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────

interface ResultsProps {
  questions: QuizQuestion[];
  answers: Record<string, string>;
  selfMarks: Record<string, boolean | null>;
  onSelfMark: (id: string, v: boolean) => void;
  onRetake: () => void;
  quizTitle: string;
}

function Results({
  questions,
  answers,
  selfMarks,
  onSelfMark,
  onRetake,
  quizTitle,
}: ResultsProps) {
  const graded = questions.map((q) => {
    if (q.type === "mcq") return gradeAnswer(q, answers[q.id] ?? "");
    return selfMarks[q.id] ?? null;
  });

  const marked = graded.filter((g) => g !== null).length;
  const correct = graded.filter((g) => g === true).length;
  const pct = marked > 0 ? Math.round((correct / marked) * 100) : 0;
  const pass = pct >= 70;
  const freeTextPending = questions.some(
    (q) => q.type === "free_text" && selfMarks[q.id] === null,
  );

  return (
    <div>
      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-border/40 bg-card/30 px-5 py-6 mb-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy
            className={`size-5 ${pass ? "text-primary" : "text-muted-foreground/40"}`}
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            {quizTitle}
          </span>
        </div>

        <p className="text-5xl font-black tabular-nums">
          {freeTextPending ? "–%" : `${pct}%`}
        </p>

        {!freeTextPending && (
          <p
            className={`mt-1 text-[11px] font-mono uppercase tracking-widest font-semibold ${
              pass ? "text-green-500" : "text-destructive"
            }`}
          >
            {pass ? "Passed" : "Failed"}
          </p>
        )}

        <p className="mt-3 text-[10px] font-mono text-muted-foreground/50">
          {correct} / {marked} correct
          {freeTextPending && (
            <span className="ml-2 text-amber-500/80">· mark free-text below</span>
          )}
        </p>

        <button
          type="button"
          onClick={onRetake}
          className="mt-4 inline-flex items-center gap-1.5 border border-border/50 px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
        >
          <RotateCcw className="size-3" />
          Retake
        </button>
      </motion.div>

      {/* Per-question review */}
      <div className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <ReviewItem
            key={q.id}
            q={q}
            given={answers[q.id] ?? ""}
            index={i}
            selfMark={q.type === "free_text" ? (selfMarks[q.id] ?? null) : null}
            onSelfMark={
              q.type === "free_text"
                ? (v) => onSelfMark(q.id, v)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selfMarks, setSelfMarks] = useState<Record<string, boolean | null>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api
      .get<{ data: QuizDetail }>(`/app/quizzes/${id}`)
      .then((res) => {
        const q = res.data?.data ?? null;
        setQuiz(q);
        if (q) setQuestions(flattenQuestions(q));
      })
      .catch(() => setError("Failed to load quiz."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAnswer = (val: string) => {
    const q = questions[current];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent((c) => c + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleSubmit = () => setSubmitted(true);

  const handleRetake = () => {
    setCurrent(0);
    setAnswers({});
    setSelfMarks({});
    setSubmitted(false);
  };

  const handleSelfMark = (qId: string, v: boolean) => {
    setSelfMarks((prev) => ({ ...prev, [qId]: v }));
  };

  const currentQuestion = questions[current];
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] ?? "") : "";
  const isLast = current === questions.length - 1;

  // ── Render ──

  if (isLoading) {
    return (
      <div className="min-h-full px-4 pt-6 pb-8">
        <div className="mx-auto max-w-2xl flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-card/40 border border-border/30" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-full px-4 pt-6 pb-8">
        <div className="mx-auto max-w-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive">
          {error ?? "Quiz not found."}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-full px-4 pt-6 pb-8">
        <div className="mx-auto max-w-2xl border border-border/30 px-4 py-3 font-mono text-sm text-muted-foreground">
          This quiz has no questions.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 pt-2 pb-12">
      <div className="mx-auto max-w-2xl">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => router.push(`/app/quizzes/${id}`)}
            className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground transition-colors uppercase tracking-widest"
          >
            <ChevronLeft className="size-3.5" />
            Back
          </button>
          <span className="text-[10px] font-mono text-muted-foreground/40 truncate max-w-[50%] text-right">
            {quiz.title}
          </span>
        </div>

        {!submitted ? (
          <>
            <ProgressBar current={current} total={questions.length} />

            <div className="mt-6 min-h-[24rem] border border-border/40 bg-card/20 px-6 py-6">
              <AnimatePresence mode="wait">
                <QuestionCard
                  key={currentQuestion.id}
                  q={currentQuestion}
                  index={current}
                  total={questions.length}
                  answer={currentAnswer}
                  onAnswer={handleAnswer}
                />
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-[10px] font-mono"
                onClick={handlePrev}
                disabled={current === 0}
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>

              <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums">
                {current + 1} / {questions.length}
              </span>

              {isLast ? (
                <Button
                  size="sm"
                  className="h-8 gap-1 text-[10px] font-mono"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-[10px] font-mono"
                  onClick={handleNext}
                >
                  Next
                  <ChevronRight className="size-3.5" />
                </Button>
              )}
            </div>

            {/* Jump to unanswered hint */}
            {isLast && Object.keys(answers).length < questions.length && (
              <p className="mt-3 text-center text-[10px] font-mono text-amber-500/70">
                {questions.length - Object.keys(answers).length} question
                {questions.length - Object.keys(answers).length !== 1 ? "s" : ""} unanswered
              </p>
            )}
          </>
        ) : (
          <div className="mt-6">
            <Results
              questions={questions}
              answers={answers}
              selfMarks={selfMarks}
              onSelfMark={handleSelfMark}
              onRetake={handleRetake}
              quizTitle={quiz.title}
            />
          </div>
        )}
      </div>
    </div>
  );
}
