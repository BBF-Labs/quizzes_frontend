"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Globe,
  Archive,
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  Settings,
  FileJson,
  AlertCircle,
  CheckCircle2,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useAdminQuiz,
  useAdminPublishQuiz,
  useAdminUnpublishQuiz,
  useAdminArchiveQuiz,
  useAdminRestoreQuiz,
  useAdminGenerateQuizAI,
  useAdminPatchQuiz,
  useAdminAddQuizQuestion,
  useAdminAddQuizLecture,
  useAdminAddQuizTopic,
  useAdminBatchUploadQuizQuestions,
  useAdminUpdateQuizQuestion,
  useAdminRemoveQuizQuestion,
  type AdminQuizDetail,
  type AdminQuestion,
  type AddQuestionPayload,
  type GenerateQuizAIPayload,
} from "@/hooks/admin/use-academics";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  draft: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  published: "text-green-500 border-green-500/30 bg-green-500/10",
  archived: "text-muted-foreground border-border/40 bg-card/40",
};

const TYPE_LABELS: Record<string, string> = {
  mcq: "MCQ",
  true_false: "T/F",
  short_answer: "Short",
  essay: "Essay",
  fill_in_blank: "Fill",
};

const QUESTION_TYPES = [
  "mcq",
  "true_false",
  "short_answer",
  "essay",
  "fill_in_blank",
] as const;

// ─── Question form (shared for add & edit) ────────────────────────────────────

interface QuestionFormState {
  question: string;
  type: string;
  options: string[];
  answer: string;
  explanation: string;
  hint: string;
}

function blankForm(type = "mcq"): QuestionFormState {
  return {
    question: "",
    type,
    options:
      type === "true_false"
        ? ["True", "False"]
        : type === "mcq"
          ? ["", "", "", ""]
          : [],
    answer: "",
    explanation: "",
    hint: "",
  };
}

