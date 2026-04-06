"use client";

import { useEffect, useState, useCallback, useRef, use, useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Zap,
  Flame,
  SkipForward,
  Settings2,
  Clock,
  Target,
  Shuffle,
  BookOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { useGradeQuizAnswers } from "@/hooks/app/use-app-library";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { QuizConfigScreen } from "@/components/app/quizzes/quiz-config-screen";
import type {
  QuizDetail,
  QuizQuestion,
  ZGradeResultItem,
  QuizConfig,
} from "@/types/session";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedProgress {
  config: QuizConfig;
  current: number;
  answers: Record<string, string>;
  immediateResults: Record<string, "correct" | "wrong" | null>;
  streak: number;
  maxStreak: number;
  questionIds: string[];
  savedAt: string;
}

type FeedbackState = "correct" | "wrong" | null;
type Screen = "resume" | "config" | "quiz" | "results";

// ─── Storage helpers ──────────────────────────────────────────────────────────

const storageKey = (id: string) => `qz-quiz-${id}`;

function saveProgress(id: string, data: SavedProgress) {
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(data));
  } catch {}
}

function loadProgress(id: string): SavedProgress | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    return raw ? (JSON.parse(raw) as SavedProgress) : null;
  } catch {
    return null;
  }
}

function clearProgress(id: string) {
  try {
    localStorage.removeItem(storageKey(id));
  } catch {}
}

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
  const qs = quiz.lectures
    .flatMap((l, li) =>
      l.topics.flatMap((t, ti) => {
        if (!config.selectedKeys.includes(`${li}:${ti}`)) return [];
        return t.questions ?? [];
      }),
    )
    .filter(Boolean);
  return config.shuffle ? shuffle(qs) : qs;
}

function fmtSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Resume prompt ─────────────────────────────────────────────────────────────

