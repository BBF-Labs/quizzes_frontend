"use client";

import { useEffect, useState, useCallback, useRef, use, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  QuizQuestionCard,
  type FeedbackState,
} from "@/components/app/quizzes/question-renderer";
import { QuizReviewResults } from "@/components/app/quizzes/quiz-review-results";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useGradeQuizAnswers } from "@/hooks/app/use-app-library";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { QuizConfigScreen } from "@/components/app/quizzes/quiz-config-screen";
import { answersMatch } from "@/lib/quiz-answer";
import type {
  QuizDetail,
  QuizQuestion,
  ZGradeResultItem,
  QuizConfig,
} from "@/types/session";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "config" | "quiz" | "results";

// ─── Misc helpers ─────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(quiz: QuizDetail, config: QuizConfig): QuizQuestion[] {
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();
  const qs = quiz.lectures
    .flatMap((l, li) =>
      l.topics.flatMap((t, ti) => {
        if (!config.selectedKeys.includes(`${li}:${ti}`)) return [];
        return (t.questions ?? []) as QuizQuestion[];
      }),
    )
    .filter(Boolean)
    .filter((q) => {
      const textKey = q.question?.trim().toLowerCase() ?? "";
      if ((q.id && seenIds.has(q.id)) || (textKey && seenTexts.has(textKey)))
        return false;
      if (q.id) seenIds.add(q.id);
      if (textKey) seenTexts.add(textKey);
      return true;
    });
  return config.shuffle ? shuffle(qs) : qs;
}

function isFreeResponseType(type: QuizQuestion["type"]): boolean {
  return (
    type === "free_text" ||
    type === "short_answer" ||
    type === "essay" ||
    type === "fill_in_blank" ||
    type === "fill_in"
  );
}

