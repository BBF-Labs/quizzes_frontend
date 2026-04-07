"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Search,
  X,
  GraduationCap,
  Trash2,
  Eye,
  FileJson,
  FormInput,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useAdminQuizzes,
  useAdminCreateQuiz,
  useAdminDeleteQuiz,
  useAdminCourses,
  useAdminAddQuizQuestion,
} from "@/hooks/admin/use-academics";
import { PaginationController } from "@/components/common/pagination-controller";

const STATUS_COLORS: Record<string, string> = {
  draft: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  published: "text-green-500 border-green-500/30 bg-green-500/10",
  archived: "text-muted-foreground border-border/40 bg-card/40",
};

// ─── Shared types ─────────────────────────────────────────────────────────────

interface ParsedQuestion {
  question: string;
  type: string;
  options: string[];
  answer: string;
  explanation?: string;
  hint?: string;
}

interface ParsedTopic {
  title: string;
  questions: ParsedQuestion[];
}

interface ParsedLecture {
  title: string;
  topics: ParsedTopic[];
}

interface ParsedQuizJson {
  title?: string;
  description?: string;
  passingScore?: number;
  tags?: string[];
  questions?: ParsedQuestion[];
  lectures?: ParsedLecture[];
}

const normalizeQuestionType = (type: string): string => {
  const t = type.toLowerCase().trim();
  if (t === "true_false" || t === "true-false") return "true-false";
  if (t === "mcq") return "mcq";
  if (t === "short_answer" || t === "short-answer") return "short-answer";
  if (t === "essay") return "essay";
  if (
    t === "fill_in" ||
    t === "fill_in_blank" ||
    t === "fill-in" ||
    t === "fill-in-blank"
  )
    return "fill-in";
  return t.replace(/_/g, "-");
};

const QUESTION_TYPE_COLORS: Record<string, string> = {
  mcq: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  true_false: "text-green-400 border-green-400/30 bg-green-400/10",
  short_answer: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  essay: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  fill_in_blank: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
};

// ─── Shared course picker ─────────────────────────────────────────────────────

