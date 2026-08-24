"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, X, Plus, Loader2 } from "lucide-react";
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
  const {
    data: quizzes = [],
    isLoading,
    error: queryError,
  } = useLibraryQuizzes();
  const deleteMutation = useDeleteLibraryQuiz();
  const generateQuizMutation = useGenerateQuiz();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);

  // Client-side filtering
  const searchRe = useMemo(
    () =>
      search.trim()
        ? new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        : null,
    [search],
  );

  const filtered = quizzes.filter((q) => {
    if (searchRe && !searchRe.test(q.title)) return false;
    if (courseFilter && q.courseCode !== courseFilter) return false;
    return true;
  });

  const courses = Array.from(
    new Set(quizzes.map((q) => q.courseCode).filter(Boolean)),
  ) as string[];

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Quiz deleted");
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  const handleGenerate = async (
    materialId: string,
    settings?: Record<string, unknown>,
  ) => {
    await generateQuizMutation.mutateAsync({ materialId, settings });
  };

  const totalCount = quizzes.length;
  const filteredCount = filtered.length;

  return (
    <div className="qz-app min-h-full bg-[#F7F9FC] text-slate-900 antialiased">
      {/* Header / Hero — mirrors the library page */}
      <header className="border-b border-slate-200 bg-white px-6 pt-8 pb-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              My Library
            </p>
            <h1 className="display mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Your quizzes.
            </h1>
            <p className="hand mt-1 text-xl text-[#0C60FC]">
              test yourself, beat your best ✦
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              {totalCount} total
            </span>
            {courses.length > 0 && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[#0C60FC]">
                {courses.length} {courses.length === 1 ? "course" : "courses"}
              </span>
            )}
          </div>
        </div>

        {/* Search + Generate row */}
        <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-3xl flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by quiz title…"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-10 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsGenerationDialogOpen(true)}
            className="squishy group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Quiz</span>
          </button>
        </div>

        {/* Course filter chips (only render if there are courses) */}
        {courses.length > 0 && (
          <div className="mx-auto mt-5 flex max-w-7xl flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCourseFilter("")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                courseFilter === ""
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              All courses
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                  courseFilter === ""
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {totalCount}
              </span>
            </button>
            {courses.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCourseFilter(c)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  courseFilter === c
                    ? "bg-slate-950 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {c}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                    courseFilter === c
                      ? "bg-white/15 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {quizzes.filter((q) => q.courseCode === c).length}
                </span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Grid */}
      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#0C60FC]" />
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Loading your quizzes…
              </p>
            </div>
          ) : queryError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 py-16 text-center">
              <p className="text-sm font-bold text-rose-700">
                Failed to load quizzes.
              </p>
              <p className="mt-1 text-xs font-semibold text-rose-600">
                Try refreshing the page in a moment.
              </p>
            </div>
          ) : filteredCount === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20">
              <BookOpen className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">
                {search || courseFilter
                  ? "No quizzes match your filters"
                  : "No quizzes yet"}
              </p>
              <p className="mt-1 max-w-sm text-center text-xs font-semibold text-slate-500">
                {search || courseFilter
                  ? "Try a different search or course filter."
                  : "Generate your first quiz from a study material in your library."}
              </p>
              {!search && !courseFilter && (
                <button
                  type="button"
                  onClick={() => setIsGenerationDialogOpen(true)}
                  className="squishy mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC]"
                >
                  <Plus className="h-4 w-4" />
                  Generate your first quiz
                </button>
              )}
            </div>
          ) : (
            <motion.div
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
                    lectureCount={quiz.lectureCount}
                    averageScore={quiz.averageScore}
                    createdAt={quiz.createdAt}
                    onDelete={() => handleDelete(quiz.id, quiz.title)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer count */}
      {!isLoading && filteredCount > 0 && (
        <p className="pb-10 text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          showing {filteredCount} of {totalCount}{" "}
          {totalCount === 1 ? "quiz" : "quizzes"}
        </p>
      )}

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
