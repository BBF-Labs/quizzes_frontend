"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Shuffle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Sparkles,
  Check,
  Minus,
  HelpCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { QuizDetail, QuizConfig } from "@/types/session";

interface Props {
  quiz: QuizDetail;
  onStart: (config: QuizConfig) => void | Promise<void>;
  initialConfig?: Partial<QuizConfig>;
  showTopicSelection?: boolean;
  showZGrading?: boolean;
  isLoading?: boolean;
  error?: Error | null;
}

function allTopicKeys(quiz: QuizDetail): string[] {
  return quiz.lectures.flatMap((l, li) =>
    l.topics.map((_, ti) => `${li}:${ti}`),
  );
}

function getTopicQuestionCount(
  topic: QuizDetail["lectures"][number]["topics"][number],
): number {
  return (
    topic.questions?.length ??
    topic.questionTypes?.reduce(
      (count, group) => count + (group.questions?.length ?? 0),
      0,
    ) ??
    topic.questionCount ??
    0
  );
}

export function QuizConfigScreen({
  quiz,
  onStart,
  initialConfig,
  showTopicSelection = true,
  showZGrading = false,
  isLoading = false,
}: Props) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    initialConfig?.selectedKeys || allTopicKeys(quiz),
  );
  const [feedbackMode, setFeedbackMode] = useState<"immediate" | "deferred">(
    initialConfig?.feedbackMode || "deferred",
  );
  const [timerMode, setTimerMode] = useState<"none" | "per_question" | "total">(
    initialConfig?.timerMode || "none",
  );
  const [timerSeconds, setTimerSeconds] = useState(
    initialConfig?.timerSeconds ?? 60,
  );
  const [autoNext, setAutoNext] = useState(initialConfig?.autoNext ?? false);
  const [allowSkip, setAllowSkip] = useState(initialConfig?.allowSkip ?? true);
  const [doShuffle, setDoShuffle] = useState(initialConfig?.shuffle ?? true);
  const [passingScore, setPassingScore] = useState(
    initialConfig?.passingScore || 70,
  );
  const [showHints, setShowHints] = useState(initialConfig?.showHints ?? true);
  const [useZGrading, setUseZGrading] = useState(
    initialConfig?.useZGrading ?? false,
  );
  const [expandedLectures, setExpandedLectures] = useState<Set<number>>(
    () => new Set([0]),
  );

  const hasFreeTextQuestions = useMemo(() => {
    return quiz.lectures.some((lecture) =>
      lecture.topics.some((topic) =>
        (topic.questions ?? []).some((question) =>
          [
            "short_answer",
            "essay",
            "free_text",
            "fill_in_blank",
            "fill_in",
          ].includes(question.type),
        ),
      ),
    );
  }, [quiz]);

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
          0,
        ),
      0,
    );
  }, [quiz, selectedKeys]);

  const toggleTopic = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const selectAllTopics = () => {
    setSelectedKeys(allTopicKeys(quiz));
  };

  const deselectAllTopics = () => {
    setSelectedKeys([]);
  };

  const toggleLectureSelection = (lectureIndex: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const lecture = quiz.lectures[lectureIndex];
    if (!lecture) return;
    const lectureTopicKeys = lecture.topics.map((_, ti) => `${lectureIndex}:${ti}`);
    const allSelected =
      lectureTopicKeys.length > 0 &&
      lectureTopicKeys.every((k) => selectedKeys.includes(k));

    if (allSelected) {
      // Deselect all topics in this lecture
      setSelectedKeys((prev) => prev.filter((k) => !lectureTopicKeys.includes(k)));
    } else {
      // Select all topics in this lecture
      setSelectedKeys((prev) => Array.from(new Set([...prev, ...lectureTopicKeys])));
    }
  };

  const toggleLecture = (lectureIndex: number) => {
    setExpandedLectures((prev) => {
      const next = new Set(prev);
      if (next.has(lectureIndex)) {
        next.delete(lectureIndex);
      } else {
        next.add(lectureIndex);
      }
      return next;
    });
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleFinalStart = () => {
    onStart({
      selectedKeys,
      feedbackMode,
      timerMode,
      timerSeconds,
      autoNext,
      allowSkip,
      shuffle: doShuffle,
      passingScore,
      useZGrading: showZGrading ? useZGrading : false,
      showHints,
    });
  };

  const steps = [
    { num: 1, label: "01 · Content" },
    { num: 2, label: "02 · Session" },
    { num: 3, label: "03 · Experience" },
    { num: 4, label: "04 · Review" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] bg-[#F7F9FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Title */}
        <div>
          <p className="hand text-2xl text-[#0C60FC]">make it work for you ✦</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 mt-1">
            Configure your quiz
          </h1>
        </div>

        {/* 4-Step Pill Stepper Navigation Header */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {steps.map((s) => {
              const isCurrent = currentStep === s.num;
              const isCompleted = currentStep > s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num as any)}
                  className={`flex items-center justify-center rounded-xl py-2.5 px-3 text-xs font-extrabold transition ${
                    isCurrent
                      ? "bg-[#0C60FC] text-white shadow-sm"
                      : isCompleted
                        ? "bg-[#E9FFD3] text-slate-900"
                        : "bg-white text-slate-400 border border-slate-100 hover:text-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: CONTENT */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                    01 · Content
                  </p>
                  <h2 className="text-xl font-bold text-slate-950 mt-0.5">
                    Choose what to cover
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Select entire lectures or expand to pick specific topics.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-600">
                    {selectedKeys.length} / {allTopicKeys(quiz).length} topics · {totalSelected}Q
                  </span>
                  <button
                    type="button"
                    onClick={selectAllTopics}
                    className="text-xs font-extrabold text-[#0C60FC] hover:underline cursor-pointer"
                  >
                    Select all
                  </button>
                  {selectedKeys.length > 0 && (
                    <>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={deselectAllTopics}
                        className="text-xs font-extrabold text-slate-500 hover:text-rose-600 transition cursor-pointer"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {quiz.lectures.map((lecture, lectureIndex) => {
                  const lectureTopicKeys = lecture.topics.map(
                    (_, ti) => `${lectureIndex}:${ti}`,
                  );
                  const selectedInLecture = lectureTopicKeys.filter((k) =>
                    selectedKeys.includes(k),
                  );
                  const isAllLectureSelected =
                    lectureTopicKeys.length > 0 &&
                    selectedInLecture.length === lectureTopicKeys.length;
                  const isSomeLectureSelected =
                    selectedInLecture.length > 0 && !isAllLectureSelected;
                  const isNoneLectureSelected = selectedInLecture.length === 0;

                  const lectureQuestionCount = lecture.topics.reduce(
                    (count, topic) => count + getTopicQuestionCount(topic),
                    0,
                  );
                  const isOpen = expandedLectures.has(lectureIndex);

                  return (
                    <div
                      key={`${lecture.lectureTitle}-${lectureIndex}`}
                      className={`rounded-[24px] border transition shadow-xs overflow-hidden ${
                        isAllLectureSelected
                          ? "border-blue-200 bg-blue-50/20"
                          : isSomeLectureSelected
                            ? "border-blue-200/60 bg-white"
                            : "border-slate-200/90 bg-white"
                      }`}
                    >
                      {/* Lecture Header Bar */}
                      <div
                        onClick={() => toggleLectureSelection(lectureIndex)}
                        className={`w-full flex items-center justify-between p-4 sm:p-5 gap-3 text-left transition cursor-pointer select-none ${
                          isAllLectureSelected
                            ? "hover:bg-blue-50/40"
                            : "hover:bg-slate-50/70"
                        }`}
                      >
                        {/* Lecture Number Badge + Lecture Title */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Number Badge — blue with white text when selected, light blue with blue text when unselected */}
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold transition-all select-none ${
                              isAllLectureSelected
                                ? "bg-[#0C60FC] text-white shadow-sm ring-2 ring-[#0C60FC]/25"
                                : isSomeLectureSelected
                                  ? "bg-blue-100 text-[#0C60FC] border border-[#0C60FC]/40"
                                  : "bg-blue-50 text-[#0C60FC] border border-blue-100"
                            }`}
                          >
                            {String(lectureIndex + 1).padStart(2, "0")}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-bold leading-snug truncate transition ${
                                isAllLectureSelected
                                  ? "text-[#0C60FC]"
                                  : "text-slate-950"
                              }`}
                            >
                              {lecture.lectureTitle}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              {isAllLectureSelected
                                ? `All ${lecture.topics.length} topics selected · ${lectureQuestionCount} questions`
                                : isSomeLectureSelected
                                  ? `${selectedInLecture.length} of ${lecture.topics.length} topics selected · ${lectureQuestionCount} questions`
                                  : `0 of ${lecture.topics.length} topics selected (${lectureQuestionCount} questions)`}
                            </p>
                          </div>
                        </div>

                        {/* Right: Dropdown Expander for Picky Topic Selection */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLecture(lectureIndex);
                          }}
                          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title={isOpen ? "Collapse topics" : "Expand to pick topics"}
                          aria-label={isOpen ? "Collapse topics" : "Expand to pick topics"}
                        >
                          <span className="text-[11px] font-bold hidden sm:inline text-slate-500">
                            {isOpen ? "Hide topics" : "Pick topics"}
                          </span>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isOpen ? "rotate-90 text-[#0C60FC]" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Expanded Topics List */}
                      {isOpen && (
                        <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/40">
                          {lecture.topics.map((topic, topicIndex) => {
                            const key = `${lectureIndex}:${topicIndex}`;
                            const isSelected = selectedKeys.includes(key);
                            const qCount = getTopicQuestionCount(topic);

                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => toggleTopic(key)}
                                className={`w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left transition cursor-pointer ${
                                  isSelected
                                    ? "bg-blue-50/60"
                                    : "bg-white hover:bg-slate-50/80"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className={`flex size-4.5 shrink-0 items-center justify-center rounded-md border transition ${
                                      isSelected
                                        ? "border-[#0C60FC] bg-[#0C60FC] text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check className="size-3 stroke-[3]" />
                                    )}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">
                                      {topic.topicTitle ||
                                        topic.title ||
                                        `Topic ${topicIndex + 1}`}
                                    </p>
                                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                      Tap to include or exclude this section
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-extrabold text-slate-400 font-mono shrink-0">
                                  {qCount}Q
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
            </div>
            {/* Bottom Footer Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-extrabold text-slate-400 font-mono">
                Step 1 of 4
              </span>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={selectedKeys.length === 0}
                className="rounded-2xl bg-slate-950 px-7 py-3.5 text-xs font-extrabold text-white hover:bg-[#0C60FC] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-md cursor-pointer"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: SESSION */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                  02 · Session
                </p>
                <h2 className="text-xl font-bold text-slate-950 mt-0.5">
                  Set the pace
                </h2>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Mode
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackMode("immediate")}
                    className={`rounded-2xl border p-4 text-center text-xs font-extrabold transition ${
                      feedbackMode === "immediate"
                        ? "border-[#0C60FC] bg-blue-50/60 text-[#0C60FC] shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackMode("deferred")}
                    className={`rounded-2xl border p-4 text-center text-xs font-extrabold transition ${
                      feedbackMode === "deferred"
                        ? "border-[#0C60FC] bg-blue-50/60 text-[#0C60FC] shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    Take quiz
                  </button>
                </div>
              </div>

              {/* Passing Score */}
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Passing score
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 60, 70, 80].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setPassingScore(score)}
                      className={`rounded-2xl border py-3 text-center text-xs font-extrabold transition ${
                        passingScore === score
                          ? "border-[#0C60FC] bg-blue-50/60 text-[#0C60FC]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {score}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Options */}
              <div className="space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Timer
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTimerMode("none")}
                    className={`rounded-2xl border p-4 text-center text-xs font-extrabold transition ${
                      timerMode === "none"
                        ? "border-[#0C60FC] bg-blue-50/60 text-[#0C60FC]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    None
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimerMode("per_question")}
                    className={`rounded-2xl border p-4 text-center text-xs font-extrabold transition ${
                      timerMode === "per_question"
                        ? "border-[#0C60FC] bg-blue-50/60 text-[#0C60FC]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    Per question
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimerMode("total")}
                    className={`rounded-2xl border p-4 text-center text-xs font-extrabold transition ${
                      timerMode === "total"
                        ? "border-[#0C60FC] bg-blue-50/60 text-[#0C60FC]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    Total time
                  </button>
                </div>

                {/* Slider — shown when a timed mode is selected */}
                {timerMode !== "none" && (
                  <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-950">
                        {timerMode === "per_question"
                          ? "Seconds per question"
                          : "Total minutes"}
                      </p>
                      <span className="rounded-xl bg-[#0C60FC] px-3 py-1 text-xs font-extrabold text-white font-mono">
                        {timerMode === "per_question"
                          ? `${timerSeconds}s`
                          : `${Math.round(timerSeconds / 60)} min`}
                      </span>
                    </div>

                    {/* Quick preset pills */}
                    <div className="flex flex-wrap gap-2">
                      {(timerMode === "per_question"
                        ? [15, 30, 45, 60, 90, 120]
                        : [5, 10, 15, 20, 30, 45]
                      ).map((preset) => {
                        const val =
                          timerMode === "per_question" ? preset : preset * 60;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setTimerSeconds(val)}
                            className={`rounded-full px-3 py-1 text-[10px] font-extrabold transition ${
                              timerSeconds === val
                                ? "bg-[#0C60FC] text-white"
                                : "bg-slate-200/70 text-slate-600 hover:bg-slate-300/60"
                            }`}
                          >
                            {timerMode === "per_question"
                              ? `${preset}s`
                              : `${preset}m`}
                          </button>
                        );
                      })}
                    </div>

                    {/* Range slider */}
                    <input
                      type="range"
                      min={timerMode === "per_question" ? 10 : 60}
                      max={timerMode === "per_question" ? 300 : 7200}
                      step={timerMode === "per_question" ? 5 : 60}
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-200 accent-[#0C60FC]"
                    />
                    <div className="flex justify-between text-[9px] font-extrabold text-slate-400">
                      <span>
                        {timerMode === "per_question" ? "10s" : "1 min"}
                      </span>
                      <span className="text-slate-500">drag to customise</span>
                      <span>
                        {timerMode === "per_question" ? "5 min" : "2 hrs"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <span className="text-xs font-extrabold text-slate-400 font-mono">
                Step 2 of 4
              </span>
              <button
                type="button"
                onClick={handleNextStep}
                className="rounded-2xl bg-slate-950 px-7 py-3.5 text-xs font-extrabold text-white hover:bg-[#0C60FC] transition shadow-md"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: EXPERIENCE */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                  03 · Experience
                </p>
                <h2 className="text-xl font-bold text-slate-950 mt-0.5">
                  Fine-tune the session
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Immediate Feedback Switch */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F7F9FC] p-4">
                  <div>
                    <p className="text-xs font-bold text-slate-950">
                      Immediate feedback
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      {feedbackMode === "immediate"
                        ? "Know immediately if your answer is correct or not"
                        : "Feedback shown after completing the quiz"}
                    </p>
                  </div>
                  <Switch
                    checked={feedbackMode === "immediate"}
                    onCheckedChange={(checked) =>
                      setFeedbackMode(checked ? "immediate" : "deferred")
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F7F9FC] p-4">
                  <div>
                    <p className="text-xs font-bold text-slate-950">
                      Shuffle questions
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      Randomize the order
                    </p>
                  </div>
                  <Switch checked={doShuffle} onCheckedChange={setDoShuffle} />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F7F9FC] p-4">
                  <div>
                    <p className="text-xs font-bold text-slate-950">
                      Show hints
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      Available in any mode. Reveal the answer after each
                      response.
                    </p>
                  </div>
                  <Switch checked={showHints} onCheckedChange={setShowHints} />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F7F9FC] p-4">
                  <div>
                    <p className="text-xs font-bold text-slate-950">
                      Allow skipping
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      Return before finishing
                    </p>
                  </div>
                  <Switch checked={allowSkip} onCheckedChange={setAllowSkip} />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F7F9FC] p-4">
                  <div>
                    <p className="text-xs font-bold text-slate-950">
                      Auto-advance
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      Move on after feedback
                    </p>
                  </div>
                  <Switch checked={autoNext} onCheckedChange={setAutoNext} />
                </div>

                {showZGrading && (
                  <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:col-span-2">
                    <div>
                      <p className="text-xs font-bold text-slate-950">
                        Autograde with Z
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                        {hasFreeTextQuestions
                          ? "Let Z score free-text answers after submission"
                          : "Let Z review and add feedback to your answers"}
                      </p>
                    </div>
                    <Switch
                      checked={useZGrading}
                      onCheckedChange={setUseZGrading}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <span className="text-xs font-extrabold text-slate-400 font-mono">
                Step 3 of 4
              </span>
              <button
                type="button"
                onClick={handleNextStep}
                className="rounded-2xl bg-slate-950 px-7 py-3.5 text-xs font-extrabold text-white hover:bg-[#0C60FC] transition shadow-md"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: REVIEW */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              {/* Left Details Card */}
              <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                    04 · Review
                  </p>
                  <h2 className="text-2xl font-bold text-slate-950 mt-0.5">
                    Ready when you are.
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-slate-500 font-semibold">
                    Check the summary, then start. You can go back to adjust any
                    setting without losing your choices.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-100">
                    <p className="text-3xl font-extrabold text-[#0C60FC]">
                      {selectedKeys.length}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-slate-500">
                      topics selected
                    </p>
                  </div>
                  <div className="rounded-2xl bg-violet-50/60 p-4 border border-violet-100">
                    <p className="text-3xl font-extrabold text-violet-600">4</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-500">
                      question types
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#E9FFD3] p-4 border border-lime-200">
                    <p className="text-3xl font-extrabold text-slate-900">
                      6-8m
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-slate-600">
                      estimated time
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
                  >
                    ← Back
                  </button>
                </div>
              </div>

              {/* Right Summary Card */}
              <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="hand text-lg text-[#0C60FC]">looks good!</p>
                    <h3 className="text-base font-bold text-slate-950">
                      Session summary
                    </h3>
                  </div>

                  <div className="space-y-2.5 divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between pt-1">
                      <span>Selected topics</span>
                      <b className="text-slate-950 font-bold">
                        {selectedKeys.length}
                      </b>
                    </div>
                    <div className="flex justify-between pt-2.5">
                      <span>Questions</span>
                      <b className="text-slate-950 font-bold">
                        {totalSelected} preview
                      </b>
                    </div>
                    <div className="flex justify-between pt-2.5">
                      <span>Feedback</span>
                      <b className="text-slate-950 font-bold">
                        {feedbackMode === "immediate" ? "Immediate" : "After quiz"}
                      </b>
                    </div>
                    {showZGrading && (
                      <div className="flex justify-between pt-2.5">
                        <span>Z grading</span>
                        <b className="text-slate-950 font-bold">
                          {useZGrading ? "On" : "Off"}
                        </b>
                      </div>
                    )}
                    <div className="flex justify-between pt-2.5">
                      <span>Estimated time</span>
                      <b className="text-slate-950 font-bold">6-8 min</b>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Question Mix
                    </p>
                    <div className="h-2.5 rounded-full bg-slate-100 flex overflow-hidden">
                      <div className="h-full w-[40%] bg-[#0C60FC]" />
                      <div className="h-full w-[25%] bg-violet-400" />
                      <div className="h-full w-[20%] bg-[#DFFF61]" />
                      <div className="h-full w-[15%] bg-rose-400" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleFinalStart}
                  className="w-full rounded-2xl bg-[#0C60FC] py-4 text-center text-sm font-extrabold text-white hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Start quiz · {totalSelected} questions →</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