function CoursePicker({
  courseId,
  courseSearch,
  courses,
  onCourseChange,
  onSearchChange,
}: {
  courseId: string;
  courseSearch: string;
  courses: any[];
  onCourseChange: (id: string, label: string) => void;
  onSearchChange: (v: string) => void;
}) {
  return (
    <Combobox
      value={courseId}
      onValueChange={(val) => {
        const course = courses.find((c) => c._id === val);
        onCourseChange(
          val as string,
          course ? `${course.code} - ${course.title}` : "",
        );
      }}
    >
      <ComboboxInput
        placeholder="Search course…"
        className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors h-[34px] uppercase tracking-widest"
        value={courseSearch}
        onChange={(e) => onSearchChange(e.target.value)}
        required
      />
      <ComboboxContent className="font-mono border-border/40">
        <ComboboxEmpty className="font-mono text-[10px] uppercase p-2">
          No courses found
        </ComboboxEmpty>
        <ComboboxList className="max-h-60 no-scrollbar">
          {courses.map((c: any) => (
            <ComboboxItem
              key={c._id}
              value={c._id}
              className="text-[10px] uppercase tracking-tighter"
            >
              <span className="font-bold text-primary mr-2">{c.code}</span>
              <span className="truncate">{c.title}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateQuizForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const createMutation = useAdminCreateQuiz();

  const [mode, setMode] = useState<"form" | "json">("form");

  // Shared course state
  const [courseSearch, setCourseSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(courseSearch), 300);
    return () => clearTimeout(t);
  }, [courseSearch]);
  const { data: coursesResult } = useAdminCourses({
    limit: 50,
    search: debouncedSearch,
  });
  const courses = coursesResult?.data ?? [];

  // ── Form mode ──
  const [form, setForm] = useState({
    title: "",
    description: "",
    passingScore: 70,
    tags: "",
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quiz = await createMutation.mutateAsync({
        ...form,
        courseId,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.success("Quiz created");
      if (quiz?._id) router.push(`/admin/academics/quizzes/${quiz._id}`);
      else onClose();
    } catch {
      toast.error("Failed to create quiz");
    }
  };

  // ── JSON mode ──
  const [jsonRaw, setJsonRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedQuizJson | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const totalQuestions = useMemo(() => {
    if (!parsed) return 0;
    if (parsed.lectures) {
      return parsed.lectures.reduce(
        (acc, l) =>
          acc + l.topics.reduce((tacc, t) => tacc + t.questions.length, 0),
        0,
      );
    }
    return parsed.questions?.length || 0;
  }, [parsed]);

  const validateQuestion = (q: any, label: string) => {
    if (!q.question) throw new Error(`${label} missing "question" field`);
    if (!q.type) throw new Error(`${label} missing "type" field`);
    if (!q.answer) throw new Error(`${label} missing "answer" field`);
  };

  const handleParse = () => {
    setParseError(null);
    setParsed(null);
    try {
      const obj = JSON.parse(jsonRaw);
      const isNested = Array.isArray(obj.lectures);
      const isFlat = Array.isArray(obj.questions);

      if (!isNested && !isFlat) {
        throw new Error(
          'JSON must have a "questions" array or a "lectures" array',
        );
      }

      if (isNested) {
        if (!obj.title) {
          obj.title = obj.lectures[0]?.title || "Imported Quiz";
        }
        for (const [li, l] of obj.lectures.entries()) {
          if (!l.title) throw new Error(`Lecture ${li + 1} missing "title"`);
          if (!Array.isArray(l.topics))
            throw new Error(`Lecture ${li + 1} missing "topics" array`);
          for (const [ti, t] of l.topics.entries()) {
            if (!t.title)
              throw new Error(
                `Topic ${ti + 1} in Lecture ${li + 1} missing "title"`,
              );
            if (!Array.isArray(t.questions))
              throw new Error(
                `Topic ${ti + 1} in Lecture ${li + 1} missing "questions" array`,
              );
            for (const [qi, q] of t.questions.entries()) {
              validateQuestion(q, `L${li + 1} T${ti + 1} Q${qi + 1}`);
              q.type = normalizeQuestionType(q.type);
            }
          }
        }
      } else {
        if (!obj.title || typeof obj.title !== "string")
          throw new Error('JSON must have a "title" string');
        for (const [i, q] of obj.questions.entries()) {
          validateQuestion(q, `Question ${i + 1}`);
          q.type = normalizeQuestionType(q.type);
        }
      }

      setParsed(obj as ParsedQuizJson);
    } catch (err: any) {
      setParseError(err.message ?? "Invalid JSON");
    }
  };

  // Need a ref to addQuestion since quizId isn't known until after creation
  const addQuestionRef = useRef<
    ((quizId: string, q: ParsedQuestion, idx: number) => Promise<void>) | null
  >(null);

  const handleJsonImport = async () => {
    if (!parsed || !courseId) {
      toast.error("Select a course first");
      return;
    }
    setImporting(true);
    try {
      const api = (await import("@/lib/api")).api;

      // 1. Create Quiz Shell
      const quiz = await createMutation.mutateAsync({
        title: parsed.title || "Imported Quiz",
        description: parsed.description,
        courseId,
        passingScore: parsed.passingScore ?? 70,
        tags: parsed.tags ?? [],
      });
      if (!quiz?._id) throw new Error("No quiz ID returned");

      // 2. Process Nested Format
      if (parsed.lectures) {
        for (let li = 0; li < parsed.lectures.length; li++) {
          const lec = parsed.lectures[li];
          // Create Lecture
          await api.post(`/admin/learning/quizzes/${quiz._id}/lectures`, {
            title: lec.title,
          });

          for (let ti = 0; ti < lec.topics.length; ti++) {
            const top = lec.topics[ti];
            // Create Topic
            await api.post(
              `/admin/learning/quizzes/${quiz._id}/lectures/${li}/topics`,
              {
                title: top.title,
              },
            );

            // Create Questions
            for (const q of top.questions) {
              await api.post(`/admin/learning/quizzes/${quiz._id}/questions`, {
                lectureIndex: li,
                topicIndex: ti,
                type: q.type,
                question: q.question,
                options: q.options ?? [],
                answer: q.answer,
                explanation: q.explanation,
                hint: q.hint,
              });
            }
          }
        }
      }
      // 3. Process Flat Format
      else if (parsed.questions) {
        for (const q of parsed.questions) {
          await api.post(`/admin/learning/quizzes/${quiz._id}/questions`, {
            lectureIndex: 0,
            topicIndex: 0,
            type: q.type,
            question: q.question,
            options: q.options ?? [],
            answer: q.answer,
            explanation: q.explanation,
            hint: q.hint,
          });
        }
      }

      toast.success("Quiz imported successfully");
      router.push(`/admin/academics/quizzes/${quiz._id}`);
    } catch (err: any) {
      console.error("[Import] Error:", err);
      toast.error(
        err?.response?.data?.message ?? err.message ?? "Import failed",
      );
    } finally {
      setImporting(false);
    }
  };

  const fieldCls =
    "w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-primary/30 bg-primary/5 p-4 mb-6"
    >
      {/* Header + mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode("form")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-[9px] font-mono uppercase tracking-widest border transition-all",
              mode === "form"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground/50 hover:text-muted-foreground",
            )}
          >
            <FormInput className="size-3" /> Form
          </button>
          <button
            onClick={() => setMode("json")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-[9px] font-mono uppercase tracking-widest border transition-all",
              mode === "json"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground/50 hover:text-muted-foreground",
            )}
          >
            <FileJson className="size-3" /> JSON
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground/40 hover:text-muted-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* ── Form mode ── */}
      {mode === "form" && (
        <form
          onSubmit={handleFormSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div className="sm:col-span-2">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Quiz title"
              className={fieldCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              className={cn(fieldCls, "resize-none")}
            />
          </div>
          <div>
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
              Course *
            </label>
            <CoursePicker
              courseId={courseId}
              courseSearch={courseSearch}
              courses={courses}
              onCourseChange={(id, label) => {
                setCourseId(id);
                setCourseSearch(label);
              }}
              onSearchChange={setCourseSearch}
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
              className={fieldCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
              Tags (comma-separated)
            </label>
            <input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="e.g. algorithms, data structures"
              className={fieldCls}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {createMutation.isPending ? "Creating…" : "Create Draft →"}
            </button>
          </div>
        </form>
      )}

      {/* ── JSON mode ── */}
      {mode === "json" && (
        <div className="space-y-3">
          <div>
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
              Course *
            </label>
            <CoursePicker
              courseId={courseId}
              courseSearch={courseSearch}
              courses={courses}
              onCourseChange={(id, label) => {
                setCourseId(id);
                setCourseSearch(label);
              }}
              onSearchChange={setCourseSearch}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">
                Quiz JSON *
              </label>
              <span className="text-[8px] font-mono text-muted-foreground/30">
                {`{ title, description?, passingScore?, tags?, questions[] }`}
              </span>
            </div>
            <textarea
              value={jsonRaw}
              onChange={(e) => {
                setJsonRaw(e.target.value);
                setParsed(null);
                setParseError(null);
              }}
              rows={10}
              placeholder={`{\n  "title": "Operating Systems Quiz",\n  "passingScore": 70,\n  "questions": [\n    {\n      "question": "What is a process?",\n      "type": "mcq",\n      "options": ["A running program", "A file", "A thread", "Memory"],\n      "answer": "A running program"\n    }\n  ]\n}`}
              className={cn(
                fieldCls,
                "resize-none font-mono text-[11px] leading-relaxed",
              )}
            />
          </div>

          {/* Parse error */}
          {parseError && (
            <div className="flex items-start gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2">
              <AlertCircle className="size-3.5 text-destructive shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-destructive">
                {parseError}
              </p>
            </div>
          )}

          {/* Preview */}
          {parsed && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border/40 bg-card/30 p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-green-400 shrink-0" />
                <p className="text-[10px] font-mono text-green-400 uppercase tracking-widest">
                  Valid — ready to import
                </p>
              </div>
              <p className="font-mono font-bold text-sm">{parsed.title}</p>
              {parsed.description && (
                <p className="text-[11px] font-mono text-muted-foreground/60">
                  {parsed.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground/50">
                <span>
                  {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
                </span>
                <span>Pass {parsed.passingScore ?? 70}%</span>
                {(parsed.tags ?? []).length > 0 && (
                  <span>{parsed.tags!.join(", ")}</span>
                )}
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                {parsed.lectures
                  ? parsed.lectures.flatMap((l, li) =>
                      l.topics.flatMap((t, ti) =>
                        t.questions.map((q, qi) => (
                          <div
                            key={`${li}-${ti}-${qi}`}
                            className="flex items-start gap-2 py-1 border-t border-border/20"
                          >
                            <span className="text-[9px] font-mono text-muted-foreground/30 w-10 shrink-0 pt-px uppercase">
                              L{li + 1}T{ti + 1}
                            </span>
                            <span
                              className={cn(
                                "text-[8px] font-mono uppercase tracking-widest px-1 py-0.5 border shrink-0",
                                QUESTION_TYPE_COLORS[q.type] ??
                                  "text-muted-foreground border-border/30",
                              )}
                            >
                              {q.type.replace("-", " ")}
                            </span>
                            <p className="text-[11px] font-mono text-foreground/80 line-clamp-1 flex-1">
                              {q.question}
                            </p>
                          </div>
                        )),
                      ),
                    )
                  : parsed.questions?.map((q, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 py-1 border-t border-border/20"
                      >
                        <span className="text-[9px] font-mono text-muted-foreground/30 w-5 shrink-0 pt-px">
                          {i + 1}.
                        </span>
                        <span
                          className={cn(
                            "text-[8px] font-mono uppercase tracking-widest px-1 py-0.5 border shrink-0",
                            QUESTION_TYPE_COLORS[q.type] ??
                              "text-muted-foreground border-border/30",
                          )}
                        >
                          {q.type.replace("-", " ")}
                        </span>
                        <p className="text-[11px] font-mono text-foreground/80 line-clamp-1 flex-1">
                          {q.question}
                        </p>
                      </div>
                    ))}
              </div>
            </motion.div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors"
            >
              Cancel
            </button>
            {!parsed ? (
              <button
                type="button"
                onClick={handleParse}
                disabled={!jsonRaw.trim()}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-primary/50 text-primary hover:bg-primary/10 disabled:opacity-40 transition-all"
              >
                Parse JSON
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJsonImport}
                disabled={importing || !courseId}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {importing
                  ? "Importing…"
                  : `Import ${totalQuestions} Questions →`}
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminQuizzesPage() {
  const deleteMutation = useAdminDeleteQuiz();
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const search = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("status") ?? "";
  const pageSize = 10;

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: result, isLoading } = useAdminQuizzes({
    page,
    limit: pageSize,
    search: debouncedSearch,
    status: statusFilter,
  });
  const quizzes = result?.data ?? [];
  const totalPages = result?.pagination.totalPages ?? 1;
  const totalCount = result?.pagination.total ?? 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quiz? This cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Quiz deleted");
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-block border border-primary/60 px-2 py-1 mb-2 bg-primary/5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
                Academics
              </span>
            </div>
            <h1 className="text-2xl font-mono font-bold tracking-widest uppercase">
              Quizzes
            </h1>
          </div>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 bg-primary px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all"
          >
            <Plus className="size-3.5" />
            New Quiz
          </button>
        </div>
      </motion.div>

      {showCreate && <CreateQuizForm onClose={() => setShowCreate(false)} />}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes…"
            className="pl-9 rounded-(--radius) bg-background/50 font-mono text-xs uppercase tracking-widest"
            value={search}
            onChange={(e) => {
              updateQueryParams({ search: e.target.value || null, page: "1" });
            }}
          />
          {search && (
            <button
              onClick={() => {
                updateQueryParams({ search: null, page: "1" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => {
            updateQueryParams({
              status: value === "all" ? null : value,
              page: "1",
            });
          }}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-40 rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
            <SelectItem
              value="all"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              All Statuses
            </SelectItem>
            <SelectItem
              value="draft"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Draft
            </SelectItem>
            <SelectItem
              value="published"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Published
            </SelectItem>
            <SelectItem
              value="archived"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Archived
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse bg-card/40 border border-border/30"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && quizzes.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center border border-primary/20 bg-primary/5">
            <GraduationCap className="size-5 text-primary/60" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
            {search || statusFilter ? "No matching quizzes" : "No quizzes yet"}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && quizzes.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="group relative border border-border/40 bg-card/30 hover:border-primary/40 transition-all"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono font-bold text-sm text-foreground line-clamp-2 flex-1">
                      {quiz.title}
                    </p>
                    <Badge
                      className={`shrink-0 text-[8px] font-mono h-4 px-1.5 border ${STATUS_COLORS[quiz.status]}`}
                    >
                      {quiz.status}
                    </Badge>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {(quiz.tags ?? []).slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-mono text-muted-foreground/50 border border-border/30 px-1.5 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/20 pt-2">
                    <span className="text-[9px] font-mono text-muted-foreground/40">
                      Pass {quiz.passingScore}%
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/academics/quizzes/${quiz._id}`}>
                        <button className="p-1.5 text-muted-foreground/40 hover:text-primary transition-colors">
                          <Eye className="size-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <PaginationController
            page={page}
            totalPages={totalPages}
            onPageChange={(nextPage) =>
              updateQueryParams({ page: String(nextPage) })
            }
          />
        </div>
      )}

      <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
        {totalCount} quiz{totalCount !== 1 ? "zes" : ""}
      </p>
    </div>
  );
}
