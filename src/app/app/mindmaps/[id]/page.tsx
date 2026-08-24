"use client";

import { use, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="min-h-full px-4 pt-2 pb-8">
      <div className="mx-auto max-w-4xl">
        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse bg-card/40 border border-border/30"
              />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm font-mono text-destructive">
            Failed to load mind map.
          </div>
        )}

        {mindMap && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[9px] font-mono h-4 px-1.5"
              >
                {mindMap.mindMap.nodes.length} nodes
              </Badge>
              <Badge
                variant="outline"
                className="text-[9px] font-mono h-4 px-1.5"
              >
                {mindMap.mindMap.edges.length} edges
              </Badge>
            </div>
            <div className="mt-4 h-px w-10 bg-primary/40" />

            <div className="mt-8 h-150">
              <MindMapVisualizer content={mindMap.mindMap} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
