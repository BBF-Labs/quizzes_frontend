"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  Network,
  Search,
  Trash2,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useLibraryMindMaps,
  useDeleteLibraryMindMap,
  useGenerateMindMap,
} from "@/hooks/app/use-app-library";
import { GenerationDialog } from "@/components/app/library/generation-dialog";
import { useQueryParams } from "@/hooks";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MindMapsPage() {
  const {
    data: maps = [],
    isLoading,
    error: queryError,
  } = useLibraryMindMaps();
  const deleteMutation = useDeleteLibraryMindMap();
  const generateMindMapMutation = useGenerateMindMap();

  const { getParam, setQueryParams } = useQueryParams();
  const search = getParam("search", "");
  const courseFilter = getParam("course", "");
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);

  const setSearch = (val: string) =>
    setQueryParams({ search: val || null });
  const setCourseFilter = (val: string) =>
    setQueryParams({ course: val || null });

  // Filter client-side
  const searchRe = useMemo(
    () =>
      search.trim()
        ? new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        : null,
    [search],
  );

  const filtered = maps.filter((m) => {
    if (searchRe && !searchRe.test(m.title)) return false;
    if (courseFilter && m.courseCode !== courseFilter) return false;
    return true;
  });

  const totalCount = maps.length;
  const filteredCount = filtered.length;
  const totalNodes = maps.reduce((sum, map) => sum + (map.nodeCount || 0), 0);

  const courses = Array.from(
    new Set(maps.map((m) => m.courseCode).filter(Boolean)),
  ) as string[];

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Mind map deleted");
    } catch {
      toast.error("Failed to delete mind map");
    }
  };

  const handleGenerate = async (materialId: string) => {
    await generateMindMapMutation.mutateAsync({ materialId });
  };

  return (
    <div className="qz-app min-h-full bg-[#F7F9FC] text-slate-900 antialiased">
      {/* Header / Hero — mirrors quizzes & library page top side */}
      <header className="border-b border-slate-200 bg-white px-6 pt-8 pb-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              My Library
            </p>
            <h1 className="display mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Your mind maps.
            </h1>
            <p className="hand mt-1 text-xl text-[#0C60FC]">
              visualize, connect, master ✦
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
              placeholder="Search by mind map title…"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-10 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsGenerationDialogOpen(true)}
            className="squishy group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Mind Map</span>
          </button>
        </div>

        {/* Course filter chips */}
        {courses.length > 0 && (
          <div className="mx-auto mt-5 flex max-w-7xl flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCourseFilter("")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
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
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
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
                  {maps.filter((m) => m.courseCode === c).length}
                </span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Grid section */}
      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#0C60FC]" />
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Loading your mind maps…
              </p>
            </div>
          ) : queryError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 py-16 text-center">
              <p className="text-sm font-bold text-rose-700">
                Failed to load mind maps.
              </p>
              <p className="mt-1 text-xs font-semibold text-rose-600">
                Try refreshing the page in a moment.
              </p>
            </div>
          ) : filteredCount === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20">
              <Network className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">
                {search || courseFilter
                  ? "No mind maps match your filters"
                  : "No mind maps yet"}
              </p>
              <p className="mt-1 max-w-sm text-center text-xs font-semibold text-slate-500">
                {search || courseFilter
                  ? "Try a different search or course filter."
                  : "Generate your first mind map to visualize hierarchical concepts and relations."}
              </p>
              {!search && !courseFilter && (
                <button
                  type="button"
                  onClick={() => setIsGenerationDialogOpen(true)}
                  className="squishy mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Generate your first mind map
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((map) => (
                  <motion.div
                    key={map.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative flex flex-col justify-between rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm hover:border-[#0C60FC]/40 hover:shadow-md transition-all"
                  >
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm("Delete this mind map?")) {
                          handleDelete(map.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="absolute top-5 right-5 p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer"
                      aria-label="Delete mind map"
                    >
                      <Trash2 className="size-4" />
                    </button>

                    <div className="space-y-3">
                      {/* Header meta */}
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-[#0C60FC] ring-1 ring-blue-200">
                          {map.courseCode || "General"}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {map.createdAt ? formatDate(map.createdAt) : "Recently"}
                        </span>
                      </div>

                      {/* Title & description */}
                      <div>
                        <Link
                          href={`/app/mindmaps/${map.id}`}
                          className="text-base font-bold text-slate-950 group-hover:text-[#0C60FC] transition line-clamp-2"
                        >
                          {map.title || "Untitled Mind Map"}
                        </Link>
                        <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-1">
                          {map.courseTitle || map.sessionName || "Knowledge Graph"}
                        </p>
                      </div>

                      {/* Mini Visual Graph Teaser Animation */}
                      <div className="rounded-2xl border border-slate-100 bg-[#F7F9FC] p-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-[#0C60FC]" />
                          <span className="h-0.5 w-5 bg-slate-200" />
                          <span className="size-2 rounded-full bg-indigo-500" />
                          <span className="h-0.5 w-5 bg-slate-200" />
                          <span className="size-2 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 font-mono">
                          {map.nodeCount || 0} {map.nodeCount === 1 ? "topic" : "topics"}
                        </span>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-700">
                        Explore concepts
                      </span>
                      <Link
                        href={`/app/mindmaps/${map.id}`}
                        className="flex items-center gap-1 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-extrabold text-slate-900 group-hover:bg-[#0C60FC] group-hover:text-white transition-all"
                      >
                        <span>Open</span>
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <GenerationDialog
        isOpen={isGenerationDialogOpen}
        onOpenChange={setIsGenerationDialogOpen}
        title="Generate Mind Map"
        description="Select a material to synthesize into an interactive hierarchical mind map."
        type="mindmap"
        onGenerate={handleGenerate}
      />
    </div>
  );
}
