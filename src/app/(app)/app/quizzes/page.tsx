"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BookOpen, Search, Trash2, X, Plus, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useLibraryQuizzes,
  useDeleteLibraryQuiz,
  useGenerateQuiz,
} from "@/hooks/app/use-app-library";
import { GenerationDialog } from "@/components/app/library/generation-dialog";

import { QuizCard } from "@/components/app/quizzes/quiz-card";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizzesPage() {
  const { data: quizzes = [], isLoading, error: queryError } = useLibraryQuizzes();
  const deleteMutation = useDeleteLibraryQuiz();
  const generateQuizMutation = useGenerateQuiz();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);

  // Client-side filtering
  const searchRe = useMemo(() => 
    search.trim() ? new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null
  , [search]);

  const filtered = quizzes.filter((q) => {
    if (searchRe && !searchRe.test(q.title)) return false;
    if (courseFilter && q.courseCode !== courseFilter) return false;
    return true;
  });

  const courses = Array.from(
    new Set(quizzes.map((q) => q.courseCode).filter(Boolean)),
  ) as string[];

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Quiz deleted");
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  const handleGenerate = async (materialId: string, settings?: Record<string, unknown>) => {
    await generateQuizMutation.mutateAsync({ materialId, settings });
  };

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-(--radius) border border-border/40 bg-card/30 p-4 md:p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary/80">
                Self Assessment
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Quizzes</h1>
              <p className="mt-2 text-sm font-mono text-muted-foreground/70">
                Test your knowledge with AI-generated quizzes.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 items-end">
               <div className="rounded-(--radius) border border-border/40 bg-background/40 px-3 py-2 w-full sm:w-auto text-center">
                  <p className="text-xs font-mono font-semibold text-foreground">
                    {quizzes.length}
                  </p>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
                    Total Quizzes
                  </p>
                </div>

              <button
                onClick={() => setIsGenerationDialogOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary px-4 py-2 rounded-(--radius) text-[11px] font-mono uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all font-bold"
              >
                <Plus className="size-3.5" />
                Generate Quiz
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quizzes…"
              className="w-full border border-border/50 bg-card/40 pl-9 pr-9 py-2.5 text-[12px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {courses.length > 0 && (
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="border border-border/50 bg-card/40 px-3 py-2.5 text-[12px] font-mono text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse bg-card/40 border border-border/30"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && queryError && (
          <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive">
            Failed to load quizzes.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !queryError && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="flex size-14 items-center justify-center border border-primary/20 bg-primary/5">
              <BookOpen className="size-6 text-primary/60" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
              {search || courseFilter
                ? "No quizzes match your filters"
                : "No quizzes yet. Generate some from your study materials."}
            </p>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && !queryError && filtered.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filtered.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  id={quiz.id}
                  title={quiz.title}
                  href={`/app/quizzes/${quiz.id}`}
                  takeHref={`/app/quizzes/${quiz.id}/take`}
                  courseTitle={quiz.courseTitle}
                  courseCode={quiz.courseCode}
                  questionCount={quiz.questionCount ?? 0}
                  averageScore={quiz.averageScore}
                  createdAt={quiz.createdAt}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Count */}
        {!isLoading && quizzes.length > 0 && (
          <p className="mt-8 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30">
            {filtered.length} of {quizzes.length}{" "}
            {quizzes.length === 1 ? "quiz" : "quizzes"}
          </p>
        )}
      </div>

      <GenerationDialog
        isOpen={isGenerationDialogOpen}
        onOpenChange={setIsGenerationDialogOpen}
        title="Generate Quiz"
        description="Select a material from your library or upload a new one to generate an AI quiz."
        type="quiz"
        onGenerate={handleGenerate}
      />
    </div>
  );
}
