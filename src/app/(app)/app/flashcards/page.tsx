"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Layers, Search, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { FlashcardSetSummary } from "@/types/session";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const [sets, setSets] = useState<FlashcardSetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get<{ data: FlashcardSetSummary[] }>("/app/flashcards")
      .then((res) => setSets(res.data?.data ?? []))
      .catch((err) => {
        console.error("[FlashcardsPage] load failed", err);
        setError("Failed to load flashcard sets.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Filter client-side
  const searchRe = search.trim()
    ? new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    : null;

  const filtered = sets.filter((s) => {
    if (searchRe && !searchRe.test(s.title)) return false;
    if (courseFilter && s.courseCode !== courseFilter) return false;
    return true;
  });

  const courses = Array.from(
    new Set(sets.map((s) => s.courseCode).filter(Boolean)),
  ) as string[];

  const handleDelete = async (id: string) => {
    if (deletingIds.has(id)) return;
    setDeletingIds((p) => new Set([...p, id]));
    try {
      await api.delete(`/app/flashcards/${id}`);
      setSets((p) => p.filter((s) => s.id !== id));
    } catch (err) {
      console.error("[FlashcardsPage] delete failed", err);
    } finally {
      setDeletingIds((p) => {
        const next = new Set(p);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        ></motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sets…"
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
        {!isLoading && error && (
          <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="flex size-14 items-center justify-center border border-primary/20 bg-primary/5">
              <Layers className="size-6 text-primary/60" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
              {search || courseFilter
                ? "No sets match your filters"
                : "No flashcard sets yet. Study with Z to generate some."}
            </p>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && !error && filtered.length > 0 && (
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
              {filtered.map((set) => (
                <motion.div
                  key={set.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.22 },
                    },
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative border border-border/40 bg-card/30 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(set.id);
                    }}
                    disabled={deletingIds.has(set.id)}
                    className="absolute top-2 right-2 p-1 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all disabled:opacity-20"
                    aria-label="Delete set"
                  >
                    <Trash2 className="size-3.5" />
                  </button>

                  <Link
                    href={`/app/flashcards/${set.id}`}
                    className="block p-4"
                  >
                    <p className="font-mono font-bold text-sm text-foreground line-clamp-2 pr-6">
                      {set.title}
                    </p>
                    <p className="mt-1 text-[10px] font-mono text-muted-foreground/60">
                      {[set.courseTitle, set.courseCode]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[9px] font-mono h-4 px-1.5"
                      >
                        {set.cardCount} cards
                      </Badge>
                      {set.tags?.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[9px] font-mono h-4 px-1.5"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <p className="mt-3 text-[9px] font-mono text-muted-foreground/40">
                      {formatDate(set.createdAt)}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Count */}
        {!isLoading && sets.length > 0 && (
          <p className="mt-8 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30">
            {filtered.length} of {sets.length}{" "}
            {sets.length === 1 ? "set" : "sets"}
          </p>
        )}
      </div>
    </div>
  );
}
