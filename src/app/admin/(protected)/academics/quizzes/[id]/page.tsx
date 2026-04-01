"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Sparkles,
  Globe,
  Archive,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useAdminQuiz,
  useAdminPublishQuiz,
  useAdminArchiveQuiz,
  useAdminGenerateQuizAI,
  useAdminCourses,
  type GenerateQuizAIPayload,
} from "@/hooks/admin/use-academics";

const STATUS_COLORS: Record<string, string> = {
  draft: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  published: "text-green-500 border-green-500/30 bg-green-500/10",
  archived: "text-muted-foreground border-border/40 bg-card/40",
};

// ─── AI Generation form ───────────────────────────────────────────────────────

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

  const toggleType = (t: string) => {
    setForm((f) => ({
      ...f,
      questionTypes: f.questionTypes.includes(t)
        ? f.questionTypes.filter((x) => x !== t)
        : [...f.questionTypes, t],
    }));
  };

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
            placeholder="e.g. Binary search trees, Photosynthesis, WWII causes…"
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
          disabled={generateMutation.isPending || !form.topic.trim() || form.questionTypes.length === 0}
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

// ─── Lecture tree ─────────────────────────────────────────────────────────────

function LectureTree({
  lectures,
}: {
  lectures: NonNullable<ReturnType<typeof useAdminQuiz>["data"]>["lectures"];
}) {
  const [openLectures, setOpenLectures] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) =>
    setOpenLectures((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  if (!lectures || lectures.length === 0) {
    return (
      <p className="text-[11px] font-mono text-muted-foreground/40 py-8 text-center">
        No content yet — use AI generation above or add questions manually.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {(lectures || []).map((l, i) => {
        const totalQ = (l.topics || []).reduce(
          (s, t) => s + (t.questionTypes || []).reduce((ss, qt) => ss + (qt.questions || []).length, 0),
          0,
        );
        return (
          <div key={i} className="border border-border/40 bg-card/20">
            <button
              type="button"
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left"
            >
              {openLectures.has(i) ? (
                <ChevronDown className="size-4 shrink-0 text-muted-foreground/50" />
              ) : (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
              )}
              <span className="font-mono font-bold text-sm text-foreground flex-1 truncate">
                {l.title}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0">
                {(l.topics || []).length} topics · {totalQ} Qs
              </span>
            </button>
            {openLectures.has(i) && (
              <div className="px-4 pb-3 space-y-2">
                {(l.topics || []).map((t, ti) => {
                  const qCount = (t.questionTypes || []).reduce((s, qt) => s + (qt.questions || []).length, 0);
                  return (
                    <div key={ti} className="pl-4 border-l border-border/30">
                      <p className="text-[11px] font-mono font-semibold text-foreground">
                        {t.title}
                        <span className="ml-2 text-muted-foreground/40 font-normal">
                          {qCount} Qs
                        </span>
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(t.questionTypes || []).map((qt) => (
                          <Badge
                            key={qt.type}
                            variant="outline"
                            className="text-[8px] font-mono h-4 px-1.5"
                          >
                            {qt.type}: {(qt.questions || []).length}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
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
  const archiveMutation = useAdminArchiveQuiz();
  const [showAI, setShowAI] = useState(false);

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

  const totalQ = (quiz.lectures || []).reduce(
    (s, l) => s + (l.topics || []).reduce((ss, t) => ss + (t.questionTypes || []).reduce((sss, qt) => sss + (qt.questions || []).length, 0), 0),
    0,
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.push("/admin/academics/quizzes")}
          className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="size-3" />
          Quizzes
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-[8px] font-mono h-4 px-1.5 border ${STATUS_COLORS[quiz.status]}`}>
                {quiz.status}
              </Badge>
              {quiz.isAvailable && (
                <Badge variant="outline" className="text-[8px] font-mono h-4 px-1.5 text-green-500 border-green-500/30">
                  Available
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-black tracking-tight truncate">{quiz.title}</h1>
            {quiz.description && (
              <p className="mt-1 text-sm font-mono text-muted-foreground/60">{quiz.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {quiz.status !== "published" && (
              <Button
                size="sm"
                className="h-8 gap-1 text-[10px] font-mono"
                onClick={handlePublish}
                disabled={publishMutation.isPending}
              >
                <Globe className="size-3" />
                Publish
              </Button>
            )}
            {quiz.status !== "archived" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-[10px] font-mono"
                onClick={handleArchive}
                disabled={archiveMutation.isPending}
              >
                <Archive className="size-3" />
                Archive
              </Button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5">
            {totalQ} questions
          </Badge>
          <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5">
            {(quiz.lectures || []).length} lectures
          </Badge>
          <Badge variant="secondary" className="text-[9px] font-mono h-4 px-1.5">
            Pass {quiz.passingScore}%
          </Badge>
          {(quiz.tags || []).map((t: string) => (
            <span key={t} className="text-[9px] font-mono text-muted-foreground/40 border border-border/30 px-1.5 py-0.5">
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      {/* AI Generation */}
      <div>
        <button
          onClick={() => setShowAI((v) => !v)}
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-primary hover:opacity-80 transition-opacity mb-3"
        >
          <Sparkles className="size-3.5" />
          {showAI ? "Hide" : "AI Question Generation"}
        </button>
        {showAI && (
          <AIGeneratePanel
            quizId={id}
            courseId={quiz.courseId}
            onDone={() => setShowAI(false)}
          />
        )}
      </div>

      {/* Content tree */}
      <div>
        <div className="border-b border-border/40 pb-2 mb-3">
          <h2 className="text-[11px] font-mono uppercase tracking-widest font-bold">Content</h2>
        </div>
        <LectureTree lectures={quiz.lectures} />
      </div>
    </div>
  );
}
