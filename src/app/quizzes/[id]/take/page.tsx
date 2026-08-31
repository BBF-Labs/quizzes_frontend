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
  const hintEnabled = quiz.settings.showHints;
  const totalQuestions = quiz.lectures.reduce(
    (sum, lecture) =>
      sum +
      lecture.topics.reduce(
        (topicSum, topic) =>
          topicSum +
          (topic.questions?.length ??
            topic.questionTypes?.reduce(
              (count, group) => count + (group.questions?.length ?? 0),
              0,
            ) ??
            topic.questionCount ??
            0),
        0,
      ),
    0,
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] bg-[#F7F9FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
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

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] bg-[#131B27] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-3">
            <p className="hand text-2xl text-[#DFFF61]">view answers ✦</p>
            <h1 className="display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Review the structure and every answer.
            </h1>
            <p className="max-w-md text-xs leading-5 text-slate-400 font-medium">
              Open each section to inspect the questions, correct answers, and
              hints where they are available.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold text-slate-200">
                {quiz.lectures.length} sections
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold text-slate-200">
                {totalQuestions} questions
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold text-slate-200">
                Hints {hintEnabled ? "on" : "off"}
              </span>
            </div>
          </div>

          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-[#DFFF61] bg-white/5 shadow-inner">
            <span className="text-4xl font-black text-white">
              {quiz.lectures.length}
            </span>
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#0C60FC]">
                  QUESTION REVIEW
                </p>
                <h2 className="text-lg font-bold text-slate-950">
                  Lectures and answers
                </h2>
              </div>
            </div>

            <QuizContent lectures={quiz.lectures} showHints={hintEnabled} />
          </div>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  SESSION SUMMARY
                </p>
                <h3 className="text-base font-bold text-slate-950 mt-1">
                  Quiz overview
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-100">
                  <p className="text-2xl font-extrabold text-[#0C60FC]">
                    {quiz.lectures.length}
                  </p>
                  <p className="mt-1 text-[9px] font-bold text-slate-500 uppercase">
                    SECTIONS
                  </p>
                </div>
                <div className="rounded-2xl bg-[#E9FFD3] p-4 border border-lime-200">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {totalQuestions}
                  </p>
                  <p className="mt-1 text-[9px] font-bold text-slate-600 uppercase">
                    QUESTIONS
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onBack}
                className="w-full rounded-2xl bg-[#0C60FC] py-3.5 text-center text-xs font-extrabold text-white hover:bg-blue-700 transition shadow-md"
              >
                Back to quiz
              </button>
            </div>
          </aside>
        </div>
      </div>
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
    if (currentParam === String(current + 1)) return;
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
      <QuizReviewResults
        questions={questions}
        userAnswers={answers}
        zGradingResults={Object.values(zResults)}
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
        onReset={handleRetake}
        onGradeWithZ={handleGradeWithZ}
        isGradingZ={gradeQuiz.isPending}
        quizTitle={quiz.title}
      />
    );
  }

  const feedbackState: FeedbackState =
    config?.feedbackMode === "immediate"
      ? (immediateResults[q?.id ?? ""] ?? null)
      : null;

  const isAnswered = q ? !!answers[q.id] : false;

  return (
    <div className="min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] bg-[#F7F9FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Header Status Bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
              SECTION 01 · {quiz?.title || "DIGITAL IMAGE PROCESSING"}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Question {current + 1} of {questions.length}
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-700 shadow-2xs">
            {score} correct
          </span>
        </div>

        {/* Live Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
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

        {/* Floating Bottom Navigation Action Bar */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-3 shadow-xl flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={current === 0}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
          >
            ← Previous
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={!config?.allowSkip || current >= questions.length - 1}
            className="text-xs font-extrabold text-slate-500 hover:text-slate-900 transition disabled:opacity-40"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!isAnswered && !config?.allowSkip}
            className="rounded-2xl bg-[#0C60FC] px-6 py-3 text-xs font-extrabold text-white hover:bg-blue-700 transition shadow-md disabled:opacity-40"
          >
            {current === questions.length - 1 ? "Finish quiz →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
