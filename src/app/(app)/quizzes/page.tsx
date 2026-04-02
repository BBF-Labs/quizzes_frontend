"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Search, X } from "lucide-react";
import { useSystemQuizzes } from "@/hooks/app/use-quizzes";
import { PaginationController } from "@/components/common/pagination-controller";
import { QuizCard } from "@/components/app/quizzes/quiz-card";

const PAGE_SIZE = 12;

// ─── Page ─────────────────────────────────────────────────────────────────────

function SystemQuizzesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const search = searchParams.get("search") ?? "";
  const tagFilter = searchParams.get("tag") ?? "";

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

  const { data, isLoading, error: queryError } = useSystemQuizzes({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    tags: tagFilter || undefined,
  });

  const quizzes = data?.quizzes ?? [];
  const pagination = data?.pagination ?? null;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const handleSearch = (value: string) => {
    updateQueryParams({ search: value || null, page: "1" });
  };

  const handleClearSearch = () => {
    updateQueryParams({ search: null, page: "1" });
  };

  const handleTagChange = (value: string) => {
    updateQueryParams({ tag: value || null, page: "1" });
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
                Qz Platform
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Quizzes</h1>
              <p className="mt-2 text-sm font-mono text-muted-foreground/70">
                Official Qz quizzes — curated and reviewed by the team.
              </p>
            </div>
            <div className="rounded-(--radius) border border-border/40 bg-background/40 px-3 py-2 text-center shrink-0">
              <p className="text-xs font-mono font-semibold text-foreground">
                {isLoading ? "—" : total}
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
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search quizzes…"
              className="w-full border border-border/50 bg-card/40 pl-9 pr-9 py-2.5 text-[12px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <input
            type="text"
            value={tagFilter}
            onChange={(e) => handleTagChange(e.target.value)}
            placeholder="Filter by tag…"
            className="border border-border/50 bg-card/40 px-3 py-2.5 text-[12px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors sm:w-44"
          />
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
        {!isLoading && !queryError && quizzes.length === 0 && (
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
        {!isLoading && !queryError && quizzes.length > 0 && (
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
                {quizzes.map((quiz) => (
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

            {totalPages > 1 && (
              <PaginationController
                page={page}
                totalPages={totalPages}
                onPageChange={(nextPage) =>
                  updateQueryParams({ page: String(nextPage) })
                }
                className="mt-6"
              />
            )}
          </div>
        )}

        {/* Count */}
        {!isLoading && total > 0 && (
          <p className="mt-8 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30">
            {total} {total === 1 ? "quiz" : "quizzes"}
            {(search || tagFilter) && " matching filters"}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SystemQuizzesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full px-4 py-8">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse bg-card/40 border border-border/30"
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SystemQuizzesContent />
    </Suspense>
  );
}
