"use client";

import { use, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  SkipForward,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatNextAttemptTime,
  formatNextAttemptWindow,
} from "@/lib/attempt-window";
import { Button } from "@/components/ui/button";
import {
  useSystemQuiz,
  useStartSystemQuiz,
  useConfirmSystemQuizAttempt,
} from "@/hooks/app/use-quizzes";
import { useGradeQuizAnswers } from "@/hooks/app/use-app-library";
import { useAuth } from "@/contexts/auth-context";
import {
  QuizQuestionCard,
  type FeedbackState,
} from "@/components/app/quizzes/question-renderer";
import { QuizConfigScreen } from "@/components/app/quizzes/quiz-config-screen";
import { QuizContent } from "@/components/app/quizzes/quiz-content";
import { QuizReviewResults } from "@/components/app/quizzes/quiz-review-results";
import { answersMatch } from "@/lib/quiz-answer";
import type {
  QuizDetail,
  QuizQuestion,
  QuizConfig,
  ZGradeResultItem,
  SystemQuizDetail,
} from "@/types/session";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQuestions(
  quiz: SystemQuizDetail,
  config: QuizConfig,
): QuizQuestion[] {
  const selected = new Set(config.selectedKeys);
  const picked = (quiz.lectures || []).flatMap((l, li) =>
    (l.topics || []).flatMap((t, ti) => {
      if (!selected.has(`${li}:${ti}`)) return [];
      return (t.questions || []).filter(
        (q) => q && typeof q !== "string",
      ) as QuizQuestion[];
    }),
  );
  return config.shuffle ? shuffle(picked) : picked;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isFreeResponseType(type: QuizQuestion["type"]): boolean {
  return (
    type === "short_answer" ||
    type === "essay" ||
    type === "free_text" ||
    type === "fill_in_blank" ||
    type === "fill_in"
  );
}

// ─── View Answers Screen ──────────────────────────────────────────────────────

function ViewAnswersScreen({
  quiz,
  onBack,
}: {
  quiz: SystemQuizDetail;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[11px] font-mono gap-1"
          onClick={onBack}
        >
          <ChevronLeft className="size-3" />
          Back
        </Button>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
          {quiz.title}
        </span>
      </div>
      <QuizContent lectures={quiz.lectures} />
    </div>
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: quiz, isLoading, error } = useSystemQuiz(id);
  const { isAuthenticated } = useAuth();
  const gradeQuiz = useGradeQuizAnswers();
  const startQuiz = useStartSystemQuiz();
  const confirmQuiz = useConfirmSystemQuizAttempt();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [immediateResults, setImmediateResults] = useState<
    Record<string, "correct" | "wrong" | null>
  >({});
  const [zResults, setZResults] = useState<Record<string, ZGradeResultItem>>(
    {},
  );
  const [selfMarks, setSelfMarks] = useState<Record<string, boolean | null>>(
    {},
  );
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, boolean>>(
    {},
  );
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [viewQuiz, setViewQuiz] = useState<SystemQuizDetail | null>(null);
  const currentParam = searchParams.get("q");
  const isViewMode = searchParams.get("mode") === "view";

  const handleStart = async (newConfig: QuizConfig) => {
    try {
      const fullQuiz = await startQuiz.mutateAsync(id);
      if (!fullQuiz) return;
      setConfig(newConfig);
      const selectedQuestions = buildQuestions(fullQuiz, newConfig);
      setQuestions(selectedQuestions);
      setSelfMarks({});
      setStreak(0);
      setMaxStreak(0);
      const qFromUrl = Number(currentParam || "1");
      const nextCurrent = Number.isFinite(qFromUrl)
        ? Math.max(
            0,
            Math.min(
              Math.floor(qFromUrl) - 1,
              Math.max(selectedQuestions.length - 1, 0),
            ),
          )
        : 0;
      setCurrent(nextCurrent);

      if (newConfig.timerMode === "total" && newConfig.timerSeconds > 0) {
        setTimeLeft(newConfig.timerSeconds);
      } else {
        setTimeLeft(null);
      }

      setStarted(true);
    } catch (err: unknown) {
      const maybeError = err as {
        response?: {
          status?: number;
          data?: { errors?: { nextAttemptAt?: string } };
        };
        message?: string;
      };
      if (maybeError.response?.status === 403) {
        const nextAttemptAt: string | null =
          maybeError.response?.data?.errors?.nextAttemptAt ?? null;
        let description =
          "Upgrade to premium for unlimited attempts and advanced Z grading.";
        if (nextAttemptAt) {
          const timeWindow = formatNextAttemptWindow(nextAttemptAt);
          const atTime = formatNextAttemptTime(nextAttemptAt);
          if (timeWindow && atTime) {
            description = `Next attempt available in ${timeWindow} (${atTime}).`;
          }
        }
        toast.error("Daily limit reached.", {
          description,
          action: {
            label: "Upgrade",
            onClick: () => router.push("/pricing"),
          },
        });
      } else {
        toast.error(maybeError.message || "Failed to start quiz");
      }
    }
  };

  // Auto-start in view mode
  useEffect(() => {
    if (!isViewMode || !quiz || started) return;
    startQuiz
      .mutateAsync(id)
      .then((fullQuiz) => {
        if (!fullQuiz) return;
        setViewQuiz(fullQuiz);
        setStarted(true);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewMode, quiz]);

  useEffect(() => {
    if (!started || done || isViewMode) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set("q", String(current + 1));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [started, done, isViewMode, current, router, pathname, searchParams]);

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
      const isChoiceType = q.type === "mcq" || q.type === "true_false";
      setAnswers((prev) => ({ ...prev, [q.id]: opt }));
      if (isChoiceType && config?.feedbackMode === "immediate") {
        const isCorrect = answersMatch(q.type, opt, q.correctAnswer);
        setImmediateResults((prev) => ({
          ...prev,
          [q.id]: isCorrect ? "correct" : "wrong",
        }));
        if (isCorrect) {
          setStreak((currentStreak) => {
            const next = currentStreak + 1;
            setMaxStreak((best) => Math.max(best, next));
            return next;
          });
        } else {
          setStreak(0);
        }
      }
    },
    [q, config?.feedbackMode],
  );

  const handleNext = async () => {
    if (current < questions.length - 1) {
      if (!config?.allowSkip) {
        const answer = answers[questions[current]?.id];
        if (!answer) return;
      }
      setCurrent((c) => c + 1);
    } else {
      try {
        await confirmQuiz.mutateAsync(id);
      } catch {}
      setDone(true);
    }
  };

  const handlePrev = () => setCurrent((c) => Math.max(0, c - 1));

  const handleSkip = () => {
    if (!config?.allowSkip) return;
    if (current < questions.length - 1) setCurrent((c) => c + 1);
  };

  const handleRetake = () => {
    setAnswers({});
    setImmediateResults({});
    setZResults({});
    setSelfMarks({});
    setStreak(0);
    setMaxStreak(0);
    setHintsRevealed({});
    setCurrent(0);
    setDone(false);
    setStarted(false);
  };

  const handleGradeWithZ = useCallback(async () => {
    if (!quiz || !config) return;
    const freeTextAnswered = questions.filter((q) => {
      const isFreeType = isFreeResponseType(q.type);
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
    } catch (err: unknown) {
      const maybeError = err as { response?: { status?: number } };
      if (maybeError?.response?.status === 403) {
        toast.error("Upgrade required.", {
          description: "AI grading with Z is available on paid plans.",
          action: { label: "Upgrade", onClick: () => router.push("/pricing") },
        });
      } else {
        toast.error("Grading failed. Please try again.");
      }
    }
  }, [quiz, config, questions, answers, zResults, id, gradeQuiz, router]);

  const score = useMemo(() => {
    return questions.filter((q) => {
      if (!q) return false;
      // For MCQ/T-F: exact match
      if (q.options && q.options.length > 0) {
        return answersMatch(q.type, answers[q.id], q.correctAnswer);
      }
      // For free-text: use Z grade if available
      if (zResults[q.id]) return zResults[q.id].isCorrect;
      return false;
    }).length;
  }, [questions, answers, zResults]);

  if (isLoading || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="size-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center px-4">
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

  if (isViewMode) {
    if (startQuiz.isPending || !started) {
      return (
        <div className="flex items-center justify-center min-h-100">
          <div className="size-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
      );
    }
    return <ViewAnswersScreen quiz={viewQuiz!} onBack={() => router.back()} />;
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
          showZGrading
          onStart={handleStart}
          isLoading={startQuiz.isPending}
          error={startQuiz.error as Error | null}
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <QuizReviewResults
          questions={questions}
          answers={answers}
          selfMarks={selfMarks}
          onSelfMark={(id, v) =>
            setSelfMarks((previous) => ({ ...previous, [id]: v }))
          }
          zResults={zResults}
          onGradeWithZ={handleGradeWithZ}
          isGrading={gradeQuiz.isPending}
          onRetake={handleRetake}
          quizTitle={quiz.title}
          passingScore={quiz.passingScore ?? 70}
          maxStreak={maxStreak}
          config={
            config ?? {
              selectedKeys: [],
              feedbackMode: "deferred",
              timerMode: "none",
              timerSeconds: 0,
              autoNext: false,
              allowSkip: true,
              shuffle: false,
              passingScore: quiz.passingScore ?? 70,
              useZGrading: true,
              showHints: false,
            }
          }
          canUseZGrading={isAuthenticated}
          onBack={() => router.back()}
        />
      </div>
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
            {streak >= 2 && (
              <div className="rounded-(--radius) flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5">
                <Flame className="size-3 text-amber-500" />
                <span className="text-[9px] font-mono text-amber-500 font-semibold">
                  {streak}
                </span>
              </div>
            )}
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
            disabled={!config?.allowSkip || current >= questions.length - 1}
          >
            <SkipForward className="size-3" />
            Skip
          </Button>
          <Button
            size="sm"
            className="h-8 text-[10px] font-mono gap-1"
            onClick={handleNext}
            disabled={!isAnswered && !config?.allowSkip}
          >
            {current === questions.length - 1 ? "Finish" : "Next"}
            <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
