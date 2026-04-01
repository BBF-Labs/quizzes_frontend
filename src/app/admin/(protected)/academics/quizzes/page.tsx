"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Search, X, GraduationCap, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useAdminQuizzes,
  useAdminCreateQuiz,
  useAdminDeleteQuiz,
  useAdminCourses,
} from "@/hooks/admin/use-academics";
import { PaginationController } from "@/components/common/pagination-controller";



const STATUS_COLORS: Record<string, string> = {
  draft: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  published: "text-green-500 border-green-500/30 bg-green-500/10",
  archived: "text-muted-foreground border-border/40 bg-card/40",
};

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateQuizForm({ onClose }: { onClose: () => void }) {
  const createMutation = useAdminCreateQuiz();
  const { data: coursesResult } = useAdminCourses({ limit: 200 });
  const courses = coursesResult?.data ?? [];
  const [form, setForm] = useState({
    title: "",
    description: "",
    courseId: "",
    passingScore: 70,
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.success("Quiz created");
      onClose();
    } catch {
      toast.error("Failed to create quiz");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-primary/30 bg-primary/5 p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-mono uppercase tracking-widest font-bold">New Quiz</p>
        <button onClick={onClose} className="text-muted-foreground/40 hover:text-muted-foreground">
          <X className="size-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Title *
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Quiz title"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 resize-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Course *
          </label>
          <select
            required
            value={form.courseId}
            onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="">Select course…</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} {c.title ? `— ${c.title}` : ""}
              </option>
            ))}
          </select>
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
            onChange={(e) => setForm((f) => ({ ...f, passingScore: +e.target.value }))}
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
            placeholder="e.g. algorithms, data structures"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
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
            {createMutation.isPending ? "Creating…" : "Create Draft"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminQuizzesPage() {
  const deleteMutation = useAdminDeleteQuiz();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-block border border-primary/60 px-2 py-1 mb-2 bg-primary/5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
                Academics
              </span>
            </div>
            <h1 className="text-2xl font-mono font-bold tracking-widest uppercase">Quizzes</h1>
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
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => {
            setStatusFilter(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-40 rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
            <SelectItem value="all" className="rounded-(--radius) font-mono text-xs uppercase">
              All Statuses
            </SelectItem>
            <SelectItem value="draft" className="rounded-(--radius) font-mono text-xs uppercase">
              Draft
            </SelectItem>
            <SelectItem value="published" className="rounded-(--radius) font-mono text-xs uppercase">
              Published
            </SelectItem>
            <SelectItem value="archived" className="rounded-(--radius) font-mono text-xs uppercase">
              Archived
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-card/40 border border-border/30" />
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
            onPageChange={setPage}
          />
        </div>
      )}


      <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
        {totalCount} quiz{totalCount !== 1 ? "zes" : ""}
      </p>
    </div>
  );
}
