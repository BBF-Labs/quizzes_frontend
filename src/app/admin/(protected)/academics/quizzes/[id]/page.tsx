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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useAdminQuiz,
  useAdminPublishQuiz,
  useAdminArchiveQuiz,
  useAdminGenerateQuizAI,
  useAdminPatchQuiz,
  useAdminAddQuizQuestion,
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

const QUESTION_TYPES = ["mcq", "true_false", "short_answer", "essay", "fill_in_blank"] as const;

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
    options: type === "true_false" ? ["True", "False"] : type === "mcq" ? ["", "", "", ""] : [],
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
            ? f.options.length >= 2 ? f.options : ["", "", "", ""]
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
    setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));

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
            {form.options.filter((o) => o.trim()).map((o, i) => (
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
            onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
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
          {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Question card ─────────────────────────────────────────────────────────────

function QuestionCard({
  q,
  quizId,
}: {
  q: AdminQuestion;
  quizId: string;
}) {
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
        <p className="text-[12px] font-mono text-foreground leading-snug">{q.question}</p>
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
          <span className="ml-2 text-muted-foreground/40 font-normal">{totalQ} Qs</span>
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
        <p className="text-[10px] font-mono text-muted-foreground/30 py-1">No questions yet.</p>
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
    if (!form.topic.trim()) { toast.error("Topic is required"); return; }
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
        Describe a topic and Z will generate questions in bulk. They&apos;ll be appended as a new
        lecture to this quiz.
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
            onChange={(e) => setForm((f) => ({ ...f, lectureTitle: e.target.value }))}
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
            onChange={(e) => setForm((f) => ({ ...f, numberOfQuestions: +e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Difficulty
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
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
          disabled={generateMutation.isPending || !form.topic.trim() || form.questionTypes.length === 0}
        >
          {generateMutation.isPending ? (
            <><Loader2 className="size-3 animate-spin" />Queuing…</>
          ) : (
            <><Sparkles className="size-3" />Generate Questions</>
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
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
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
          <p className="text-[11px] font-mono uppercase tracking-widest font-bold">Edit Quiz Info</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground/40 hover:text-muted-foreground">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">Description</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 resize-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">Passing Score (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.passingScore}
            onChange={(e) => setForm((f) => ({ ...f, passingScore: +e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">Time Limit (min)</label>
          <input
            type="number"
            min={0}
            value={form.timeLimit}
            onChange={(e) => setForm((f) => ({ ...f, timeLimit: e.target.value }))}
            placeholder="No limit"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">Tags (comma-separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="e.g. algorithms, midterm"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">Available From</label>
          <input
            type="datetime-local"
            value={form.availableFrom}
            onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">Available To</label>
          <input
            type="datetime-local"
            value={form.availableTo}
            onChange={(e) => setForm((f) => ({ ...f, availableTo: e.target.value }))}
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
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
              className="accent-primary"
            />
            <span className="text-[10px] font-mono text-muted-foreground/70">{label}</span>
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
          {patchMutation.isPending && <Loader2 className="size-3 animate-spin" />}
          Save Changes
        </button>
      </div>
    </motion.div>
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
  const archiveMutation = useAdminArchiveQuiz();
  const [showAI, setShowAI] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [openLectures, setOpenLectures] = useState<Set<number>>(new Set([0]));

  const toggleLecture = (i: number) =>
    setOpenLectures((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
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

  const handleArchive = async () => {
    if (!confirm("Archive this quiz? Students won't be able to take it.")) return;
    try {
      await archiveMutation.mutateAsync(id);
      toast.success("Quiz archived");
    } catch {
      toast.error("Failed to archive");
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
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
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
          ((t.questionTypes ?? []).reduce((sss, qt) => sss + (qt.questions ?? []).length, 0) ||
            (t.questions ?? []).length),
        0,
      ),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="border-b border-border/40 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className={`text-[8px] font-mono h-4 px-1.5 border ${STATUS_COLORS[quiz.status]}`}>
                {quiz.status}
              </Badge>
              {quiz.isAvailable && (
                <Badge variant="outline" className="text-[8px] font-mono h-4 px-1.5 text-green-500 border-green-500/30">
                  Available
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight">{quiz.title}</h1>
            {quiz.description && (
              <p className="mt-1.5 text-sm font-mono text-muted-foreground/60">{quiz.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <button
              onClick={() => { setShowEdit((v) => !v); setShowAI(false); }}
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
              onClick={() => { setShowAI((v) => !v); setShowEdit(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-all ${
                showAI
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 text-primary/60 hover:border-primary/40 hover:text-primary"
              }`}
            >
              <Sparkles className="size-3" />
              AI Generate
            </button>
            {quiz.status !== "published" && (
              <Button size="sm" className="h-8 gap-1.5 text-[10px] font-mono" onClick={handlePublish} disabled={publishMutation.isPending}>
                {publishMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Globe className="size-3" />}
                Publish
              </Button>
            )}
            {quiz.status !== "archived" && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[10px] font-mono" onClick={handleArchive} disabled={archiveMutation.isPending}>
                {archiveMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Archive className="size-3" />}
                Archive
              </Button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-4 flex items-center gap-x-4 gap-y-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-muted-foreground/50">
            <span className="text-foreground font-bold">{totalQ}</span> questions
          </span>
          <span className="text-border/40 text-[10px]">·</span>
          <span className="text-[10px] font-mono text-muted-foreground/50">
            <span className="text-foreground font-bold">{(quiz.lectures ?? []).length}</span> lectures
          </span>
          <span className="text-border/40 text-[10px]">·</span>
          <span className="text-[10px] font-mono text-muted-foreground/50">
            Pass <span className="text-foreground font-bold">{quiz.passingScore}%</span>
          </span>
          {quiz.settings?.timeLimit && (
            <>
              <span className="text-border/40 text-[10px]">·</span>
              <span className="text-[10px] font-mono text-muted-foreground/50">
                <span className="text-foreground font-bold">{quiz.settings.timeLimit}</span> min limit
              </span>
            </>
          )}
          {(quiz.tags ?? []).length > 0 && (
            <div className="flex items-center gap-1.5 ml-1">
              {(quiz.tags ?? []).map((t: string) => (
                <span key={t} className="text-[9px] font-mono text-muted-foreground/50 border border-border/30 bg-secondary/10 px-1.5 py-0.5">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit info panel */}
      {showEdit && (
        <EditInfoPanel quiz={quiz} quizId={id} onClose={() => setShowEdit(false)} />
      )}

      {/* AI generation panel */}
      {showAI && (
        <AIGeneratePanel quizId={id} courseId={quiz.courseId} onDone={() => setShowAI(false)} />
      )}

      {/* Content */}
      <div>
        <div className="border-b border-border/40 pb-2 mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-mono uppercase tracking-widest font-bold">Content</h2>
          <span className="text-[9px] font-mono text-muted-foreground/40">
            {(quiz.lectures ?? []).length} lecture{(quiz.lectures ?? []).length !== 1 ? "s" : ""}
          </span>
        </div>

        {!(quiz.lectures ?? []).length ? (
          <p className="text-[11px] font-mono text-muted-foreground/40 py-12 text-center">
            No content yet — use AI generation above or add questions manually.
          </p>
        ) : (
          <div className="space-y-2">
            {(quiz.lectures ?? []).map((l, li) => {
              const topicCount = (l.topics ?? []).length;
              const lectureQ = (l.topics ?? []).reduce(
                (s, t) =>
                  s +
                  ((t.questionTypes ?? []).reduce((ss, qt) => ss + (qt.questions ?? []).length, 0) ||
                    (t.questions ?? []).length),
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
                          quizId={id}
                        />
                      ))}
                      {!(l.topics ?? []).length && (
                        <p className="text-[10px] font-mono text-muted-foreground/30 py-2">
                          No topics in this lecture.
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
    </div>
  );
}
