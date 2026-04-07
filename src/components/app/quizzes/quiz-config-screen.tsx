"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Zap,
  Clock,
  Shuffle,
  Target,
  ChevronRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { QuizDetail, QuizConfig } from "@/types/session";
import { useRouter } from "next/navigation";

interface Props {
  quiz: QuizDetail;
  onStart: (config: QuizConfig) => void | Promise<void>;
  initialConfig?: Partial<QuizConfig>;
  showTopicSelection?: boolean;
  isLoading?: boolean;
  error?: Error | null;
}

const TIMER_PER_Q_OPTIONS = [
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "2m", value: 120 },
];

const TIMER_TOTAL_OPTIONS = [
  { label: "5m", value: 300 },
  { label: "10m", value: 600 },
  { label: "15m", value: 900 },
  { label: "20m", value: 1200 },
];

function allTopicKeys(quiz: QuizDetail): string[] {
  return quiz.lectures.flatMap((l, li) =>
    l.topics.map((_, ti) => `${li}:${ti}`)
  );
}

export function QuizConfigScreen({
  quiz,
  onStart,
  initialConfig,
  showTopicSelection = true,
  isLoading = false,
  error = null,
}: Props) {
  // --- State ---
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    initialConfig?.selectedKeys || allTopicKeys(quiz)
  );

  const router = useRouter();

  const [feedbackMode, setFeedbackMode] = useState<"immediate" | "deferred">(
    initialConfig?.feedbackMode || "immediate"
  );
  const [timerMode, setTimerMode] = useState<"none" | "per_question" | "total">(
    initialConfig?.timerMode || "none"
  );
  const [timerSeconds, setTimerSeconds] = useState(
    initialConfig?.timerSeconds ?? 60
  );
  const [autoNext, setAutoNext] = useState(initialConfig?.autoNext ?? true);
  const [allowSkip, setAllowSkip] = useState(initialConfig?.allowSkip ?? true);
  const [doShuffle, setDoShuffle] = useState(initialConfig?.shuffle ?? false);
  const [passingScore, setPassingScore] = useState(
    initialConfig?.passingScore || 70
  );
  const [useZGrading, setUseZGrading] = useState(
    initialConfig?.useZGrading ?? false
  );
  const [showHints, setShowHints] = useState(
    initialConfig?.showHints ?? false
  );

  // --- Derived ---
  const totalSelected = useMemo(() => {
    return quiz.lectures.reduce(
      (s, l, li) =>
        s +
        l.topics.reduce(
          (ts, t, ti) =>
            ts +
            (selectedKeys.includes(`${li}:${ti}`)
              ? (t.questionCount ?? t.questions?.length ?? 0)
              : 0),
          0
        ),
      0
    );
  }, [quiz, selectedKeys]);

  const hasFreeTxt = useMemo(() => {
    return quiz.lectures.some((l) =>
      l.topics.some((t) => (t.questions ?? []).some((q) => q.type === "free_text"))
    );
  }, [quiz]);

  // --- Handlers ---
  const toggleTopic = (key: string) =>
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const toggleLecture = (li: number) => {
    const topicKeys = quiz.lectures[li].topics.map((_, ti) => `${li}:${ti}`);
    const allOn = topicKeys.every((k) => selectedKeys.includes(k));
    setSelectedKeys((prev) =>
      allOn
        ? prev.filter((k) => !topicKeys.includes(k))
        : [...new Set([...prev, ...topicKeys])]
    );
  };

  const handleManualTimeChange = (val: string) => {
    const num = parseInt(val) || 0;
    setTimerSeconds(num * 60);
    if (num > 0) setTimerMode("total");
    else setTimerMode("none");
  };

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

      <div className="flex flex-col gap-4 pb-12">
        {/* Quiz Range (Optional) */}
        {showTopicSelection && (
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
                        className={`size-3.5 border shrink-0 flex items-center justify-center ${
                          allOn
                            ? "border-primary bg-primary"
                            : someOn
                              ? "border-primary/50 bg-primary/20"
                              : "border-border/50"
                        }`}
                      >
                        {(allOn || someOn) && (
                          <span className="block size-1.5 bg-primary-foreground" />
                        )}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-foreground flex-1 truncate">
                        {l.lectureTitle}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/40">
                        {l.topics.reduce(
                          (s, t) =>
                            s + (t.questionCount ?? t.questions?.length ?? 0),
                          0,
                        )}{" "}
                        Qs
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
                                className={`size-3 border shrink-0 flex items-center justify-center ${
                                  on
                                    ? "border-primary bg-primary"
                                    : "border-border/40"
                                }`}
                              >
                                {on && (
                                  <span className="block size-1 bg-primary-foreground" />
                                )}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground/70">
                                {t.topicTitle}
                              </span>
                              <span className="text-[9px] font-mono text-muted-foreground/30">
                                {t.questionCount ?? t.questions?.length ?? 0}Q
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
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Feedback mode */}
          <section className="rounded-(--radius) border border-border/40 bg-card/20 px-4 py-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 mb-3">
              Session Mode
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
                  {m === "immediate" ? "Practice" : "Take Quiz"}
                </button>
              ))}
            </div>
            {feedbackMode === "immediate" && (
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <Switch checked={autoNext} onCheckedChange={setAutoNext} />
                <span className="text-[10px] font-mono text-muted-foreground/70">
                  Auto-advance after MCQ
                </span>
              </label>
            )}
          </section>

          {/* Passing Score */}
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
        </div>

        {/* Timer Section */}
        <section className="rounded-(--radius) border border-border/40 bg-card/20 px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
              Timer Configuration
            </p>
            <div className="flex bg-background/50 rounded-full border border-border/50 p-1">
              {(["none", "per_question", "total"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setTimerMode(m)}
                  className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest transition-all ${
                    timerMode === m
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground/60 hover:text-foreground"
                  }`}
                >
                  {m === "none"
                    ? "None"
                    : m === "per_question"
                      ? "Per Q"
                      : "Total"}
                </button>
              ))}
            </div>
          </div>

          {timerMode !== "none" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-6"
            >
              {/* Presets */}
              <div className="flex gap-2 items-center flex-wrap">
                {(timerMode === "per_question"
                  ? TIMER_PER_Q_OPTIONS
                  : TIMER_TOTAL_OPTIONS
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTimerSeconds(opt.value)}
                    className={`px-3 py-1.5 border font-mono text-[10px] transition-all rounded-(--radius) ${
                      timerSeconds === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/40 text-muted-foreground/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Slider & Manual Input */}
              {timerMode === "total" && (
                <div className="pt-2">
                  <div className="flex items-end gap-6">
                    <div className="flex-1">
                      <div className="flex justify-between text-[9px] font-mono text-muted-foreground/40 uppercase mb-2">
                        <span>0m</span>
                        <span>120m</span>
                      </div>
                      <Slider
                        value={[Math.floor(timerSeconds / 60)]}
                        min={0}
                        max={120}
                        step={1}
                        onValueChange={([v]) => setTimerSeconds(v * 60)}
                      />
                    </div>
                    <div className="w-20">
                      <p className="text-[9px] font-mono text-muted-foreground/40 uppercase mb-1.5">
                        Minutes
                      </p>
                      <Input
                        type="number"
                        min={0}
                        max={999}
                        value={Math.floor(timerSeconds / 60)}
                        onChange={(e) => handleManualTimeChange(e.target.value)}
                        className="h-8 font-mono text-[11px] text-center"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground/30 mt-3 italic uppercase">
                    Slide or type for custom duration · Set to 0 for unlimited
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </section>

        {/* Options Toggles */}
        <section className="rounded-(--radius) border border-border/40 bg-card/20 px-4 py-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 mb-4">
            Advanced Options
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              {
                label: "Shuffle Questions",
                desc: "Randomize question order",
                icon: Shuffle,
                value: doShuffle,
                set: setDoShuffle,
              },
              {
                label: "Show Hints",
                desc: "Access hints during sessions",
                icon: BookOpen,
                value: showHints,
                set: setShowHints,
              },
              {
                label: "Allow Skipping",
                desc: "Navigate freely between Qs",
                icon: ChevronRight,
                value: allowSkip,
                set: setAllowSkip,
              },
            ].map((opt) => (
              <div
                key={opt.label}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-[11px] font-bold font-mono uppercase">
                    {opt.label}
                  </p>
                  <p className="text-[9px] font-mono text-muted-foreground/50">
                    {opt.desc}
                  </p>
                </div>
                <Switch checked={opt.value} onCheckedChange={opt.set} />
              </div>
            ))}
          </div>
        </section>

        {/* Z-grading */}
        {hasFreeTxt && (
          <section className="rounded-(--radius) border border-primary/20 bg-primary/5 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-mono font-black uppercase text-foreground">
                    AI Auto-Grading (Z)
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 leading-relaxed">
                    Z will automatically review and score your written answers
                    providing detailed feedback after submission.
                  </p>
                </div>
              </div>
              <Switch checked={useZGrading} onCheckedChange={setUseZGrading} />
            </div>
          </section>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-(--radius) border border-destructive/20 bg-destructive/5 px-4 py-3 mb-4">
            <div className="size-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <span className="text-destructive font-bold text-xs">!</span>
            </div>
            <div>
              <p className="text-[10px] font-mono font-black uppercase text-destructive">
                Error Starting Quiz
              </p>
              <p className="text-[10px] font-mono text-destructive/60 mt-0.5 leading-relaxed">
                {error.message.includes("403") ? (
                  <>
                    You've reached your free attempt limit for this 12-hour
                    window. Get <strong>unlimited attempts</strong> and more
                    with a premium subscription.
                    <div className="mt-3">
                      <Button
                        className="w-full h-12 text-[11px] font-mono font-black uppercase tracking-[0.2em] mt-2 shadow-lg shadow-primary/10"
                        onClick={() => router.push("/app/billing")}
                      >
                        <Sparkles className="size-3" />
                        View Plans
                      </Button>
                    </div>
                  </>
                ) : (
                  error.message
                )}
              </p>
            </div>
          </div>
        )}

        <Button
          className="w-full h-12 text-[11px] font-mono font-black uppercase tracking-[0.2em] mt-2 shadow-lg shadow-primary/10"
          disabled={totalSelected === 0 || isLoading}
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
          Initiate Session · {totalSelected} Topics
        </Button>
      </div>
    </motion.div>
  );
}
