"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Layers, Search, Trash2, X } from "lucide-react";
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

  const totalCards = sets.reduce((sum, set) => sum + (set.cardCount || 0), 0);

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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-(--radius) border border-border/40 bg-card/30 p-4 md:p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary/80">
                Study Library
              </p>
              <p className="mt-2 text-sm font-mono text-muted-foreground/70">
                Browse, filter, and open your flashcard sets.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-(--radius) border border-border/40 bg-background/40 px-3 py-2">
                <p className="text-xs font-mono font-semibold text-foreground">
                  {sets.length}
                </p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  Sets
                </p>
              </div>
              <div className="rounded-(--radius) border border-border/40 bg-background/40 px-3 py-2">
                <p className="text-xs font-mono font-semibold text-foreground">
                  {totalCards}
                </p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  Cards
                </p>
              </div>
              <div className="rounded-(--radius) border border-border/40 bg-background/40 px-3 py-2">
                <p className="text-xs font-mono font-semibold text-foreground">
                  {filtered.length}
                </p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  Showing
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-6 rounded-(--radius) border border-border/40 bg-card/20 p-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sets…"
                className="w-full rounded-(--radius) border border-border/50 bg-background/50 pl-9 pr-9 py-2.5 text-[12px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
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
                className="rounded-(--radius) border border-border/50 bg-background/50 px-3 py-2.5 text-[12px] font-mono text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
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
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-(--radius) animate-pulse bg-card/40 border border-border/30"
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
            <div className="flex size-14 items-center justify-center rounded-(--radius) border border-primary/20 bg-primary/5">
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
                  className="group relative rounded-(--radius) border border-border/40 bg-card/30 hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

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
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-mono font-bold text-sm text-foreground line-clamp-2 pr-2">
                        {set.title}
                      </p>
                      <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>

                    <p className="mt-1 text-[10px] font-mono text-muted-foreground/60 min-h-4">
                      {[set.courseTitle, set.courseCode]
                        .filter(Boolean)
                        .join(" · ") || "General"}
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="rounded-(--radius) text-[9px] font-mono h-4 px-1.5"
                      >
                        {set.cardCount} cards
                      </Badge>
                      {set.tags?.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="rounded-(--radius) text-[9px] font-mono h-4 px-1.5"
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
