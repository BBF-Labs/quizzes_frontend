"use client";

import { use, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Network, Layers, Sparkles } from "lucide-react";
import { useLibraryMindMap } from "@/hooks/app";
import { MindMapVisualizer } from "@/components/app/mindmaps/MindMapVisualizer";
import { useBreadcrumbStore } from "@/store/breadcrumb";

export default function MindMapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: mindMap, isLoading, error } = useLibraryMindMap(id);

  useEffect(() => {
    if (mindMap?.title) {
      useBreadcrumbStore.getState().setDynamicTitle(mindMap.title);
    }
    return () => useBreadcrumbStore.getState().setDynamicTitle(null);
  }, [mindMap?.title]);

  const chaptersCount = useMemo(() => {
    if (!mindMap?.mindMap?.nodes) return 0;
    const count = mindMap.mindMap.nodes.filter(
      (n) => n.type === "concept" || n.type === "topic",
    ).length;
    return count > 0 ? count : 1;
  }, [mindMap]);

  const topicsCount = useMemo(() => {
    if (!mindMap?.mindMap?.nodes) return 0;
    const count = mindMap.mindMap.nodes.filter(
      (n) => n.type === "detail" || n.type === "question",
    ).length;
    return count > 0 ? count : mindMap.mindMap.nodes.length;
  }, [mindMap]);

  return (
    <div className="qz-app min-h-full bg-[#F7F9FC] text-slate-900 antialiased flex flex-col">
      {/* Top Header — white bar matching quizzes and library pages */}
      <header className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8 shrink-0">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Link
              href="/app/mindmaps"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-[#0C60FC] transition cursor-pointer"
            >
              <ArrowLeft className="size-3.5 stroke-[2.5]" />
              <span>Back to Mind Maps</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {mindMap?.title || (isLoading ? "Loading mind map…" : "Mind Map")}
            </h1>
            {mindMap?.courseTitle && (
              <p className="text-xs font-semibold text-slate-500">
                {mindMap.courseTitle}
              </p>
            )}
          </div>

          {mindMap && (
            <div className="flex items-center gap-2">
              {mindMap.courseCode && (
                <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-[#0C60FC] ring-1 ring-blue-200">
                  {mindMap.courseCode}
                </span>
              )}
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-600 shadow-2xs">
                {chaptersCount} {chaptersCount === 1 ? "chapter" : "chapters"}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-600 shadow-2xs">
                {topicsCount} {topicsCount === 1 ? "topic" : "topics"}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Loading State */}
          {isLoading && (
            <div className="h-[580px] rounded-[32px] border border-slate-200/80 bg-white shadow-sm animate-pulse flex flex-col items-center justify-center gap-3">
              <div className="size-8 border-3 border-[#0C60FC] border-t-transparent animate-spin rounded-full" />
              <p className="text-xs font-bold text-slate-400">
                Loading knowledge graph…
              </p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="rounded-[28px] border border-rose-200 bg-rose-50/50 p-8 text-center text-sm font-semibold text-rose-700 shadow-xs">
              Failed to load mind map. It may have been deleted or moved.
            </div>
          )}

          {/* Visualizer Canvas Container */}
          {mindMap && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[calc(100vh-230px)] min-h-[580px] w-full"
            >
              <MindMapVisualizer content={mindMap.mindMap} />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