// QuestionCard and OptionBtn are now QuizQuestionCard / QuizOptionBtn from question-renderer.tsx
const QuestionCard = QuizQuestionCard;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function QuizTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gradeQuiz = useGradeQuizAnswers();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [screen, setScreen] = useState<Screen>("config");

  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [immediateResults, setImmediateResults] = useState<
    Record<string, FeedbackState>
  >({});
  const [selfMarks, setSelfMarks] = useState<Record<string, boolean | null>>(
    {},
  );
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, boolean>>(
    {},
  );
  const [zResults, setZResults] = useState<Record<string, ZGradeResultItem>>(
    {},
  );
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const [timerRemaining, setTimerRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentParam = searchParams.get("q");

  // Live score for header pill (mirrors public take page)
  const liveScore = useMemo(() => {
    return questions.filter((qq) => {
      if (!qq) return false;
      if (qq.options && qq.options.length > 0) {
        return answersMatch(qq.type, answers[qq.id], qq.correctAnswer);
      }
      if (zResults[qq.id]) return zResults[qq.id].isCorrect;
      return false;
    }).length;
  }, [questions, answers, zResults]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(() => {
    stopTimer();
    const marks: Record<string, boolean | null> = {};
    questions.forEach((q) => {
      if (isFreeResponseType(q.type)) marks[q.id] = null;
    });
    setSelfMarks(marks);
    setScreen("results");
  }, [questions, stopTimer]);

  const handleAnswer = useCallback(
    (val: string) => {
      const q = questions[current];
      if (!q) return;

      setAnswers((prev) => ({ ...prev, [q.id]: val }));

      if (
        config?.feedbackMode === "immediate" &&
        (q.type === "mcq" || q.type === "true_false")
      ) {
        const correct = q.correctAnswer;
        const isCorrect = correct
          ? answersMatch(q.type, val, String(correct))
          : null;
        const result: FeedbackState =
          isCorrect === true ? "correct" : isCorrect === false ? "wrong" : null;
        setImmediateResults((prev) => ({ ...prev, [q.id]: result }));

        if (result === "correct") {
          setStreak((s) => {
            const next = s + 1;
            setMaxStreak((m) => Math.max(m, next));
            return next;
          });
        } else {
          setStreak(0);
        }

        if (config.autoNext && result !== null) {
          setTimeout(() => {
            setCurrent((c) => {
              if (c < questions.length - 1) return c + 1;
              handleSubmit();
              return c;
            });
          }, 1400);
        }
      }
    },
    [config, current, questions, handleSubmit],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (screen !== "quiz" || !config) return;
      const q = questions[current];
      if (!q) return;

      if (q.type === "mcq" && q.options) {
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < q.options.length) {
          handleAnswer(q.options[idx]);
        }
      }
      if (
        e.key === "ArrowRight" ||
        (e.key === " " && !isFreeResponseType(q.type))
      ) {
        e.preventDefault();
        if (current < questions.length - 1) setCurrent((c) => c + 1);
      }
      if (e.key === "ArrowLeft") {
        if (current > 0) setCurrent((c) => c - 1);
      }
    },
    [screen, config, questions, current, immediateResults, handleAnswer],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (screen !== "quiz") return;
    if (currentParam === String(current + 1)) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set("q", String(current + 1));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [screen, current, router, pathname, searchParams]);

  useEffect(() => {
    api
      .get<{ data: QuizDetail }>(`/app/quizzes/${id}`)
      .then((res) => {
        const q = res.data?.data ?? null;
        setQuiz(q);
        if (q) {
          useBreadcrumbStore.getState().setDynamicTitle(q.title);
        }
      })
      .catch(() => setLoadError("Failed to load quiz."))
      .finally(() => setIsLoading(false));

    return () => useBreadcrumbStore.getState().setDynamicTitle(null);
  }, [id]);

  useEffect(() => {
    if (screen !== "quiz" || !config || config.timerMode !== "per_question")
      return;
    stopTimer();
    const timeout = setTimeout(() => setTimerRemaining(config.timerSeconds), 0);
    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          stopTimer();
          setCurrent((c) => Math.min(c + 1, questions.length - 1));
          return config.timerSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearTimeout(timeout);
      stopTimer();
    };
  }, [current, screen, config, questions.length, stopTimer]);

  useEffect(() => {
    if (screen !== "quiz" || !config || config.timerMode !== "total") return;
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          stopTimer();
          setScreen("results");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return stopTimer;
  }, [screen, config?.timerMode, config?.timerSeconds, stopTimer]);

  const startQuiz = useCallback(
    (cfg: QuizConfig) => {
      setConfig(cfg);

      const quizWithQuestions: QuizDetail = quiz!;

      const qs = buildQuestions(quizWithQuestions, cfg);
      setQuestions(qs);
      const qFromUrl = Number(currentParam || "1");
      const nextCurrent = Number.isFinite(qFromUrl)
        ? Math.max(
            0,
            Math.min(Math.floor(qFromUrl) - 1, Math.max(qs.length - 1, 0)),
          )
        : 0;
      setCurrent(nextCurrent);
      setAnswers({});
      setImmediateResults({});
      setStreak(0);
      setMaxStreak(0);

      setTimerRemaining(cfg.timerSeconds);
      setScreen("quiz");
    },
    [quiz, currentParam],
  );

  const handleRetake = useCallback(() => {
    stopTimer();
    setAnswers({});
    setImmediateResults({});
    setSelfMarks({});
    setZResults({});
    setStreak(0);
    setMaxStreak(0);
    setScreen("config");
  }, [stopTimer]);

  const handleGradeWithZ = useCallback(async () => {
    if (!quiz || !config) return;
    const freeTextAnswered = questions.filter(
      (q) => isFreeResponseType(q.type) && answers[q.id] && !zResults[q.id],
    );
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
    } catch (err: any) {
      if (err?.response?.status === 403) {
        toast.error("Upgrade required.", {
          description: "AI grading with Z is available on paid plans.",
          action: { label: "Upgrade", onClick: () => router.push("/pricing") },
        });
      } else {
        toast.error("Grading failed. Please try again.");
      }
    }
  }, [quiz, config, questions, answers, zResults, id, gradeQuiz, router]);

  if (isLoading) {
    return (
      <div className="min-h-full px-4 pt-6 pb-8">
        <div className="mx-auto max-w-2xl flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg h-12 animate-pulse bg-card/40 border border-border/20"
            />
          ))}
        </div>
      </div>
    );
  }

  if (loadError || !quiz) {
    return (
      <div className="min-h-full px-4 pt-6 pb-8">
        <div className="rounded-lg mx-auto max-w-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive">
          {loadError ?? "Quiz not found."}
        </div>
      </div>
    );
  }

  const currentQ = questions[current];
  const currentAnswer = currentQ ? (answers[currentQ.id] ?? "") : "";
  const currentFeedback = currentQ
    ? (immediateResults[currentQ.id] ?? null)
    : null;

  if (screen === "config") {
    return (
      <div className="py-8">
        <QuizConfigScreen
          quiz={quiz}
          showZGrading
          onStart={(cfg) => startQuiz(cfg)}
        />
      </div>
    );
  }

  if (screen === "results" && config) {
    return (
      <QuizReviewResults
        questions={questions}
        userAnswers={answers}
        zGradingResults={Object.values(zResults)}
        config={config}
        onReset={handleRetake}
        onGradeWithZ={handleGradeWithZ}
        isGradingZ={gradeQuiz.isPending}
        quizTitle={quiz.title}
      />
    );
  }

  if (!config || !currentQ) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="size-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] bg-[#F7F9FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Header Status Bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
              SECTION 01
            </p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Question {current + 1} of {questions.length}
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-700 shadow-2xs">
            {liveScore} correct
          </span>
        </div>

        {/* Live Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <QuestionCard
              q={currentQ}
              index={current}
              total={questions.length}
              answer={currentAnswer}
              onAnswer={handleAnswer}
              feedbackState={currentFeedback}
              mode={config.feedbackMode}
              disabled={false}
              showHints={config.showHints}
              hintsRevealed={hintsRevealed}
              onRevealHint={(qid) =>
                setHintsRevealed((h) => ({ ...h, [qid]: true }))
              }
              streak={streak}
            />
          </motion.div>
        </AnimatePresence>

        {/* Floating Bottom Navigation Action Bar */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-3 shadow-xl flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
          >
            ← Previous
          </button>

          <button
            type="button"
            onClick={() => {
              if (!config.allowSkip) return;
              setCurrent((c) => Math.min(c + 1, questions.length - 1));
            }}
            disabled={!config.allowSkip || current >= questions.length - 1}
            className="text-xs font-extrabold text-slate-500 hover:text-slate-900 transition disabled:opacity-40"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={() => {
              if (current < questions.length - 1) {
                if (!config.allowSkip && !currentAnswer) return;
                setCurrent((c) => c + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={!currentAnswer && !config.allowSkip}
            className="rounded-2xl bg-[#0C60FC] px-6 py-3 text-xs font-extrabold text-white hover:bg-blue-700 transition shadow-md disabled:opacity-40"
          >
            {current === questions.length - 1 ? "Finish quiz →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