function ResumePrompt({
  savedAt,
  answered,
  total,
  onResume,
  onRestart,
}: {
  savedAt: string;
  answered: number;
  total: number;
  onResume: () => void;
  onRestart: () => void;
}) {
  const [ago, setAgo] = useState("");

  useEffect(() => {
    const calculate = () => {
      const diff = Date.now() - new Date(savedAt).getTime();
      if (diff < 60000) return "just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      return `${Math.floor(diff / 3600000)}h ago`;
    };
    // Use setTimeout to avoid synchronous state update in effect
    const timeout = setTimeout(() => setAgo(calculate()), 0);
    const interval = setInterval(() => setAgo(calculate()), 60000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [savedAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-(--radius) border border-border/40 bg-card/30 px-6 py-8 text-center max-w-sm mx-auto mt-16"
    >
      <div className="flex justify-center mb-4">
        <div className="rounded-(--radius) size-12 border border-primary/30 bg-primary/5 flex items-center justify-center">
          <BookOpen className="size-5 text-primary/70" />
        </div>
      </div>
      <p className="font-mono text-sm font-bold text-foreground mb-1">
        Resume where you left off?
      </p>
      <p className="text-[11px] font-mono text-muted-foreground/60 mb-1">
        {answered} of {total} answered · saved {ago}
      </p>
      <div className="flex gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-[10px] font-mono"
          onClick={onRestart}
        >
          Start over
        </Button>
        <Button
          size="sm"
          className="flex-1 h-8 text-[10px] font-mono"
          onClick={onResume}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Config screen ─────────────────────────────────────────────────────────────

function ConfigScreen({
  quiz,
  onStart,
}: {
  quiz: QuizDetail;
  onStart: (config: QuizConfig) => void;
}) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [feedbackMode, setFeedbackMode] = useState<"immediate" | "deferred">(
    "immediate",
  );
  const [timerMode, setTimerMode] = useState<"none" | "per_question" | "total">(
    "none",
  );
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [autoNext, setAutoNext] = useState(true);
  const [allowSkip, setAllowSkip] = useState(true);
  const [doShuffle, setDoShuffle] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [useZGrading, setUseZGrading] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const totalSelected = quiz.lectures.reduce(
    (s, l, li) =>
      s +
      l.topics.reduce(
        (ts, t, ti) =>
          ts + (selectedKeys.includes(`${li}:${ti}`) ? t.questions.length : 0),
        0,
      ),
    0,
  );

  const toggleTopic = (key: string) =>
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const toggleLecture = (li: number) => {
    const topicKeys = quiz.lectures[li].topics.map((_, ti) => `${li}:${ti}`);
    const allOn = topicKeys.every((k) => selectedKeys.includes(k));
    setSelectedKeys((prev) =>
      allOn
        ? prev.filter((k) => !topicKeys.includes(k))
        : [...new Set([...prev, ...topicKeys])],
    );
  };

  const hasFreeTxt = quiz.lectures.some((l) =>
    l.topics.some((t) => t.questions.some((q) => q.type === "free_text")),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary/80 mb-1">
          Quiz Setup
        </p>
        <h1 className="text-xl font-black tracking-tight truncate">
          {quiz.title}
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {/* Quiz Range */}
        <section className="rounded-(--radius) border border-border/40 bg-card/20 px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
              Quiz Range
            </p>
            <span className="text-[10px] font-mono text-primary/70 font-semibold">
              {totalSelected} questions
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {quiz.lectures.map((l, li) => {
              const topicKeys = l.topics.map((_, ti) => `${li}:${ti}`);
              const allOn = topicKeys.every((k) => selectedKeys.includes(k));
              const someOn = topicKeys.some((k) => selectedKeys.includes(k));
              return (
                <div
                  key={li}
                  className="rounded-(--radius) border border-border/20 px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => toggleLecture(li)}
                    className="w-full flex items-center gap-2 text-left"
                  >
                    <span
                      className={`size-3.5 border shrink-0 flex items-center justify-center ${allOn ? "border-primary bg-primary" : someOn ? "border-primary/50 bg-primary/20" : "border-border/50"}`}
                    >
                      {(allOn || someOn) && (
                        <span className="block size-1.5 bg-primary-foreground" />
                      )}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-foreground flex-1 truncate">
                      {l.lectureTitle}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground/40">
                      {l.topics.reduce((s, t) => s + t.questions.length, 0)} Qs
                    </span>
                  </button>
                  {l.topics.length > 1 && (
                    <div className="ml-5 mt-1.5 flex flex-col gap-1">
                      {l.topics.map((t, ti) => {
                        const key = `${li}:${ti}`;
                        const on = selectedKeys.includes(key);
                        return (
                          <button
                            key={ti}
                            type="button"
                            onClick={() => toggleTopic(key)}
                            className="flex items-center gap-2 text-left"
                          >
                            <span
                              className={`size-3 border shrink-0 flex items-center justify-center ${on ? "border-primary bg-primary" : "border-border/40"}`}
                            >
                              {on && (
                                <span className="block size-1 bg-primary-foreground" />
                              )}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground/70">
                              {t.topicTitle}
                            </span>
                            <span className="text-[9px] font-mono text-muted-foreground/30">
                              {t.questions.length}Q
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Feedback mode */}
        <section className="rounded-(--radius) border border-border/40 bg-card/20 px-4 py-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 mb-3">
            Feedback
          </p>
          <div className="flex gap-2">
            {(["immediate", "deferred"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFeedbackMode(m)}
                className={`rounded-(--radius) flex-1 py-2 border text-[10px] font-mono uppercase tracking-widest font-semibold transition-all ${
                  feedbackMode === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 text-muted-foreground/60 hover:border-border/70"
                }`}
              >
                {m === "immediate" ? "Immediate" : "After Quiz"}
              </button>
            ))}
          </div>
          {feedbackMode === "immediate" && (
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setAutoNext((v) => !v)}
                className={`size-4 border flex items-center justify-center shrink-0 ${autoNext ? "border-primary bg-primary" : "border-border/50"}`}
              >
                {autoNext && (
                  <CheckCircle2 className="size-2.5 text-primary-foreground" />
                )}
              </button>
              <span className="text-[10px] font-mono text-muted-foreground/70">
                Auto-advance after answering MCQ
              </span>
            </label>
          )}
        </section>

        {/* Timer Slider */}
        <section className="rounded-(--radius) border border-border/40 bg-card/20 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
              Timer (Minutes)
            </p>
            <Badge variant="outline" className="text-[10px] font-mono h-5">
              {timerSeconds === 0
                ? "Unlimited"
                : `${Math.floor(timerSeconds / 60)}m`}
            </Badge>
          </div>
          <Slider
            value={[Math.floor(timerSeconds / 60)]}
            min={0}
            max={120}
            step={5}
            onValueChange={([v]) => {
              setTimerSeconds(v * 60);
              setTimerMode(v === 0 ? "none" : "total");
            }}
            className="py-4"
          />
          <p className="text-[10px] font-mono text-muted-foreground/40 mt-2">
            Slide from 0 to 120 minutes. Custom timing allowed.
          </p>
        </section>

        {/* Passing score + options row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="rounded-(--radius) border border-border/40 bg-card/20 px-4 py-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 mb-3">
              Passing Score
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {[50, 60, 70, 80, 90].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPassingScore(s)}
                  className={`rounded-(--radius) px-3 py-1 border text-[10px] font-mono font-semibold transition-all ${
                    passingScore === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 text-muted-foreground/60 hover:border-border/70"
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-(--radius) border border-border/40 bg-card/20 px-4 py-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 mb-3">
              Options
            </p>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "Allow skipping questions",
                  value: allowSkip,
                  set: setAllowSkip,
                },
                {
                  label: "Shuffle questions",
                  value: doShuffle,
                  set: setDoShuffle,
                },
                { label: "Show Hints", value: showHints, set: setShowHints },
              ].map(({ label, value, set }) => (
                <label
                  key={label}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Switch checked={value} onCheckedChange={set} />
                  <span className="text-[10px] font-mono text-muted-foreground/70">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Z-grading */}
        {hasFreeTxt && (
          <section className="rounded-(--radius) border border-primary/20 bg-primary/5 px-4 py-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setUseZGrading((v) => !v)}
                className={`size-4 border flex items-center justify-center shrink-0 mt-0.5 ${useZGrading ? "border-primary bg-primary" : "border-border/50"}`}
              >
                {useZGrading && (
                  <CheckCircle2 className="size-2.5 text-primary-foreground" />
                )}
              </button>
              <div>
                <p className="text-[11px] font-mono font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="size-3 text-primary" />
                  Grade free-text answers with Z
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                  Z will review and score your written answers with detailed
                  feedback after you submit.
                </p>
              </div>
            </label>
          </section>
        )}

        <Button
          size="sm"
          className="w-full h-10 text-[11px] font-mono uppercase tracking-widest font-bold mt-2"
          disabled={totalSelected === 0}
          onClick={() =>
            onStart({
              selectedKeys,
              feedbackMode,
              timerMode,
              timerSeconds,
              autoNext,
              allowSkip,
              shuffle: doShuffle,
              passingScore,
              useZGrading,
              showHints,
            })
          }
        >
          Start Quiz · {totalSelected} questions
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Timer bar ─────────────────────────────────────────────────────────────────

function TimerBar({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
  mode: "per_question" | "total";
}) {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const color =
    pct > 50 ? "bg-primary" : pct > 20 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="w-full h-0.5 bg-border/20">
      <motion.div
        className={`h-full ${color} transition-colors duration-500`}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: "linear" }}
      />
    </div>
  );
}

// ─── Question map dots ─────────────────────────────────────────────────────────

function QuestionMap({
  questions,
  current,
  answers,
  immediateResults,
  onJump,
}: {
  questions: QuizQuestion[];
  current: number;
  answers: Record<string, string>;
  immediateResults: Record<string, FeedbackState>;
  onJump: (i: number) => void;
}) {
  if (questions.length > 30) return null;

  return (
    <div className="flex gap-1 flex-wrap justify-center mt-4">
      {questions.map((q, i) => {
        const answered = !!answers[q.id];
        const result = immediateResults[q.id];
        const isCurrent = i === current;

        const color = isCurrent
          ? "bg-primary border-primary"
          : result === "correct"
            ? "bg-green-500/60 border-green-500/40"
            : result === "wrong"
              ? "bg-red-500/60 border-red-500/40"
              : answered
                ? "bg-primary/30 border-primary/30"
                : "bg-transparent border-border/30";

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onJump(i)}
            className={`rounded-(--radius) size-2.5 border transition-colors ${color} hover:border-primary/60`}
            aria-label={`Question ${i + 1}`}
          />
        );
      })}
    </div>
  );
}

// ─── Option button ─────────────────────────────────────────────────────────────

function OptionBtn({
  opt,
  index,
  selected,
  feedbackState,
  isCorrectOption,
  disabled,
  onClick,
}: {
  opt: string;
  index: number;
  selected: boolean;
  feedbackState: FeedbackState;
  isCorrectOption: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[index];

  const isWrongSelected = feedbackState === "wrong" && selected;
  const isRevealedCorrect = feedbackState === "wrong" && isCorrectOption;
  const isCorrectSelected = feedbackState === "correct" && selected;

  const containerClass =
    isCorrectSelected || isRevealedCorrect
      ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
      : isWrongSelected
        ? "border-red-500/60 bg-red-500/10 text-red-400"
        : selected && !feedbackState
          ? "border-primary bg-primary/10 text-foreground"
          : disabled
            ? "border-border/20 bg-card/10 text-muted-foreground/30 cursor-default"
            : "border-border/40 bg-card/20 text-muted-foreground hover:border-primary/50 hover:text-foreground cursor-pointer";

  const letterClass =
    isCorrectSelected || isRevealedCorrect
      ? "border-primary text-primary bg-primary/10"
      : isWrongSelected
        ? "border-red-500/60 text-red-400 bg-red-500/10"
        : selected && !feedbackState
          ? "border-primary text-primary bg-primary/10"
          : "border-border/40";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={`rounded-(--radius) w-full text-left px-4 py-3 border font-mono text-[11px] transition-all flex items-start gap-3 ${containerClass}`}
    >
      <span
        className={`rounded-(--radius) shrink-0 size-5 border flex items-center justify-center text-[9px] font-bold mt-0.5 ${letterClass}`}
      >
        {letter}
      </span>
      <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: opt }} />
      {(isCorrectSelected || isRevealedCorrect) && (
        <CheckCircle2 className="size-3.5 text-primary ml-auto mt-0.5 shrink-0" />
      )}
      {isWrongSelected && (
        <XCircle className="size-3.5 text-red-500 ml-auto mt-0.5 shrink-0" />
      )}
    </button>
  );
}

// ─── Question card ─────────────────────────────────────────────────────────────

function QuestionCard({
  q,
  index,
  total,
  answer,
  onAnswer,
  feedbackState,
  mode,
  disabled,
  showHints,
  hintsRevealed,
  onRevealHint,
}: {
  q: QuizQuestion;
  index: number;
  total: number;
  answer: string;
  onAnswer: (v: string) => void;
  feedbackState: FeedbackState;
  mode: "immediate" | "deferred";
  disabled: boolean;
  showHints: boolean;
  hintsRevealed: Record<string, boolean>;
  onRevealHint: (id: string) => void;
}) {
  const controls = useAnimation();
  const borderClass =
    feedbackState === "correct"
      ? "border-primary/40 bg-primary/5"
      : feedbackState === "wrong"
        ? "border-red-500/40 bg-red-500/5"
        : "border-border/40 bg-card/20";

  const isRevealed = !!feedbackState;
  const isAnswered = !!answer;
  const showExplanation =
    isRevealed &&
    mode === "immediate" &&
    isAnswered &&
    feedbackState === "wrong";
  const showHintUI = hintsRevealed[q.id];

  useEffect(() => {
    if (feedbackState === "correct") {
      controls.start({
        scale: [1, 1.025, 1],
        transition: { duration: 0.45, ease: "easeInOut" },
      });
    } else if (feedbackState === "wrong") {
      controls.start({
        x: [0, -10, 10, -7, 7, -4, 4, 0],
        transition: { duration: 0.45, ease: "easeInOut" },
      });
    }
  }, [feedbackState, controls]);

  return (
    <motion.div animate={controls}>
      <div
        className={`rounded-(--radius) px-5 py-5 border transition-colors ${borderClass}`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-muted-foreground/40">
            {index + 1} / {total}
          </span>
          {mode === "deferred" && answer && (
            <span className="text-[9px] font-mono text-primary/60 uppercase tracking-widest">
              answered
            </span>
          )}
        </div>

        <Badge
          variant="outline"
          className="text-[9px] font-mono h-4 px-1.5 uppercase mb-2"
        >
          {q.type === "mcq"
            ? "MCQ"
            : q.type === "true_false"
              ? "True / False"
              : q.type === "short_answer"
                ? "Short Answer"
                : q.type === "fill_in_blank" || q.type === "fill_in"
                  ? "Fill in Blank"
                  : q.type === "essay"
                    ? "Essay"
                    : "Free Text"}
        </Badge>

        <p
          className="font-mono text-sm leading-relaxed text-foreground mb-5"
          dangerouslySetInnerHTML={{ __html: q.question }}
        />

        {q.type === "mcq" && q.options && (
          <div className="flex flex-col gap-2">
            {q.options.map((opt, i) => (
              <OptionBtn
                key={i}
                opt={opt}
                index={i}
                selected={answer === opt}
                feedbackState={mode === "immediate" ? feedbackState : null}
                isCorrectOption={opt === q.correctAnswer}
                disabled={disabled || (mode === "immediate" && !!feedbackState)}
                onClick={() => onAnswer(opt)}
              />
            ))}
          </div>
        )}

        {q.type === "free_text" && (
          <textarea
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Type your answer…"
            rows={4}
            disabled={disabled}
            className="rounded-(--radius) w-full border border-border/50 bg-card/30 px-4 py-3 font-mono text-[12px] placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 resize-none transition-colors disabled:opacity-40"
          />
        )}

        {(showHintUI || showExplanation) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 border border-primary/20 bg-primary/5 px-4 py-3"
          >
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary/60 mb-1">
              {showHintUI ? "HINT" : "EXPLANATION"}
            </p>
            <p
              className="text-[11px] font-mono text-foreground italic"
              dangerouslySetInnerHTML={{
                __html: showHintUI
                  ? (q.hint ?? "")
                  : (q.explanation || `The correct answer is ${q.correctAnswer}`),
              }}
            />
          </motion.div>
        )}

        {showHints && q.hint && !isRevealed && !showHintUI && (
          <button
            onClick={() => onRevealHint(q.id)}
            className="mt-4 text-[10px] font-mono uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <div className="size-1.5 rounded-full bg-primary animate-pulse" />
            Show Hint
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Review item ───────────────────────────────────────────────────────────────

function ReviewItem({
  q,
  given,
  index,
  zResult,
  selfMark,
  onSelfMark,
}: {
  q: QuizQuestion;
  given: string;
  index: number;
  zResult?: ZGradeResultItem;
  selfMark: boolean | null;
  onSelfMark?: (v: boolean) => void;
}) {
  const autoGrade =
    q.type === "mcq" && q.correctAnswer
      ? given.trim() === q.correctAnswer.trim()
      : null;
  const zGraded = q.type === "free_text" && zResult != null;
  const isCorrect =
    q.type === "mcq" ? autoGrade : zGraded ? zResult!.isCorrect : selfMark;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const borderColor =
    isCorrect === true
      ? "border-green-500/30 bg-green-500/5"
      : isCorrect === false
        ? "border-red-500/30 bg-red-500/5"
        : "border-border/30 bg-card/20";

  return (
    <div className={`rounded-(--radius) border px-4 py-3 ${borderColor}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted-foreground/40">
            Q{index + 1}
          </span>
          <Badge
            variant="outline"
            className="text-[9px] font-mono h-4 px-1.5 uppercase"
          >
            {q.type === "mcq"
              ? "MCQ"
              : q.type === "true_false"
                ? "T/F"
                : q.type === "short_answer"
                  ? "Short"
                  : q.type === "fill_in_blank" || q.type === "fill_in"
                    ? "Fill"
                    : q.type === "essay"
                      ? "Essay"
                      : "Free"}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {zGraded && (
            <span className="text-[9px] font-mono text-primary/60 flex items-center gap-0.5">
              <Zap className="size-2.5" /> Z: {zResult!.score}%
            </span>
          )}
          {isCorrect === true && (
            <CheckCircle2 className="size-4 text-green-500" />
          )}
          {isCorrect === false && <XCircle className="size-4 text-red-500" />}
        </div>
      </div>

      <p
        className="font-mono text-[11px] text-foreground leading-relaxed mb-3"
        dangerouslySetInnerHTML={{ __html: q.question }}
      />

      {q.type === "mcq" && q.options && (
        <div className="flex flex-col gap-1 mb-1">
          {q.options.map((opt, i) => {
            const isSelected = given === opt;
            const isRight = opt === q.correctAnswer;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-2 py-0.5 text-[10px] font-mono ${
                  isRight
                    ? "text-green-500"
                    : isSelected
                      ? "text-red-400"
                      : "text-muted-foreground/30"
                }`}
              >
                <span>{letters[i]}.</span>
                <span dangerouslySetInnerHTML={{ __html: opt }} />
                {isRight && (
                  <span className="ml-auto text-[9px] uppercase tracking-widest text-green-500/60">
                    correct
                  </span>
                )}
                {isSelected && !isRight && (
                  <span className="ml-auto text-[9px] uppercase tracking-widest text-red-400/60">
                    yours
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {q.type === "free_text" && (
        <div className="space-y-2">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 mb-0.5">
              Your answer
            </p>
            <p className="text-[11px] font-mono text-foreground/80 leading-relaxed">
              {given || (
                <span className="text-muted-foreground/30 italic">
                  No answer
                </span>
              )}
            </p>
          </div>
          {q.correctAnswer && (
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 mb-0.5">
                Reference answer
              </p>
              <p className="text-[11px] font-mono text-green-500">
                {q.correctAnswer}
              </p>
            </div>
          )}
          {zGraded && (
            <div className="rounded-(--radius) border border-primary/20 bg-primary/5 px-3 py-2 mt-2">
              <p className="text-[9px] font-mono uppercase tracking-widest text-primary/60 mb-1 flex items-center gap-1">
                <Zap className="size-2.5" /> Z Feedback
              </p>
              <p className="text-[11px] font-mono text-foreground/80 leading-relaxed">
                {zResult!.feedback}
              </p>
            </div>
          )}
          {!zGraded && selfMark === null && onSelfMark && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => onSelfMark(true)}
                className="rounded-(--radius) flex items-center gap-1 text-[10px] font-mono border border-green-500/40 text-green-500 px-2 py-1 hover:bg-green-500/10 transition-colors"
              >
                <CheckCircle2 className="size-3" />
                Correct
              </button>
              <button
                type="button"
                onClick={() => onSelfMark(false)}
                className="rounded-(--radius) flex items-center gap-1 text-[10px] font-mono border border-red-500/40 text-red-400 px-2 py-1 hover:bg-red-500/10 transition-colors"
              >
                <XCircle className="size-3" />
                Incorrect
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Results screen ────────────────────────────────────────────────────────────

function ResultsScreen({
  questions,
  answers,
  selfMarks,
  onSelfMark,
  zResults,
  onGradeWithZ,
  isGrading,
  onRetake,
  quizTitle,
  passingScore,
  maxStreak,
  config,
}: {
  questions: QuizQuestion[];
  answers: Record<string, string>;
  selfMarks: Record<string, boolean | null>;
  onSelfMark: (id: string, v: boolean) => void;
  zResults: Record<string, ZGradeResultItem>;
  onGradeWithZ: () => void;
  isGrading: boolean;
  onRetake: () => void;
  quizTitle: string;
  passingScore: number;
  maxStreak: number;
  config: QuizConfig;
}) {
  const graded = questions.map((q) => {
    if (q.type === "mcq") {
      const ans = answers[q.id] ?? "";
      if (!ans) return null;
      const correct = q.correctAnswer;
      return correct ? ans.trim() === String(correct).trim() : null;
    }
    const z = zResults[q.id];
    if (z) return z.isCorrect;
    const sm = selfMarks[q.id];
    return sm ?? null;
  });

  const gradedCount = graded.filter((g) => g !== null).length;
  const correctCount = graded.filter((g) => g === true).length;
  const pct =
    gradedCount > 0 ? Math.round((correctCount / gradedCount) * 100) : 0;
  const pass = pct >= passingScore;

  const unansweredFreeText = questions.filter(
    (q) =>
      q.type === "free_text" &&
      answers[q.id] &&
      !zResults[q.id] &&
      selfMarks[q.id] === undefined,
  );
  const hasUngradedFreeText = unansweredFreeText.length > 0;
  const isPctFinal =
    gradedCount === questions.filter((q) => !!answers[q.id]).length;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-(--radius) border px-5 py-6 mb-6 text-center ${
          isPctFinal
            ? pass
              ? "border-green-500/30 bg-green-500/5"
              : "border-red-500/20 bg-red-500/5"
            : "border-border/40 bg-card/30"
        }`}
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
          {quizTitle}
        </p>

        <p className="text-6xl font-black tabular-nums">
          {isPctFinal ? `${pct}%` : "–%"}
        </p>

        {isPctFinal && (
          <p
            className={`mt-1 text-[11px] font-mono font-bold uppercase tracking-widest ${
              pass ? "text-green-500" : "text-red-500"
            }`}
          >
            {pass ? "Passed" : "Failed"} · {passingScore}% required
          </p>
        )}

        <p className="mt-2 text-[10px] font-mono text-muted-foreground/50">
          {correctCount} / {gradedCount} correct
          {!isPctFinal && (
            <span className="ml-2 text-amber-500/80">
              · mark remaining below
            </span>
          )}
        </p>

        {maxStreak >= 3 && (
          <div className="rounded-(--radius) mt-3 inline-flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5">
            <Flame className="size-3 text-amber-500" />
            <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">
              Best streak: {maxStreak}
            </span>
          </div>
        )}

        <div className="flex justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={onRetake}
            className="rounded-(--radius) inline-flex items-center gap-1.5 border border-border/50 px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
          >
            <RotateCcw className="size-3" />
            Retake
          </button>
        </div>
      </motion.div>

      {config.useZGrading && hasUngradedFreeText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-(--radius) border border-primary/20 bg-primary/5 px-4 py-4 mb-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono font-semibold text-foreground flex items-center gap-1.5">
                <Zap className="size-3.5 text-primary" />
                Grade with Z
              </p>
              <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                Z will score your {unansweredFreeText.length} free-text{" "}
                {unansweredFreeText.length === 1 ? "answer" : "answers"} with
                detailed feedback.
              </p>
            </div>
            <Button
              size="sm"
              className="h-7 text-[10px] font-mono shrink-0"
              onClick={onGradeWithZ}
              disabled={isGrading}
            >
              {isGrading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                "Grade now"
              )}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <ReviewItem
            key={q.id}
            q={q}
            given={answers[q.id] ?? ""}
            index={i}
            zResult={zResults[q.id]}
            selfMark={q.type === "free_text" ? (selfMarks[q.id] ?? null) : null}
            onSelfMark={
              q.type === "free_text" && !zResults[q.id]
                ? (v) => onSelfMark(q.id, v)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function QuizTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const gradeQuiz = useGradeQuizAnswers();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [screen, setScreen] = useState<Screen>("config");
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(
    null,
  );

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

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(() => {
    stopTimer();
    clearProgress(id);
    const marks: Record<string, boolean | null> = {};
    questions.forEach((q) => {
      if (q.type === "free_text")
        marks[q.id] = null;
    });
    setSelfMarks(marks);
    setScreen("results");
  }, [id, questions, stopTimer]);

  const handleAnswer = useCallback(
    (val: string) => {
      const q = questions[current];
      if (!q) return;

      setAnswers((prev) => ({ ...prev, [q.id]: val }));

      if (config?.feedbackMode === "immediate" && q.type === "mcq") {
        const correct = q.correctAnswer;
        const isCorrect = correct
          ? val.trim() === String(correct).trim()
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
          const locked =
            config.feedbackMode === "immediate" && !!immediateResults[q.id];
          if (!locked) handleAnswer(q.options[idx]);
        }
      }
      if (e.key === "ArrowRight" || (e.key === " " && q.type !== "free_text")) {
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
    api
      .get<{ data: QuizDetail }>(`/app/quizzes/${id}`)
      .then((res) => {
        const q = res.data?.data ?? null;
        setQuiz(q);
        if (q) {
          useBreadcrumbStore.getState().setDynamicTitle(q.title);
          const saved = loadProgress(id);
          if (saved && saved.questionIds.length > 0) {
            setSavedProgress(saved);
            setScreen("resume");
          }
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

  useEffect(() => {
    if (screen !== "quiz" || !config || questions.length === 0) return;
    saveProgress(id, {
      config,
      current,
      answers,
      immediateResults,
      streak,
      maxStreak,
      questionIds: questions.map((q) => q.id),
      savedAt: new Date().toISOString(),
    });
  }, [answers, current, id, config, questions, immediateResults, streak, maxStreak, screen]);

  const startQuiz = useCallback(
    (cfg: QuizConfig, resumeData?: SavedProgress) => {
      if (!quiz) return;
      setConfig(cfg);

      if (resumeData) {
        const allQs = buildQuestions(quiz, cfg);
        const ordered = resumeData.questionIds
          .map((qid) => allQs.find((q) => q.id === qid))
          .filter(Boolean) as QuizQuestion[];
        setQuestions(ordered);
        setCurrent(resumeData.current);
        setAnswers(resumeData.answers);
        setImmediateResults(resumeData.immediateResults);
        setStreak(resumeData.streak);
        setMaxStreak(resumeData.maxStreak);
      } else {
        const qs = buildQuestions(quiz, cfg);
        setQuestions(qs);
        setCurrent(0);
        setAnswers({});
        setImmediateResults({});
        setStreak(0);
        setMaxStreak(0);
      }

      setTimerRemaining(cfg.timerSeconds);
      setScreen("quiz");
    },
    [quiz],
  );

  const handleRetake = useCallback(() => {
    stopTimer();
    clearProgress(id);
    setAnswers({});
    setImmediateResults({});
    setSelfMarks({});
    setZResults({});
    setStreak(0);
    setMaxStreak(0);
    setScreen("config");
  }, [id, stopTimer]);

  const handleGradeWithZ = useCallback(async () => {
    if (!quiz || !config) return;
    const freeTextAnswered = questions.filter(
      (q) => q.type === "free_text" && answers[q.id] && !zResults[q.id],
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
    } catch {}
  }, [quiz, config, questions, answers, zResults, id, gradeQuiz]);

  if (isLoading) {
    return (
      <div className="min-h-full px-4 pt-6 pb-8">
        <div className="mx-auto max-w-2xl flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-(--radius) h-12 animate-pulse bg-card/40 border border-border/20"
            />
          ))}
        </div>
      </div>
    );
  }

  if (loadError || !quiz) {
    return (
      <div className="min-h-full px-4 pt-6 pb-8">
        <div className="rounded-(--radius) mx-auto max-w-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive">
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
  const isLast = current === questions.length - 1;
  const unansweredCount = questions.length - Object.keys(answers).length;

  return (
    <div className="min-h-full px-4 pt-2 pb-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => router.push(`/app/quizzes/${id}`)}
            className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/50 hover:text-foreground transition-colors uppercase tracking-widest"
          >
            <ChevronLeft className="size-3.5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {streak >= 2 && screen === "quiz" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="rounded-(--radius) flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5"
                >
                  <Flame className="size-3 text-amber-500" />
                  <span className="text-[9px] font-mono text-amber-500 font-semibold">
                    {streak}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            {screen === "quiz" && config?.timerMode === "total" && (
              <span
                className={`text-[10px] font-mono tabular-nums ${
                  timerRemaining < config.timerSeconds * 0.2
                    ? "text-red-500"
                    : timerRemaining < config.timerSeconds * 0.5
                      ? "text-amber-500"
                      : "text-muted-foreground/60"
                }`}
              >
                <Clock className="size-3 inline mr-1" />
                {fmtSeconds(timerRemaining)}
              </span>
            )}
          </div>
        </div>

        {screen === "resume" && savedProgress && (
          <ResumePrompt
            savedAt={savedProgress.savedAt}
            answered={Object.keys(savedProgress.answers).length}
            total={savedProgress.questionIds.length}
            onResume={() => {
              startQuiz(savedProgress.config, savedProgress);
            }}
            onRestart={() => {
              clearProgress(id);
              setSavedProgress(null);
              setScreen("config");
            }}
          />
        )}

        {/* ── Config ── */}
        {screen === "config" && (
          <QuizConfigScreen quiz={quiz} onStart={(cfg) => startQuiz(cfg)} />
        )}

        {/* ── Quiz ── */}
        {screen === "quiz" && config && currentQ && (
          <>
            {/* Progress bar */}
            {config.timerMode !== "none" && (
              <TimerBar
                remaining={timerRemaining}
                total={config.timerSeconds}
                mode={config.timerMode as "per_question" | "total"}
              />
            )}

            {/* Overall progress bar */}
            <div className="w-full h-0.5 bg-border/20 mt-1">
              <motion.div
                className="h-full bg-primary/30"
                animate={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Question map */}
            <QuestionMap
              questions={questions}
              current={current}
              answers={answers}
              immediateResults={immediateResults}
              onJump={(i) => {
                if (config.allowSkip || i < current) setCurrent(i);
              }}
            />

            {/* Question card */}
            <div className="mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
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
                    onRevealHint={(id) =>
                      setHintsRevealed((h) => ({ ...h, [id]: true }))
                    }
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Per-question timer label */}
            {config.timerMode === "per_question" && (
              <p
                className={`mt-1.5 text-right text-[10px] font-mono tabular-nums ${
                  timerRemaining < config.timerSeconds * 0.2
                    ? "text-red-500"
                    : timerRemaining < config.timerSeconds * 0.5
                      ? "text-amber-500"
                      : "text-muted-foreground/40"
                }`}
              >
                {fmtSeconds(timerRemaining)}
              </p>
            )}

            {/* Navigation */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-[10px] font-mono"
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
              >
                <ChevronLeft className="size-3.5" />
                Prev
              </Button>

              <div className="flex items-center gap-2">
                {/* Skip */}
                {config.allowSkip && !isLast && (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrent((c) => Math.min(c + 1, questions.length - 1))
                    }
                    className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    <SkipForward className="size-3.5" />
                    Skip
                  </button>
                )}

                {/* Submit / Next */}
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
                    onClick={() => setCurrent((c) => c + 1)}
                  >
                    Next
                    <ChevronRight className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Unanswered warning on last question */}
            {isLast && unansweredCount > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-center text-[10px] font-mono text-amber-500/70 flex items-center justify-center gap-1"
              >
                <AlertCircle className="size-3" />
                {unansweredCount} question{unansweredCount !== 1 ? "s" : ""}{" "}
                unanswered
              </motion.p>
            )}

            {/* Keyboard hint */}
            <p className="mt-6 text-center text-[9px] font-mono text-muted-foreground/25 uppercase tracking-widest">
              1–{Math.min(9, currentQ.options?.length ?? 0)} to select · ← → to
              navigate
            </p>
          </>
        )}

        {/* ── Results ── */}
        {screen === "results" && config && (
          <div className="mt-2">
            <ResultsScreen
              questions={questions}
              answers={answers}
              selfMarks={selfMarks}
              onSelfMark={(id, v) =>
                setSelfMarks((prev) => ({ ...prev, [id]: v }))
              }
              zResults={zResults}
              onGradeWithZ={handleGradeWithZ}
              isGrading={gradeQuiz.isPending}
              onRetake={handleRetake}
              quizTitle={quiz.title}
              passingScore={config.passingScore}
              maxStreak={maxStreak}
              config={config}
            />
          </div>
        )}
      </div>
    </div>
  );
}