function QuestionForm({
  initial,
  onSave,
  onCancel,
  saving,
  lockType,
}: {
  initial: QuestionFormState;
  onSave: (f: QuestionFormState) => void;
  onCancel: () => void;
  saving: boolean;
  lockType?: boolean;
}) {
  const [form, setForm] = useState<QuestionFormState>(initial);

  const handleTypeChange = (t: string) => {
    setForm((f) => ({
      ...f,
      type: t,
      options:
        t === "true_false"
          ? ["True", "False"]
          : t === "mcq"
            ? f.options.length >= 2
              ? f.options
              : ["", "", "", ""]
            : [],
      answer: "",
    }));
  };

  const setOption = (i: number, v: string) =>
    setForm((f) => {
      const opts = [...f.options];
      opts[i] = v;
      return { ...f, options: opts };
    });

  const addOption = () =>
    setForm((f) => ({ ...f, options: [...f.options, ""] }));

  const removeOption = (i: number) =>
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, idx) => idx !== i),
    }));

  const valid =
    form.question.trim().length > 0 &&
    form.answer.trim().length > 0 &&
    (form.type !== "mcq" || form.options.every((o) => o.trim().length > 0));

  const showOptions = form.type === "mcq" || form.type === "true_false";

  return (
    <div className="space-y-3 p-4 border border-primary/20 bg-primary/5">
      {/* Type */}
      {!lockType && (
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Type
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUESTION_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`px-2 py-1 text-[9px] font-mono uppercase tracking-widest border transition-all ${
                  form.type === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 text-muted-foreground/50 hover:border-primary/30"
                }`}
              >
                {TYPE_LABELS[t] ?? t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question text */}
      <div>
        <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
          Question *
        </label>
        <textarea
          rows={2}
          value={form.question}
          onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
          className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 resize-none transition-colors"
          placeholder="Enter question text…"
        />
      </div>

      {/* Options */}
      {showOptions && (
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Options *
          </label>
          <div className="space-y-1.5">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground/40 w-4 shrink-0">
                  {String.fromCharCode(65 + i)}.
                </span>
                <input
                  value={opt}
                  disabled={form.type === "true_false"}
                  onChange={(e) => setOption(i, e.target.value)}
                  className="flex-1 border border-border/50 bg-background/40 px-2 py-1.5 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                />
                {form.type === "mcq" && form.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-muted-foreground/30 hover:text-destructive transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}
            {form.type === "mcq" && form.options.length < 8 && (
              <button
                type="button"
                onClick={addOption}
                className="text-[9px] font-mono text-primary/60 hover:text-primary transition-colors flex items-center gap-1"
              >
                <Plus className="size-3" /> Add option
              </button>
            )}
          </div>
        </div>
      )}

      {/* Answer */}
      <div>
        <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
          Answer *
        </label>
        {showOptions ? (
          <select
            value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="">Select correct answer…</option>
            {form.options
              .filter((o) => o.trim())
              .map((o, i) => (
                <option key={i} value={o}>
                  {String.fromCharCode(65 + i)}. {o}
                </option>
              ))}
          </select>
        ) : (
          <input
            value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
            placeholder="Correct answer…"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        )}
      </div>

      {/* Explanation + Hint (collapsible feel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Explanation
          </label>
          <textarea
            rows={2}
            value={form.explanation}
            onChange={(e) =>
              setForm((f) => ({ ...f, explanation: e.target.value }))
            }
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 resize-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Hint
          </label>
          <textarea
            rows={2}
            value={form.hint}
            onChange={(e) => setForm((f) => ({ ...f, hint: e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 resize-none transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => valid && onSave(form)}
          disabled={!valid || saving}
          className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-1.5"
        >
          {saving ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Question card ─────────────────────────────────────────────────────────────

function QuestionCard({ q, quizId }: { q: AdminQuestion; quizId: string }) {
  const [editing, setEditing] = useState(false);
  const updateMutation = useAdminUpdateQuizQuestion(quizId);
  const removeMutation = useAdminRemoveQuizQuestion(quizId);

  const handleSave = async (form: QuestionFormState) => {
    try {
      await updateMutation.mutateAsync({
        questionId: q._id || q.id,
        data: {
          question: form.question,
          options: form.options,
          answer: form.answer,
          type: form.type as AdminQuestion["type"],
          explanation: form.explanation || undefined,
          hint: form.hint || undefined,
        },
      });
      toast.success("Question updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update question");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    try {
      await removeMutation.mutateAsync(q._id || q.id);
      toast.success("Question removed");
    } catch {
      toast.error("Failed to remove question");
    }
  };

  if (editing) {
    return (
      <QuestionForm
        initial={{
          question: q.question,
          type: q.type,
          options: q.options ?? [],
          answer: q.answer ?? q.correctAnswer,
          explanation: q.explanation ?? "",
          hint: q.hint ?? "",
        }}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
        saving={updateMutation.isPending}
        lockType
      />
    );
  }

  return (
    <div className="group flex items-start gap-3 py-2.5 px-3 border border-border/30 bg-card/20 hover:border-border/50 transition-colors">
      <Badge
        variant="outline"
        className="text-[8px] font-mono h-4 px-1.5 shrink-0 mt-0.5"
      >
        {TYPE_LABELS[q.type] ?? q.type}
      </Badge>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-mono text-foreground leading-snug">
          {q.question}
        </p>
        <p className="text-[10px] font-mono text-primary/60 mt-0.5">
          → {q.answer ?? q.correctAnswer}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="p-1 text-muted-foreground/40 hover:text-primary transition-colors"
        >
          <Pencil className="size-3" />
        </button>
        <button
          onClick={handleDelete}
          disabled={removeMutation.isPending}
          className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors disabled:opacity-40"
        >
          {removeMutation.isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Trash2 className="size-3" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Topic section ─────────────────────────────────────────────────────────────

function TopicSection({
  topic,
  lectureIndex,
  topicIndex,
  quizId,
}: {
  topic: AdminQuizDetail["lectures"][number]["topics"][number];
  lectureIndex: number;
  topicIndex: number;
  quizId: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const addMutation = useAdminAddQuizQuestion(quizId);

  // Use questionTypes grouping if available (has type info), fall back to flat questions
  const groups = topic.questionTypes?.length
    ? topic.questionTypes
    : topic.questions?.length
      ? [{ type: "mcq", questions: topic.questions }]
      : [];

  const totalQ = groups.reduce((s, g) => s + g.questions.length, 0);

  const handleAdd = async (form: QuestionFormState) => {
    try {
      const payload: AddQuestionPayload = {
        lectureIndex,
        topicIndex,
        type: form.type,
        question: form.question,
        options: form.options,
        answer: form.answer,
        explanation: form.explanation || undefined,
        hint: form.hint || undefined,
      };
      await addMutation.mutateAsync(payload);
      toast.success("Question added");
      setShowAdd(false);
    } catch {
      toast.error("Failed to add question");
    }
  };

  return (
    <div className="pl-4 border-l border-border/30 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-mono font-semibold text-foreground">
          {topic.topicTitle || topic.title}
          <span className="ml-2 text-muted-foreground/40 font-normal">
            {totalQ} Qs
          </span>
        </p>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
        >
          <Plus className="size-3" />
          Add Question
        </button>
      </div>

      {showAdd && (
        <QuestionForm
          initial={blankForm()}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
          saving={addMutation.isPending}
        />
      )}

      {groups.map((g, gi) => (
        <div key={gi} className="space-y-1">
          {groups.length > 1 && (
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
              {TYPE_LABELS[g.type] ?? g.type}
            </p>
          )}
          {g.questions.map((q) => (
            <QuestionCard key={q._id || q.id} q={q} quizId={quizId} />
          ))}
        </div>
      ))}

      {totalQ === 0 && !showAdd && (
        <p className="text-[10px] font-mono text-muted-foreground/30 py-1">
          No questions yet.
        </p>
      )}
    </div>
  );
}

// ─── AI Generation panel ───────────────────────────────────────────────────────

function AIGeneratePanel({
  quizId,
  courseId,
  onDone,
}: {
  quizId: string;
  courseId: string;
  onDone: () => void;
}) {
  const generateMutation = useAdminGenerateQuizAI();
  const [form, setForm] = useState<GenerateQuizAIPayload>({
    quizId,
    courseId,
    topic: "",
    numberOfQuestions: 20,
    questionTypes: ["mcq"],
    difficulty: "mixed",
    lectureTitle: "",
  });

  const toggleType = (t: string) =>
    setForm((f) => ({
      ...f,
      questionTypes: f.questionTypes.includes(t)
        ? f.questionTypes.filter((x) => x !== t)
        : [...f.questionTypes, t],
    }));

  const handleGenerate = async () => {
    if (!form.topic.trim()) {
      toast.error("Topic is required");
      return;
    }
    try {
      const result = await generateMutation.mutateAsync(form);
      toast.success(`Generation queued — Job ID: ${result?.jobId}`);
      onDone();
    } catch {
      toast.error("Failed to queue generation");
    }
  };

  const types = ["mcq", "true-false", "fill-in", "short-answer"];
  const difficulties = ["basic", "intermediate", "advanced", "mixed"];

  return (
    <div className="border border-primary/30 bg-primary/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-3.5 text-primary" />
        <p className="text-[11px] font-mono uppercase tracking-widest font-bold">
          AI Question Generation
        </p>
      </div>
      <p className="text-[10px] font-mono text-muted-foreground/60">
        Describe a topic and Z will generate questions in bulk. They&apos;ll be
        appended as a new lecture to this quiz.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Topic / Subject *
          </label>
          <input
            value={form.topic}
            onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            placeholder="e.g. Binary search trees, Photosynthesis…"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Lecture Title (optional)
          </label>
          <input
            value={form.lectureTitle ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, lectureTitle: e.target.value }))
            }
            placeholder="Defaults to topic name"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Number of Questions
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.numberOfQuestions}
            onChange={(e) =>
              setForm((f) => ({ ...f, numberOfQuestions: +e.target.value }))
            }
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Difficulty
          </label>
          <select
            value={form.difficulty}
            onChange={(e) =>
              setForm((f) => ({ ...f, difficulty: e.target.value }))
            }
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Question Types
          </label>
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={`px-2 py-1 text-[9px] font-mono uppercase tracking-widest border transition-all ${
                  form.questionTypes.includes(t)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 text-muted-foreground/50 hover:border-primary/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          className="h-8 gap-1.5 text-[10px] font-mono"
          onClick={handleGenerate}
          disabled={
            generateMutation.isPending ||
            !form.topic.trim() ||
            form.questionTypes.length === 0
          }
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Queuing…
            </>
          ) : (
            <>
              <Sparkles className="size-3" />
              Generate Questions
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Edit info panel ───────────────────────────────────────────────────────────

function EditInfoPanel({
  quiz,
  quizId,
  onClose,
}: {
  quiz: AdminQuizDetail;
  quizId: string;
  onClose: () => void;
}) {
  const patchMutation = useAdminPatchQuiz(quizId);
  const [form, setForm] = useState({
    title: quiz.title,
    description: quiz.description ?? "",
    passingScore: quiz.passingScore,
    tags: (quiz.tags ?? []).join(", "),
    isAvailable: quiz.isAvailable,
    availableFrom: quiz.availableFrom ? quiz.availableFrom.slice(0, 16) : "",
    availableTo: quiz.availableTo ? quiz.availableTo.slice(0, 16) : "",
    timeLimit: quiz.settings?.timeLimit ?? "",
    shuffleQuestions: quiz.settings?.shuffleQuestions ?? true,
    showHints: quiz.settings?.showHints ?? true,
    showExplanations: quiz.settings?.showExplanations ?? true,
  });

  const handleSave = async () => {
    try {
      await patchMutation.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        passingScore: Number(form.passingScore),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isAvailable: form.isAvailable,
        availableFrom: form.availableFrom || undefined,
        availableTo: form.availableTo || undefined,
        settings: {
          timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined,
          shuffleQuestions: form.shuffleQuestions,
          showHints: form.showHints,
          showExplanations: form.showExplanations,
        },
      });
      toast.success("Quiz updated");
      onClose();
    } catch {
      toast.error("Failed to update quiz");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-primary/30 bg-primary/5 p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="size-3.5 text-primary" />
          <p className="text-[11px] font-mono uppercase tracking-widest font-bold">
            Edit Quiz Info
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground/40 hover:text-muted-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Title *
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 resize-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Passing Score (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.passingScore}
            onChange={(e) =>
              setForm((f) => ({ ...f, passingScore: +e.target.value }))
            }
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Time Limit (min)
          </label>
          <input
            type="number"
            min={0}
            value={form.timeLimit}
            onChange={(e) =>
              setForm((f) => ({ ...f, timeLimit: e.target.value }))
            }
            placeholder="No limit"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Tags (comma-separated)
          </label>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="e.g. algorithms, midterm"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Available From
          </label>
          <input
            type="datetime-local"
            value={form.availableFrom}
            onChange={(e) =>
              setForm((f) => ({ ...f, availableFrom: e.target.value }))
            }
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Available To
          </label>
          <input
            type="datetime-local"
            value={form.availableTo}
            onChange={(e) =>
              setForm((f) => ({ ...f, availableTo: e.target.value }))
            }
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4">
        {(
          [
            ["isAvailable", "Mark as Available"],
            ["shuffleQuestions", "Shuffle Questions"],
            ["showHints", "Show Hints"],
            ["showExplanations", "Show Explanations"],
          ] as [keyof typeof form, string][]
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form[key] as boolean}
              onChange={(e) =>
                setForm((f) => ({ ...f, [key]: e.target.checked }))
              }
              className="accent-primary"
            />
            <span className="text-[10px] font-mono text-muted-foreground/70">
              {label}
            </span>
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={patchMutation.isPending || !form.title.trim()}
          className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          {patchMutation.isPending && (
            <Loader2 className="size-3 animate-spin" />
          )}
          Save Changes
        </button>
      </div>
    </motion.div>
  );
}

// ─── JSON Import Panel ────────────────────────────────────────────────────────

interface ParsedImportQuestion {
  question: string;
  type: string;
  options?: string[];
  answer: string;
  explanation?: string;
  hint?: string;
  // Populated for structured imports
  _lectureTitle?: string;
  _topicTitle?: string;
}

interface StructuredImportLecture {
  title: string;
  topics: { title: string; questions: ParsedImportQuestion[] }[];
}

interface ParsedResult {
  kind: "flat" | "structured";
  questions: ParsedImportQuestion[];
  lectures?: StructuredImportLecture[];
}

const QUESTION_TYPE_COLORS: Record<string, string> = {
  mcq: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  true_false: "text-green-400 border-green-400/30 bg-green-400/10",
  short_answer: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  essay: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  fill_in_blank: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
};

function validateQuestion(q: ParsedImportQuestion, label: string) {
  if (!q.question) throw new Error(`${label} missing "question" field`);
  if (!q.type) throw new Error(`${label} missing "type" field`);
  if (!q.answer) throw new Error(`${label} missing "answer" field`);
}

function JsonImportPanel({
  quizId,
  quiz,
  onDone,
}: {
  quizId: string;
  quiz: AdminQuizDetail;
  onDone: () => void;
}) {
  const batchMutation = useAdminBatchUploadQuizQuestions(quizId);
  const addLectureMutation = useAdminAddQuizLecture(quizId);
  const addTopicMutation = useAdminAddQuizTopic(quizId);
  const [jsonRaw, setJsonRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  // Used only for flat imports
  const [lectureIndex, setLectureIndex] = useState(0);
  const [topicIndex, setTopicIndex] = useState(0);

  const lectures = quiz.lectures ?? [];
  const topics = lectures[lectureIndex]?.topics ?? [];

  const handleParse = () => {
    setParseError(null);
    setParsed(null);
    try {
      const obj = JSON.parse(jsonRaw);

      // ── Structured format: { lectures: [...] } ──────────────────────────
      if (
        obj &&
        typeof obj === "object" &&
        !Array.isArray(obj) &&
        Array.isArray(obj.lectures)
      ) {
        const structuredLectures: StructuredImportLecture[] = [];
        const flatQuestions: ParsedImportQuestion[] = [];

        for (const [li, lec] of (obj.lectures as Array<{title: string; topics: Array<{title: string; questions: ParsedImportQuestion[]}>}>).entries()) {
          if (!lec.title) throw new Error(`Lecture ${li + 1} missing "title"`);
          const topics: StructuredImportLecture["topics"] = [];

          for (const [ti, top] of ((lec.topics ?? []) as Array<{title: string; questions: ParsedImportQuestion[]}>).entries()) {
            if (!top.title)
              throw new Error(
                `Lecture ${li + 1} → Topic ${ti + 1} missing "title"`,
              );
            const qs: ParsedImportQuestion[] = [];
            for (const [qi, q] of ((top.questions ?? []) as ParsedImportQuestion[]).entries()) {
              validateQuestion(
                q,
                `Lecture "${lec.title}" → Topic "${top.title}" → Q${qi + 1}`,
              );
              const enriched = {
                ...q,
                _lectureTitle: lec.title,
                _topicTitle: top.title,
              };
              qs.push(enriched);
              flatQuestions.push(enriched);
            }
            topics.push({ title: top.title, questions: qs });
          }
          structuredLectures.push({ title: lec.title, topics });
        }

        if (flatQuestions.length === 0)
          throw new Error("No questions found in structured JSON");
        setParsed({
          kind: "structured",
          questions: flatQuestions,
          lectures: structuredLectures,
        });
        return;
      }

      // ── Flat format: [...] or { questions: [...] } ──────────────────────
      const questions: ParsedImportQuestion[] = Array.isArray(obj)
        ? obj
        : obj.questions;
      if (!Array.isArray(questions))
        throw new Error(
          "JSON must be an array, { questions: [...] }, or { lectures: [...] }",
        );
      for (const [i, q] of questions.entries()) {
        validateQuestion(q, `Question ${i + 1}`);
      }
      setParsed({ kind: "flat", questions });
    } catch (err: unknown) {
      setParseError((err instanceof Error ? err.message : String(err)) ?? "Invalid JSON");
    }
  };

  const handleImport = async () => {
    if (!parsed) return;
    try {
      if (parsed.kind === "flat") {
        await batchMutation.mutateAsync({
          questions: parsed.questions.map((q) => ({
            lectureIndex,
            topicIndex,
            type: q.type,
            question: q.question,
            options: q.options ?? [],
            answer: q.answer,
            explanation: q.explanation || undefined,
            hint: q.hint || undefined,
          })),
        });
      } else {
        // ── Structured import: create missing lectures/topics first ──
        // Build a live index map from the current quiz state
        const lecTitleToIdx = new Map<string, number>(
          lectures.map((l, i) => [
            (l.title || l.lectureTitle || "").toLowerCase(),
            i,
          ]),
        );
        let nextLecIdx = lectures.length;
        // topicTitleToIdx[lecIdx] → Map<title → topicIdx>
        const topTitleToIdx = new Map<number, Map<string, number>>(
          lectures.map((l, li) => [
            li,
            new Map(
              (l.topics ?? []).map((t, ti) => [
                (t.title || t.topicTitle || "").toLowerCase(),
                ti,
              ]),
            ),
          ]),
        );

        const questionBatch: AddQuestionPayload[] = [];

        for (const lec of parsed.lectures ?? []) {
          const lKey = lec.title.toLowerCase();
          let lIdx = lecTitleToIdx.get(lKey);
          if (lIdx === undefined) {
            await addLectureMutation.mutateAsync({ title: lec.title });
            lIdx = nextLecIdx++;
            lecTitleToIdx.set(lKey, lIdx);
            topTitleToIdx.set(lIdx, new Map());
          }

          const topMap = topTitleToIdx.get(lIdx) ?? new Map<string, number>();
          let nextTopIdx = topMap.size;

          for (const top of lec.topics) {
            const tKey = top.title.toLowerCase();
            let tIdx = topMap.get(tKey);
            if (tIdx === undefined) {
              await addTopicMutation.mutateAsync({
                lectureIndex: lIdx,
                title: top.title,
              });
              tIdx = nextTopIdx++;
              topMap.set(tKey, tIdx);
            }

            for (const q of top.questions) {
              questionBatch.push({
                lectureIndex: lIdx,
                topicIndex: tIdx,
                type: q.type,
                question: q.question,
                options: q.options ?? [],
                answer: q.answer,
                explanation: q.explanation || undefined,
                hint: q.hint || undefined,
              });
            }
          }
        }

        if (questionBatch.length > 0) {
          await batchMutation.mutateAsync({ questions: questionBatch });
        }
      }

      toast.success(
        `${parsed.questions.length} question${parsed.questions.length !== 1 ? "s" : ""} imported`,
      );
      onDone();
    } catch (err: unknown) {
      const message = ((err as Record<string, unknown>)?.response as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
      toast.error((message?.message as string) ?? "Import failed");
    }
  };

  const isImporting =
    batchMutation.isPending ||
    addLectureMutation.isPending ||
    addTopicMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-primary/30 bg-primary/5 p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <FileJson className="size-3.5 text-primary" />
        <p className="text-[11px] font-mono uppercase tracking-widest font-bold">
          JSON Import
        </p>
      </div>
      <p className="text-[10px] font-mono text-muted-foreground/60">
        Paste a <span className="text-muted-foreground/80">flat</span> array{" "}
        <span className="font-mono text-muted-foreground/40">
          {"[{ question, type, answer }]"}
        </span>{" "}
        or a <span className="text-muted-foreground/80">structured</span> object{" "}
        <span className="font-mono text-muted-foreground/40">
          {"{ lectures: [{ title, topics: [{ title, questions }] }] }"}
        </span>
        . New lectures and topics are created automatically for structured
        imports.
      </p>

      {/* Lecture / Topic selectors — flat mode only */}
      {parsed?.kind !== "structured" && lectures.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
              Target Lecture
            </label>
            <Select
              value={String(lectureIndex)}
              onValueChange={(v) => {
                setLectureIndex(Number(v));
                setTopicIndex(0);
              }}
            >
              <SelectTrigger className="w-auto min-w-40 rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
                {lectures.map((l, i) => (
                  <SelectItem
                    key={i}
                    value={String(i)}
                    className="rounded-(--radius) font-mono text-xs uppercase"
                  >
                    {l.title || l.lectureTitle || `Lecture ${i + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
              Target Topic
            </label>
            <Select
              value={String(topicIndex)}
              onValueChange={(v) => setTopicIndex(Number(v))}
            >
              <SelectTrigger className="w-auto min-w-40 rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
                {topics.map((t, i) => (
                  <SelectItem
                    key={i}
                    value={String(i)}
                    className="rounded-(--radius) font-mono text-xs uppercase"
                  >
                    {t.title || t.topicTitle || `Topic ${i + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <textarea
        value={jsonRaw}
        onChange={(e) => {
          setJsonRaw(e.target.value);
          setParsed(null);
          setParseError(null);
        }}
        rows={10}
        placeholder={`// Flat format:\n[\n  { "question": "What is a process?", "type": "mcq", "options": ["A running program", "A file"], "answer": "A running program" }\n]\n\n// Structured format:\n{\n  "lectures": [\n    {\n      "title": "Introduction to OS",\n      "topics": [\n        {\n          "title": "Processes",\n          "questions": [\n            { "question": "...", "type": "mcq", "options": [...], "answer": "..." }\n          ]\n        }\n      ]\n    }\n  ]\n}`}
        className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[11px] font-mono focus:outline-none focus:border-primary/50 resize-none transition-colors leading-relaxed"
      />

      {parseError && (
        <div className="flex items-start gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2">
          <AlertCircle className="size-3.5 text-destructive shrink-0 mt-0.5" />
          <p className="text-[10px] font-mono text-destructive">{parseError}</p>
        </div>
      )}

      {parsed && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-border/40 bg-card/30 p-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-green-400 shrink-0" />
            <p className="text-[10px] font-mono text-green-400 uppercase tracking-widest">
              Valid · {parsed.questions.length} question
              {parsed.questions.length !== 1 ? "s" : ""}
              {parsed.kind === "structured" &&
                ` across ${parsed.lectures?.length} lecture${parsed.lectures?.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {parsed.kind === "structured" ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {parsed.lectures?.map((lec, li) => (
                <div key={li}>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-primary/70 mb-1">
                    {lec.title}
                  </p>
                  {lec.topics.map((top, ti) => (
                    <div
                      key={ti}
                      className="pl-3 border-l border-border/30 mb-1.5"
                    >
                      <p className="text-[9px] font-mono text-muted-foreground/60 mb-1">
                        {top.title}
                      </p>
                      {top.questions.map((q, qi) => (
                        <div key={qi} className="flex items-start gap-2 py-0.5">
                          <span
                            className={`text-[8px] font-mono uppercase tracking-widest px-1 py-0.5 border shrink-0 ${QUESTION_TYPE_COLORS[q.type] ?? "text-muted-foreground border-border/30"}`}
                          >
                            {q.type.replace("_", " ")}
                          </span>
                          <p className="text-[10px] font-mono text-foreground/70 line-clamp-1 flex-1">
                            {q.question}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {parsed.questions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 py-1 border-t border-border/20"
                >
                  <span className="text-[9px] font-mono text-muted-foreground/30 w-5 shrink-0 pt-px">
                    {i + 1}.
                  </span>
                  <span
                    className={`text-[8px] font-mono uppercase tracking-widest px-1 py-0.5 border shrink-0 ${QUESTION_TYPE_COLORS[q.type] ?? "text-muted-foreground border-border/30"}`}
                  >
                    {q.type.replace("_", " ")}
                  </span>
                  <p className="text-[11px] font-mono text-foreground/80 line-clamp-1 flex-1">
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors"
        >
          Cancel
        </button>
        {!parsed ? (
          <button
            type="button"
            onClick={handleParse}
            disabled={!jsonRaw.trim()}
            className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-40 transition-all"
          >
            Validate JSON
          </button>
        ) : (
          <Button
            size="sm"
            className="h-8 gap-1.5 text-[10px] font-mono"
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <FileJson className="size-3" />
            )}
            Import {parsed.questions.length} Question
            {parsed.questions.length !== 1 ? "s" : ""}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Inline section-creation helpers ─────────────────────────────────────────

function AddLectureInline({ quizId }: { quizId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const mutation = useAdminAddQuizLecture(quizId);

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      await mutation.mutateAsync({ title: title.trim() });
      toast.success("Lecture added");
      setTitle("");
      setOpen(false);
    } catch {
      toast.error("Failed to add lecture");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
      >
        <Plus className="size-3" /> Add Lecture
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Lecture title…"
        className="flex-1 bg-transparent text-[12px] font-mono focus:outline-none text-foreground placeholder:text-muted-foreground/40"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={!title.trim() || mutation.isPending}
        className="text-[9px] font-mono uppercase tracking-widest text-primary hover:opacity-80 disabled:opacity-40 transition-all flex items-center gap-1"
      >
        {mutation.isPending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Check className="size-3" />
        )}
        Save
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-muted-foreground/40 hover:text-muted-foreground"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

function AddTopicInline({
  quizId,
  lectureIndex,
}: {
  quizId: string;
  lectureIndex: number;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const mutation = useAdminAddQuizTopic(quizId);

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      await mutation.mutateAsync({ lectureIndex, title: title.trim() });
      toast.success("Topic added");
      setTitle("");
      setOpen(false);
    } catch {
      toast.error("Failed to add topic");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors"
      >
        <Plus className="size-3" /> Add Topic
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 border border-border/40 bg-card/30 px-3 py-1.5">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Topic title…"
        className="flex-1 bg-transparent text-[12px] font-mono focus:outline-none text-foreground placeholder:text-muted-foreground/40"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={!title.trim() || mutation.isPending}
        className="text-[9px] font-mono uppercase text-primary hover:opacity-80 disabled:opacity-40 transition-all flex items-center gap-1"
      >
        {mutation.isPending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Check className="size-3" />
        )}
        Save
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-muted-foreground/40 hover:text-muted-foreground"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

// ─── Execution Flow Panel ─────────────────────────────────────────────────────

function ExecutionFlowPanel({
  quiz,
  openLectures,
  toggleLecture,
}: {
  quiz: AdminQuizDetail;
  openLectures: Set<number>;
  toggleLecture: (i: number) => void;
}) {
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());

  const toggleTopic = (lectureIdx: number, topicIdx: number) => {
    const key = `${lectureIdx}_${topicIdx}`;
    setOpenTopics((s) => {
      const n = new Set(s);
      if (n.has(key)) {
        n.delete(key);
      } else {
        n.add(key);
      }
      return n;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-primary/30 bg-primary/5 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChevronDown className="size-3.5 text-primary" />
          <p className="text-[11px] font-mono uppercase tracking-widest font-bold">
            Deterministic Execution Flow
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto [scrollbar-width:thin]">
        {!(quiz.lectures ?? []).length ? (
          <p className="text-[10px] font-mono text-muted-foreground/40 text-center py-4">
            No lectures yet
          </p>
        ) : (
          (quiz.lectures ?? []).map((lecture, lectureIdx) => {
            const topicCount = (lecture.topics ?? []).length;
            const lectureQCount = (lecture.topics ?? []).reduce(
              (s, t) =>
                s +
                ((t.questionTypes ?? []).reduce(
                  (ss, qt) => ss + (qt.questions ?? []).length,
                  0,
                ) ||
                  (t.questions ?? []).length),
              0,
            );

            return (
              <div key={lectureIdx} className="space-y-1">
                {/* Lecture header */}
                <button
                  type="button"
                  onClick={() => toggleLecture(lectureIdx)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-primary/10 transition-colors rounded-sm"
                >
                  {openLectures.has(lectureIdx) ? (
                    <ChevronDown className="size-3 shrink-0 text-primary" />
                  ) : (
                    <ChevronRight className="size-3 shrink-0 text-muted-foreground/50" />
                  )}
                  <span className="font-mono font-bold text-[10px] text-foreground flex-1 truncate">
                    {lecture.lectureTitle || lecture.title}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground/40 shrink-0">
                    {topicCount} topics · {lectureQCount} Qs
                  </span>
                </button>

                {/* Topics (shown when lecture is open) */}
                {openLectures.has(lectureIdx) && (
                  <div className="pl-6 space-y-1 border-l border-primary/20">
                    {(lecture.topics ?? []).map((topic, topicIdx) => {
                      const qCount =
                        (topic.questionTypes ?? []).reduce(
                          (s, qt) => s + (qt.questions ?? []).length,
                          0,
                        ) || (topic.questions ?? []).length;
                      const topicKey = `${lectureIdx}_${topicIdx}`;

                      return (
                        <div key={topicIdx} className="space-y-0.5">
                          {/* Topic header */}
                          <button
                            type="button"
                            onClick={() => toggleTopic(lectureIdx, topicIdx)}
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-primary/5 transition-colors rounded-sm"
                          >
                            {openTopics.has(topicKey) ? (
                              <ChevronDown className="size-2.5 shrink-0 text-primary/70" />
                            ) : (
                              <ChevronRight className="size-2.5 shrink-0 text-muted-foreground/50" />
                            )}
                            <span className="font-mono text-[9px] text-foreground flex-1 truncate">
                              {topic.topicTitle || topic.title}
                            </span>
                            <span className="text-[7px] font-mono text-muted-foreground/40 shrink-0">
                              {qCount} Qs
                            </span>
                          </button>

                          {/* Questions (shown when topic is open) */}
                          {openTopics.has(topicKey) && (
                            <div className="pl-5 space-y-0.5 border-l border-primary/10">
                              {(topic.questionTypes ?? []).length > 0 ? (
                                (topic.questionTypes ?? []).map(
                                  (qt, qtIdx) => (
                                    <div
                                      key={qtIdx}
                                      className="space-y-0.5"
                                    >
                                      {(qt.questions ?? []).map(
                                        (q, qIdx) => (
                                          <div
                                            key={qIdx}
                                            className="flex items-start gap-2 py-1 px-2 text-[8px] font-mono text-muted-foreground/60 hover:bg-primary/5 rounded-sm transition-colors"
                                          >
                                            <span className="shrink-0 text-[7px] text-muted-foreground/40">
                                              {qIdx + 1}.
                                            </span>
                                            <span className="inline-block px-1 py-0.5 border border-primary/20 bg-primary/5 text-[7px] uppercase shrink-0">
                                              {TYPE_LABELS[q.type] ||
                                                q.type.replace("_", " ")}
                                            </span>
                                            <span className="flex-1 line-clamp-1">
                                              {q.question}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  ),
                                )
                              ) : (
                                <p className="text-[8px] text-muted-foreground/30 px-2 py-1">
                                  No questions
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

function ContentSection({
  quizId,
  quiz,
  openLectures,
  toggleLecture,
}: {
  quizId: string;
  quiz: AdminQuizDetail;
  openLectures: Set<number>;
  toggleLecture: (i: number) => void;
}) {
  return (
    <div>
      <div className="border-b border-border/40 pb-2 mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-mono uppercase tracking-widest font-bold">
          Content
        </h2>
        <span className="text-[9px] font-mono text-muted-foreground/40">
          {(quiz.lectures ?? []).length} lecture
          {(quiz.lectures ?? []).length !== 1 ? "s" : ""}
        </span>
      </div>

      {!(quiz.lectures ?? []).length ? (
        <EmptyContentState quizId={quizId} quiz={quiz} />
      ) : (
        <div className="space-y-2">
          {(quiz.lectures ?? []).map((l, li) => {
            const topicCount = (l.topics ?? []).length;
            const lectureQ = (l.topics ?? []).reduce(
              (s, t) =>
                s +
                ((t.questionTypes ?? []).reduce(
                  (ss, qt) => ss + (qt.questions ?? []).length,
                  0,
                ) || (t.questions ?? []).length),
              0,
            );
            return (
              <div key={li} className="border border-border/40 bg-card/20">
                <button
                  type="button"
                  onClick={() => toggleLecture(li)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/10 transition-colors"
                >
                  {openLectures.has(li) ? (
                    <ChevronDown className="size-3.5 shrink-0 text-muted-foreground/50" />
                  ) : (
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
                  )}
                  <span className="font-mono font-bold text-sm text-foreground flex-1 truncate">
                    {l.lectureTitle || l.title}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0">
                    {topicCount} topics · {lectureQ} Qs
                  </span>
                </button>

                {openLectures.has(li) && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-3">
                    {(l.topics ?? []).map((t, ti) => (
                      <TopicSection
                        key={ti}
                        topic={t}
                        lectureIndex={li}
                        topicIndex={ti}
                        quizId={quizId}
                      />
                    ))}
                    {!(l.topics ?? []).length && (
                      <p className="text-[10px] font-mono text-muted-foreground/30 py-1">
                        No topics yet.
                      </p>
                    )}
                    <AddTopicInline quizId={quizId} lectureIndex={li} />
                  </div>
                )}
              </div>
            );
          })}
          <div className="pt-1">
            <AddLectureInline quizId={quizId} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty content state ──────────────────────────────────────────────────────

function EmptyContentState({
  quizId,
  quiz,
}: {
  quizId: string;
  quiz: AdminQuizDetail;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [lectureTitle, setLectureTitle] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const addLectureMutation = useAdminAddQuizLecture(quizId);
  const addTopicMutation = useAdminAddQuizTopic(quizId);
  const addMutation = useAdminAddQuizQuestion(quizId);

  const lectures = quiz.lectures ?? [];
  const hasStructure = lectures.length > 0;

  // For quizzes that already have lectures/topics, just pick where to add
  const [lectureIndex, setLectureIndex] = useState(0);
  const [topicIndex, setTopicIndex] = useState(0);
  const topics = lectures[lectureIndex]?.topics ?? [];

  const isSaving =
    addLectureMutation.isPending ||
    addTopicMutation.isPending ||
    addMutation.isPending;

  const handleAdd = async (form: QuestionFormState) => {
    try {
      let lIdx = lectureIndex;
      let tIdx = topicIndex;

      if (!hasStructure) {
        // Create lecture then topic first
        await addLectureMutation.mutateAsync({
          title: lectureTitle.trim() || "Lecture 1",
        });
        lIdx = 0;
        await addTopicMutation.mutateAsync({
          lectureIndex: 0,
          title: topicTitle.trim() || "Topic 1",
        });
        tIdx = 0;
      }

      await addMutation.mutateAsync({
        lectureIndex: lIdx,
        topicIndex: tIdx,
        type: form.type,
        question: form.question,
        options: form.options,
        answer: form.answer,
        explanation: form.explanation || undefined,
        hint: form.hint || undefined,
      });
      toast.success("Question added");
      setShowAdd(false);
    } catch {
      toast.error("Failed to add question");
    }
  };

  if (showAdd) {
    return (
      <div className="space-y-3">
        {/* Section pickers */}
        {!hasStructure ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-border/30 bg-card/20">
            <div>
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
                Lecture Title
              </label>
              <input
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
                placeholder="e.g. Introduction to OS"
                className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
                Topic Title
              </label>
              <input
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="e.g. Processes"
                className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap p-4 border border-border/30 bg-card/20">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
                Lecture
              </label>
              <Select
                value={String(lectureIndex)}
                onValueChange={(v) => {
                  setLectureIndex(Number(v));
                  setTopicIndex(0);
                }}
              >
                <SelectTrigger className="w-auto min-w-40 rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
                  {lectures.map((l, i) => (
                    <SelectItem
                      key={i}
                      value={String(i)}
                      className="rounded-(--radius) font-mono text-xs uppercase"
                    >
                      {l.title || l.lectureTitle || `Lecture ${i + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
                Topic
              </label>
              <Select
                value={String(topicIndex)}
                onValueChange={(v) => setTopicIndex(Number(v))}
              >
                <SelectTrigger className="w-auto min-w-40 rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
                  {topics.map((t, i) => (
                    <SelectItem
                      key={i}
                      value={String(i)}
                      className="rounded-(--radius) font-mono text-xs uppercase"
                    >
                      {t.title || t.topicTitle || `Topic ${i + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <QuestionForm
          initial={blankForm()}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
          saving={isSaving}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12 border border-border/20 text-center">
      <p className="text-[11px] font-mono text-muted-foreground/40">
        No content yet — use AI Generate or JSON Import above, or add a question
        manually.
      </p>
      <button
        onClick={() => setShowAdd(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-primary/40 text-primary hover:bg-primary/10 transition-all"
      >
        <Plus className="size-3" /> Add First Question
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminQuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: quiz, isLoading } = useAdminQuiz(id);
  const publishMutation = useAdminPublishQuiz();
  const unpublishMutation = useAdminUnpublishQuiz();
  const archiveMutation = useAdminArchiveQuiz();
  const restoreMutation = useAdminRestoreQuiz();
  const [showAI, setShowAI] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [showExecutionFlow, setShowExecutionFlow] = useState(false);
  const [openLectures, setOpenLectures] = useState<Set<number>>(new Set([0]));

  const toggleLecture = (i: number) =>
    setOpenLectures((s) => {
      const n = new Set(s);
      if (n.has(i)) {
        n.delete(i);
      } else {
        n.add(i);
      }
      return n;
    });

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(id);
      toast.success("Quiz published");
    } catch {
      toast.error("Failed to publish");
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("Unpublish this quiz? It will become unavailable to students.")) return;
    try {
      await unpublishMutation.mutateAsync(id);
      toast.success("Quiz unpublished");
    } catch {
      toast.error("Failed to unpublish");
    }
  };

  const handleArchive = async () => {
    if (!confirm("Archive this quiz? Students won't be able to take it."))
      return;
    try {
      await archiveMutation.mutateAsync(id);
      toast.success("Quiz archived");
    } catch {
      toast.error("Failed to archive");
    }
  };

  const handleRestore = async () => {
    try {
      await restoreMutation.mutateAsync(id);
      toast.success("Quiz restored");
    } catch {
      toast.error("Failed to restore");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="py-16 text-center">
        <p className="font-mono text-sm text-destructive">Quiz not found.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  const totalQ = (quiz.lectures ?? []).reduce(
    (s, l) =>
      s +
      (l.topics ?? []).reduce(
        (ss, t) =>
          ss +
          ((t.questionTypes ?? []).reduce(
            (sss, qt) => sss + (qt.questions ?? []).length,
            0,
          ) || (t.questions ?? []).length),
        0,
      ),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/40 pb-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge
                className={`text-[8px] font-mono h-4 px-1.5 border ${STATUS_COLORS[quiz.status]}`}
              >
                {quiz.status}
              </Badge>
              {quiz.isAvailable && (
                <Badge
                  variant="outline"
                  className="text-[8px] font-mono h-4 px-1.5 text-green-500 border-green-500/30"
                >
                  Available
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight">{quiz.title}</h1>
            {quiz.description && (
              <p className="mt-1.5 text-sm font-mono text-muted-foreground/60">
                {quiz.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <button
              onClick={() => {
                setShowEdit((v) => !v);
                setShowAI(false);
                setShowJson(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-all ${
                showEdit
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 text-muted-foreground/60 hover:border-primary/40 hover:text-primary"
              }`}
            >
              <Settings className="size-3" />
              Edit Info
            </button>
            <button
              onClick={() => {
                setShowAI((v) => !v);
                setShowEdit(false);
                setShowJson(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-all ${
                showAI
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 text-primary/60 hover:border-primary/40 hover:text-primary"
              }`}
            >
              <Sparkles className="size-3" />
              AI Generate
            </button>
            <button
              onClick={() => {
                setShowJson((v) => !v);
                setShowEdit(false);
                setShowAI(false);
                setShowExecutionFlow(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-all ${
                showJson
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 text-muted-foreground/60 hover:border-primary/40 hover:text-primary"
              }`}
            >
              <FileJson className="size-3" />
              JSON Import
            </button>
            <button
              onClick={() => {
                setShowExecutionFlow((v) => !v);
                setShowEdit(false);
                setShowAI(false);
                setShowJson(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-all ${
                showExecutionFlow
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 text-muted-foreground/60 hover:border-primary/40 hover:text-primary"
              }`}
            >
              <ChevronDown className="size-3" />
              Execution Flow
            </button>
            {quiz.status !== "published" && (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-[10px] font-mono"
                onClick={handlePublish}
                disabled={publishMutation.isPending}
              >
                {publishMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Globe className="size-3" />
                )}
                Publish
              </Button>
            )}
            {quiz.status === "published" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-[10px] font-mono"
                onClick={handleUnpublish}
                disabled={unpublishMutation.isPending}
              >
                {unpublishMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <EyeOff className="size-3" />
                )}
                Unpublish
              </Button>
            )}
            {quiz.status !== "archived" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-[10px] font-mono"
                onClick={handleArchive}
                disabled={archiveMutation.isPending}
              >
                {archiveMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Archive className="size-3" />
                )}
                Archive
              </Button>
            )}
            {quiz.status === "archived" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-[10px] font-mono"
                onClick={handleRestore}
                disabled={restoreMutation.isPending}
              >
                {restoreMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <RotateCcw className="size-3" />
                )}
                Restore
              </Button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-4 flex items-center gap-x-4 gap-y-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-muted-foreground/50">
            <span className="text-foreground font-bold">{totalQ}</span>{" "}
            questions
          </span>
          <span className="text-border/40 text-[10px]">·</span>
          <span className="text-[10px] font-mono text-muted-foreground/50">
            <span className="text-foreground font-bold">
              {(quiz.lectures ?? []).length}
            </span>{" "}
            lectures
          </span>
          <span className="text-border/40 text-[10px]">·</span>
          <span className="text-[10px] font-mono text-muted-foreground/50">
            Pass{" "}
            <span className="text-foreground font-bold">
              {quiz.passingScore}%
            </span>
          </span>
          {quiz.settings?.timeLimit && (
            <>
              <span className="text-border/40 text-[10px]">·</span>
              <span className="text-[10px] font-mono text-muted-foreground/50">
                <span className="text-foreground font-bold">
                  {quiz.settings.timeLimit}
                </span>{" "}
                min limit
              </span>
            </>
          )}
          {(quiz.tags ?? []).length > 0 && (
            <div className="flex items-center gap-1.5 ml-1">
              {(quiz.tags ?? []).map((t: string) => (
                <span
                  key={t}
                  className="text-[9px] font-mono text-muted-foreground/50 border border-border/30 bg-secondary/10 px-1.5 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit info panel */}
      {showEdit && (
        <EditInfoPanel
          quiz={quiz}
          quizId={id}
          onClose={() => setShowEdit(false)}
        />
      )}

      {/* AI generation panel */}
      {showAI && (
        <AIGeneratePanel
          quizId={id}
          courseId={quiz.courseId}
          onDone={() => setShowAI(false)}
        />
      )}

      {/* JSON import panel */}
      {showJson && (
        <JsonImportPanel
          quizId={id}
          quiz={quiz}
          onDone={() => setShowJson(false)}
        />
      )}

      {/* Execution flow panel */}
      {showExecutionFlow && (
        <ExecutionFlowPanel
          quiz={quiz}
          openLectures={openLectures}
          toggleLecture={toggleLecture}
        />
      )}

      {/* Content */}
      <ContentSection
        quizId={id}
        quiz={quiz}
        openLectures={openLectures}
        toggleLecture={toggleLecture}
      />
    </div>
  );
}
