"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Search, X, PlayCircle, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSystemQuizzes } from "@/hooks/app/use-quizzes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemQuizzesPage() {
  const { data: quizzes = [], isLoading, error: queryError } = useSystemQuizzes();

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const searchRe = useMemo(
    () =>
      search.trim()
        ? new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        : null,
    [search],
  );

  const filtered = quizzes.filter((q) => {
    if (searchRe && !searchRe.test(q.title) && !searchRe.test(q.description ?? "")) return false;
    if (tagFilter && !q.tags.includes(tagFilter)) return false;
    return true;
  });

  const allTags = Array.from(new Set(quizzes.flatMap((q) => q.tags).filter(Boolean)));

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
                <motion.div
                  key={quiz._id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative border border-border/40 bg-card/30 hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <Link href={`/quizzes/${quiz._id}`} className="block p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono font-bold text-sm text-foreground line-clamp-2 pr-2">
                        {quiz.title}
                      </p>
                      <span className="shrink-0 mt-0.5 p-0.5 text-muted-foreground/40 group-hover:text-primary transition-colors">
                        <PlayCircle className="size-3.5" />
                      </span>
                    </div>

                    {quiz.description && (
                      <p className="mt-1 text-[10px] font-mono text-muted-foreground/60 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5">
                        {quiz.questionCount ?? 0} Qs
                      </Badge>
                      <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5">
                        {quiz.lectureCount ?? 0} lectures
                      </Badge>
                      <Badge variant="secondary" className="text-[9px] font-mono h-4 px-1.5">
                        Pass {quiz.passingScore}%
                      </Badge>
                    </div>

                    {quiz.tags.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 flex-wrap">
                        <Tag className="size-2.5 text-muted-foreground/30 shrink-0" />
                        {quiz.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono text-muted-foreground/40"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-3 text-[9px] font-mono text-muted-foreground/40">
                      {formatDate(quiz.createdAt)}
                    </p>
                  </Link>
                </motion.div>
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
    </div>
  );
}
