"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Search, X, PlayCircle, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSystemQuizzes } from "@/hooks/app/use-quizzes";
import { PaginationController } from "@/components/common/pagination-controller";


import { QuizCard } from "@/components/app/quizzes/quiz-card";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemQuizzesPage() {
  const { data: quizzes = [], isLoading, error: queryError } = useSystemQuizzes();

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const searchRe = useMemo(
    () =>
      search.trim()
        ? new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        : null,
    [search],
  );

  const filtered = quizzes.filter((q: any) => {
    if (searchRe && !searchRe.test(q.title) && !searchRe.test(q.description ?? "")) return false;
    if (tagFilter && !q.tags?.includes(tagFilter)) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, tagFilter]);

  const allTags = Array.from(new Set(quizzes.flatMap((q: any) => q.tags ?? []).filter(Boolean)));

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
                Qz Platform
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Quizzes</h1>
              <p className="mt-2 text-sm font-mono text-muted-foreground/70">
                Official Qz quizzes — curated and reviewed by the team.
              </p>
            </div>
            <div className="rounded-(--radius) border border-border/40 bg-background/40 px-3 py-2 text-center shrink-0">
              <p className="text-xs font-mono font-semibold text-foreground">
                {quizzes.length}
              </p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
                Available
              </p>
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
          {allTags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="border border-border/50 bg-card/40 px-3 py-2.5 text-[12px] font-mono text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">All topics</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 animate-pulse bg-card/40 border border-border/30" />
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
              <GraduationCap className="size-6 text-primary/60" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
              {search || tagFilter
                ? "No quizzes match your filters"
                : "No quizzes available yet."}
            </p>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && !queryError && paginated.length > 0 && (
          <div className="space-y-8">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {paginated.map((quiz) => (
                  <QuizCard
                    key={quiz._id}
                    id={quiz._id}
                    title={quiz.title}
                    description={quiz.description}
                    href={`/quizzes/${quiz._id}`}
                    questionCount={quiz.questionCount ?? 0}
                    lectureCount={quiz.lectureCount ?? 0}
                    passingScore={quiz.passingScore}
                    tags={quiz.tags}
                    createdAt={quiz.createdAt}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            <PaginationController
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-6"
            />
          </div>
        )}


        {/* Count */}
        {!isLoading && quizzes.length > 0 && (
          <p className="mt-8 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30">
            {filtered.length} of {quizzes.length}{" "}
            {quizzes.length === 1 ? "quiz" : "quizzes"}
          </p>
        )}
      </div>
    </div>
  );
}
