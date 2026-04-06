"use client";

import { use, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  SkipForward,
  Clock,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSystemQuiz } from "@/hooks/app/use-quizzes";
import { useGradeQuizAnswers } from "@/hooks/app/use-app-library";
import { useAuth } from "@/contexts/auth-context";
import {
  QuizQuestionCard,
  type FeedbackState,
} from "@/components/app/quizzes/question-renderer";
import { QuizConfigScreen } from "@/components/app/quizzes/quiz-config-screen";
import type {
  QuizDetail,
  QuizQuestion,
  QuizConfig,
  ZGradeResultItem,
} from "@/types/session";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenQuestions(
  lectures: NonNullable<ReturnType<typeof useSystemQuiz>["data"]>["lectures"],
): QuizQuestion[] {
  return (lectures || []).flatMap((l) =>
    (l.topics || []).flatMap((t) => {
      return (t.questions || []).filter(
        (q) => q && typeof q !== "string",
      ) as QuizQuestion[];
    }),
  );
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
  hasFreeText,
  isAuthenticated,
  isGrading,
  onRetake,
  onBack,
  onGradeWithZ,
}: {
  score: number;
  total: number;
  passed: boolean;
  passingScore: number;
  hasFreeText: boolean;
  isAuthenticated: boolean;
  isGrading: boolean;
  onRetake: () => void;
  onBack: () => void;
  onGradeWithZ: () => void;
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
          passed
            ? "border-green-500/40 bg-green-500/10"
            : "border-destructive/40 bg-destructive/10"
        }`}
      >
        <Trophy
          className={`size-8 ${passed ? "text-green-500" : "text-destructive"}`}
        />
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

      {/* Grade with Z — authenticated only, when free-text answers exist */}
      {isAuthenticated && hasFreeText && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-[11px] font-mono gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
          onClick={onGradeWithZ}
          disabled={isGrading}
        >
          {isGrading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          {isGrading ? "Grading…" : "Grade with Z"}
        </Button>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[11px] font-mono gap-1"
          onClick={onBack}
        >
          <ChevronLeft className="size-3" />
          Back
        </Button>
        <Button
          size="sm"
          className="h-8 text-[11px] font-mono gap-1"
          onClick={onRetake}
        >
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
  const { isAuthenticated } = useAuth();
  const gradeQuiz = useGradeQuizAnswers();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [immediateResults, setImmediateResults] = useState<
    Record<string, "correct" | "wrong" | null>
  >({});
  const [zResults, setZResults] = useState<Record<string, ZGradeResultItem>>(
    {},
  );
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, boolean>>(
    {},
  );
  const [config, setConfig] = useState<QuizConfig | null>(null);

  const handleStart = (newConfig: QuizConfig) => {
    if (!quiz) return;
    setConfig(newConfig);
    const flat = flattenQuestions(quiz.lectures);
    setQuestions(newConfig.shuffle ? shuffle(flat) : flat);

    if (newConfig.timerMode === "total" && newConfig.timerSeconds > 0) {
      setTimeLeft(newConfig.timerSeconds);
    } else {
      setTimeLeft(null);
    }

    setStarted(true);
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || done) return;
    if (timeLeft <= 0) {
      setTimeout(() => setDone(true), 0);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => (v ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done]);

  const q = questions[current];

  const handleSelect = useCallback(
    (opt: string) => {
      if (!q) return;
      if (immediateResults[q.id]) return;
      setAnswers((prev) => ({ ...prev, [q.id]: opt }));
      if (config?.feedbackMode === "immediate") {
        const isCorrect = opt === q.correctAnswer;
        setImmediateResults((prev) => ({
          ...prev,
          [q.id]: isCorrect ? "correct" : "wrong",
        }));
      }
    },
    [q, immediateResults, config?.feedbackMode],
  );

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent((c) => c + 1);
    else setDone(true);
  };

  const handlePrev = () => setCurrent((c) => Math.max(0, c - 1));

  const handleSkip = () => handleNext();

  const handleRetake = () => {
    setAnswers({});
    setImmediateResults({});
    setZResults({});
    setHintsRevealed({});
    setCurrent(0);
    setDone(false);
    setStarted(false);
  };

  const handleGradeWithZ = useCallback(async () => {
    if (!quiz || !config) return;
    const freeTextAnswered = questions.filter((q) => {
      const isFreeType =
        q.type === "short_answer" ||
        q.type === "essay" ||
        q.type === "free_text" ||
        q.type === "fill_in_blank" ||
        q.type === "fill_in";
      return isFreeType && answers[q.id] && !zResults[q.id];
    });
    if (freeTextAnswered.length === 0) return;

    try {
      const result = await gradeQuiz.mutateAsync({
        quizId: id,
        answers: freeTextAnswered.map((q) => ({
          questionId: q.id,
          question: q.question,
          answer: answers[q.id] ?? "",
          correctAnswer: q.correctAnswer,
        })),
      });
      const byId: Record<string, ZGradeResultItem> = {};
      result.results.forEach((r: ZGradeResultItem) => {
        byId[r.questionId] = r;
      });
      setZResults((prev) => ({ ...prev, ...byId }));
    } catch {}
  }, [quiz, config, questions, answers, zResults, id, gradeQuiz]);

  const score = useMemo(() => {
    return questions.filter((q) => {
      if (!q) return false;
      // For MCQ/T-F: exact match
      if (q.options && q.options.length > 0) {
        return answers[q.id] === q.correctAnswer;
      }
      // For free-text: use Z grade if available
      if (zResults[q.id]) return zResults[q.id].isCorrect;
      return false;
    }).length;
  }, [questions, answers, zResults]);

  const pct = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;
  const passed = pct >= (quiz?.passingScore ?? 70);

  const hasFreeText = useMemo(
    () =>
      questions.some(
        (q) =>
          q.type === "short_answer" ||
          q.type === "essay" ||
          q.type === "free_text" ||
          q.type === "fill_in_blank" ||
          q.type === "fill_in",
      ),
    [questions],
  );

  if (isLoading || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <AlertCircle className="size-10 text-destructive/40 mb-4" />
        <h2 className="text-sm font-mono font-bold uppercase tracking-tight text-foreground">
          Failed to load quiz
        </h2>
        <p className="text-[11px] font-mono text-muted-foreground/60 mt-2 max-w-xs uppercase tracking-widest">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 font-mono text-[11px]"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="py-8">
        <QuizConfigScreen
          quiz={{ ...quiz, id: quiz._id } as QuizDetail}
          initialConfig={{
            timerMode: quiz.settings.timeLimit ? "total" : "none",
            timerSeconds: (quiz.settings.timeLimit || 0) * 60,
            showHints: quiz.settings.showHints,
            shuffle: quiz.settings.shuffleQuestions,
            feedbackMode: quiz.settings.showExplanations
              ? "immediate"
              : "deferred",
          }}
          onStart={handleStart}
        />
      </div>
    );
  }

  if (done) {
    return (
      <ResultsScreen
        score={score}
        total={questions.length}
        passed={passed}
        passingScore={quiz.passingScore ?? 70}
        hasFreeText={hasFreeText}
        isAuthenticated={isAuthenticated}
        isGrading={gradeQuiz.isPending}
        onRetake={handleRetake}
        onBack={() => router.back()}
        onGradeWithZ={handleGradeWithZ}
      />
    );
  }

  const feedbackState: FeedbackState =
    config?.feedbackMode === "immediate"
      ? (immediateResults[q?.id ?? ""] ?? null)
      : null;

  const isAnswered = q ? !!answers[q.id] : false;
  const progress = questions.length
    ? ((current + 1) / questions.length) * 100
    : 0;

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
                  timeLeft < 60
                    ? "text-destructive"
                    : "text-muted-foreground/50"
                }`}
              >
                <Clock className="size-3" />
                {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, "0")}
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
          <QuizQuestionCard
            q={q}
            index={current}
            total={questions.length}
            answer={answers[q.id] ?? ""}
            onAnswer={handleSelect}
            feedbackState={feedbackState}
            mode={config?.feedbackMode ?? "deferred"}
            disabled={false}
            showHints={config?.showHints ?? false}
            hintsRevealed={hintsRevealed}
            onRevealHint={(qid) =>
              setHintsRevealed((h) => ({ ...h, [qid]: true }))
            }
          />
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
