"use client";

import { use, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  SkipForward,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSystemQuiz } from "@/hooks/app/use-quizzes";
import type { QuizQuestion } from "@/types/session";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenQuestions(lectures: NonNullable<ReturnType<typeof useSystemQuiz>["data"]>["lectures"]): QuizQuestion[] {
  return lectures.flatMap((l) => l.topics.flatMap((t) => t.questions));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  score,
  total,
  passed,
  passingScore,
  onRetake,
  onBack,
}: {
  score: number;
  total: number;
  passed: boolean;
  passingScore: number;
  onRetake: () => void;
  onBack: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-16 text-center"
    >
      <div
        className={`flex size-20 items-center justify-center border-2 ${
          passed ? "border-green-500/40 bg-green-500/10" : "border-destructive/40 bg-destructive/10"
        }`}
      >
        <Trophy className={`size-8 ${passed ? "text-green-500" : "text-destructive"}`} />
      </div>
      <div>
        <p className="text-4xl font-black font-mono tracking-tight">{pct}%</p>
        <p className="mt-1 text-sm font-mono text-muted-foreground/60">
          {score} / {total} correct
        </p>
        <p
          className={`mt-2 text-[11px] font-mono uppercase tracking-widest font-bold ${
            passed ? "text-green-500" : "text-destructive"
          }`}
        >
          {passed ? "Passed" : `Failed — passing score is ${passingScore}%`}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" className="h-8 text-[11px] font-mono gap-1" onClick={onBack}>
          <ChevronLeft className="size-3" />
          Back
        </Button>
        <Button size="sm" className="h-8 text-[11px] font-mono gap-1" onClick={onRetake}>
          <RotateCcw className="size-3" />
          Retake
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemQuizTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: quiz, isLoading, error } = useSystemQuiz(id);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Build question list when quiz loads
  useEffect(() => {
    if (!quiz) return;
    const flat = flattenQuestions(quiz.lectures);
    setQuestions(quiz.settings.shuffleQuestions ? shuffle(flat) : flat);
    if (quiz.settings.timeLimit) setTimeLeft(quiz.settings.timeLimit * 60);
  }, [quiz]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || done) return;
    if (timeLeft <= 0) { setDone(true); return; }
    const t = setTimeout(() => setTimeLeft((v) => (v ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done]);

  const q = questions[current];

  const handleSelect = useCallback(
    (opt: string) => {
      if (!q) return;
      if (revealed[q.id]) return;
      setAnswers((prev) => ({ ...prev, [q.id]: opt }));
      if (quiz?.settings.showExplanations) {
        setRevealed((prev) => ({ ...prev, [q.id]: true }));
      }
    },
    [q, revealed, quiz],
  );

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent((c) => c + 1);
    else setDone(true);
  };

  const handlePrev = () => setCurrent((c) => Math.max(0, c - 1));

  const handleSkip = () => handleNext();

  const handleRetake = () => {
    if (!quiz) return;
    const flat = flattenQuestions(quiz.lectures);
    setQuestions(quiz.settings.shuffleQuestions ? shuffle(flat) : flat);
    setAnswers({});
    setRevealed({});
    setCurrent(0);
    setDone(false);
    if (quiz.settings.timeLimit) setTimeLeft(quiz.settings.timeLimit * 60);
  };

  const score = useMemo(
    () => questions.filter((q) => answers[q.id] === q.correctAnswer).length,
    [questions, answers],
  );
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const passed = pct >= (quiz?.passingScore ?? 70);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="font-mono text-sm text-destructive">Failed to load quiz.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  if (done || questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-4">
        <ResultsScreen
          score={score}
          total={questions.length}
          passed={passed}
          passingScore={quiz.passingScore}
          onRetake={handleRetake}
          onBack={() => router.push(`/quizzes/${id}`)}
        />
      </div>
    );
  }

  const isAnswered = !!answers[q.id];
  const isRevealed = !!revealed[q.id];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Progress bar + meta */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
            {current + 1} / {questions.length}
          </span>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <span
                className={`text-[10px] font-mono flex items-center gap-1 ${
                  timeLeft < 60 ? "text-destructive" : "text-muted-foreground/50"
                }`}
              >
                <Clock className="size-3" />
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            )}
            <span className="text-[10px] font-mono text-muted-foreground/50">
              {score} correct
            </span>
          </div>
        </div>
        <div className="h-1 bg-border/30 w-full">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
          className="mb-6"
        >
          <div className="flex items-start gap-2 mb-5">
            <Badge variant="outline" className="shrink-0 text-[8px] font-mono h-4 px-1.5 uppercase mt-0.5">
              {q.type === "mcq" ? "MCQ" : q.type === "true_false" ? "T/F" : q.type}
            </Badge>
            <p className="font-mono text-sm text-foreground leading-relaxed">{q.question}</p>
          </div>

          {/* Options */}
          {q.options && q.options.length > 0 ? (
            <div className="flex flex-col gap-2">
              {q.options.map((opt, i) => {
                const isSelected = answers[q.id] === opt;
                const isCorrect = opt === q.correctAnswer;
                let cls =
                  "w-full text-left border px-4 py-3 font-mono text-[12px] transition-all flex items-center gap-3";
                if (!isRevealed) {
                  cls += isSelected
                    ? " border-primary bg-primary/10 text-foreground"
                    : " border-border/40 bg-card/30 text-muted-foreground hover:border-primary/50 hover:bg-primary/5";
                } else {
                  if (isCorrect)
                    cls += " border-green-500/40 bg-green-500/10 text-green-500";
                  else if (isSelected)
                    cls += " border-destructive/40 bg-destructive/10 text-destructive";
                  else cls += " border-border/30 bg-card/20 text-muted-foreground/40";
                }
                return (
                  <button key={opt} type="button" onClick={() => handleSelect(opt)} className={cls}>
                    <span className="shrink-0 w-5 h-5 border border-current/40 flex items-center justify-center text-[9px] font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {isRevealed && isCorrect && (
                      <CheckCircle2 className="ml-auto size-3.5 text-green-500 shrink-0" />
                    )}
                    {isRevealed && isSelected && !isCorrect && (
                      <XCircle className="ml-auto size-3.5 text-destructive shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Free text answer */
            <div className="space-y-2">
              <textarea
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                disabled={isRevealed}
                rows={3}
                placeholder="Type your answer…"
                className="w-full border border-border/40 bg-card/30 px-3 py-2 font-mono text-[12px] focus:outline-none focus:border-primary/50 resize-none transition-colors"
              />
              {!isRevealed && (
                <Button
                  size="sm"
                  className="h-7 text-[10px] font-mono"
                  disabled={!answers[q.id]?.trim()}
                  onClick={() => setRevealed((prev) => ({ ...prev, [q.id]: true }))}
                >
                  Check Answer
                </Button>
              )}
            </div>
          )}

          {/* Explanation */}
          {isRevealed && quiz.settings.showExplanations && q.correctAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 border border-primary/20 bg-primary/5 px-4 py-3"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary/60 mb-1">
                Correct Answer
              </p>
              <p className="text-[11px] font-mono text-foreground">{q.correctAnswer}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[10px] font-mono gap-1"
          onClick={handlePrev}
          disabled={current === 0}
        >
          <ChevronLeft className="size-3" />
          Prev
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] font-mono gap-1 text-muted-foreground/50"
            onClick={handleSkip}
          >
            <SkipForward className="size-3" />
            Skip
          </Button>
          <Button
            size="sm"
            className="h-8 text-[10px] font-mono gap-1"
            onClick={handleNext}
            disabled={!isAnswered && q.options && q.options.length > 0}
          >
            {current === questions.length - 1 ? "Finish" : "Next"}
            <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
