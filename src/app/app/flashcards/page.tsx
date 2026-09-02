"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Layers, Search, Trash2, X, Plus, ArrowRight, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  useLibraryFlashcards,
  useDeleteLibraryFlashcard,
  useGenerateFlashcards,
} from "@/hooks/app/use-app-library";
import { GenerationDialog } from "@/components/app/library/generation-dialog";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

const COURSE_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  DCIT: { bg: "bg-blue-50", text: "text-blue-700" },
  MATH: { bg: "bg-purple-50", text: "text-purple-700" },
  UGRC: { bg: "bg-emerald-50", text: "text-emerald-700" },
  STAT: { bg: "bg-amber-50", text: "text-amber-700" },
  ECON: { bg: "bg-rose-50", text: "text-rose-700" },
};

function getCourseBadgeStyle(code = "") {
  const prefix = code.split(" ")[0]?.toUpperCase() || "";
  return COURSE_COLOR_MAP[prefix] ?? { bg: "bg-blue-50", text: "text-blue-700" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const {
    data: sets = [],
    isLoading,
    error: queryError,
  } = useLibraryFlashcards();
  const deleteMutation = useDeleteLibraryFlashcard();
  const generateFlashcardsMutation = useGenerateFlashcards();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);

  // Filter client-side
  const searchRe = useMemo(
    () =>
      search.trim()
        ? new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        : null,
    [search],
  );

  const filtered = sets.filter((s) => {
    if (searchRe && !searchRe.test(s.title)) return false;
    if (courseFilter && s.courseCode !== courseFilter) return false;
    return true;
  });

  const totalCards = sets.reduce((sum, set) => sum + (set.cardCount || 0), 0);

  const courses = Array.from(
    new Set(sets.map((s) => s.courseCode).filter(Boolean)),
  ) as string[];

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Flashcard set deleted");
    } catch {
      toast.error("Failed to delete flashcards");
    }
  };

  const handleGenerate = async (materialId: string) => {
    await generateFlashcardsMutation.mutateAsync({ materialId });
  };

  return (
    <div className="qz-app min-h-full bg-[#F7F9FC] text-slate-900 antialiased pb-24">
      {/* Header / Hero */}
      <header className="border-b border-slate-200 bg-white px-6 pt-8 pb-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              My Library
            </p>
            <h1 className="display mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Your flashcards.
            </h1>
            <p className="hand mt-1 text-xl text-[#0C60FC]">
              flip, memorize, repeat ✦
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              {sets.length} {sets.length === 1 ? "set" : "sets"}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[#0C60FC]">
              {totalCards} total cards
            </span>
          </div>
        </div>

        {/* Search + Generate row */}
        <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-3xl flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search flashcards by title or course…"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0C60FC]/10 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {courses.length > 0 && (
              <Select
                value={courseFilter || "ALL"}
                onValueChange={(val) => setCourseFilter(val === "ALL" ? "" : val)}
              >
                <SelectTrigger className="h-10 rounded-2xl border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-[#0C60FC] transition cursor-pointer">
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white font-sans text-xs shadow-lg">
                  <SelectItem value="ALL" className="text-xs font-bold text-slate-700 cursor-pointer">
                    All courses
                  </SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs font-bold text-slate-700 cursor-pointer">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <button
              onClick={() => setIsGenerationDialogOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#0C60FC] transition-all shrink-0"
            >
              <Plus className="size-4" />
              Generate Flashcards
            </button>
          </div>
        </div>
      </header>

      {/* Content Grid */}
      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Loading */}
          {isLoading && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-[28px] animate-pulse bg-white border border-slate-200/80 p-6"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoading && queryError && (
            <div className="rounded-[28px] border border-rose-200 bg-rose-50/50 p-8 text-center text-sm font-semibold text-rose-700">
              Failed to load flashcard sets.
            </div>
          )}

          {/* Empty */}
          {!isLoading && !queryError && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white py-20 px-6 text-center shadow-sm"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0C60FC] ring-1 ring-blue-200">
                <Layers className="size-8" />
              </div>
              <h3 className="mt-5 text-base font-bold text-slate-900">
                {search || courseFilter
                  ? "No flashcard sets match your filter"
                  : "No flashcard sets yet"}
              </h3>
              <p className="mt-1.5 max-w-sm text-xs font-semibold text-slate-500">
                {search || courseFilter
                  ? "Try searching for a different keyword or reset your course filter."
                  : "Generate active recall flashcards from your uploaded lecture notes and study materials."}
              </p>
              {!search && !courseFilter && (
                <button
                  type="button"
                  onClick={() => setIsGenerationDialogOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-[#0C60FC] transition-all"
                >
                  <Plus className="size-4" />
                  Generate your first set
                </button>
              )}
            </motion.div>
          )}

          {/* Cards Grid */}
          {!isLoading && !queryError && filtered.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((set) => {
                  const courseBadge = getCourseBadgeStyle(set.courseCode);
                  const code = set.courseCode || set.courseTitle || "FLASHCARDS";

                  return (
                    <motion.article
                      key={set.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="play-card group relative flex flex-col justify-between rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all min-w-0"
                      style={{ borderRadius: "28px" }}
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${courseBadge.bg} ${courseBadge.text}`}
                            >
                              {code}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-700">
                              {set.cardCount} {set.cardCount === 1 ? "card" : "cards"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(set.id, set.title);
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors disabled:opacity-20 shrink-0"
                            title="Delete set"
                            aria-label="Delete set"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        {/* Title */}
                        <Link href={`/app/flashcards/${set.id}`} className="block mt-4 group">
                          <h3 className="text-xl font-bold leading-snug text-slate-950 group-hover:text-[#0C60FC] transition-colors line-clamp-2">
                            {set.title}
                          </h3>
                        </Link>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {[set.courseTitle, formatDate(set.createdAt)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        {/* Visual Deck Preview */}
                        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="size-4 text-[#0C60FC]" />
                            <span className="text-[11px] font-bold text-slate-600">
                              Interactive 3D Deck
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#0C60FC] uppercase tracking-wider">
                            Ready
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action */}
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <Link
                          href={`/app/flashcards/${set.id}`}
                          className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-extrabold text-white transition hover:bg-[#0C60FC]"
                        >
                          <span>Study Flashcards</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <GenerationDialog
        isOpen={isGenerationDialogOpen}
        onOpenChange={setIsGenerationDialogOpen}
        title="Generate Flashcards"
        description="Select a material from your library or upload a new one to generate AI flashcards."
        type="flashcards"
        onGenerate={handleGenerate}
      />
    </div>
  );
}

