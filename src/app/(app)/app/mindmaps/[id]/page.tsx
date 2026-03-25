"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useLibraryMindMap } from "@/hooks/app";

export default function MindMapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: mindMap, isLoading, error } = useLibraryMindMap(id);

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/app/mindmaps"
          className="inline-block mb-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors"
        >
          ← All Mind Maps
        </Link>

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
            <h1 className="text-2xl font-black tracking-tighter">
              {mindMap.title}
            </h1>
            <div className="mt-2 flex items-center gap-2">
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

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <section className="border border-border/40 bg-card/20 p-4">
                <h2 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-3">
                  Nodes
                </h2>
                <div className="flex flex-col gap-2">
                  {mindMap.mindMap.nodes.length === 0 && (
                    <p className="text-[11px] font-mono text-muted-foreground/50">
                      No nodes.
                    </p>
                  )}
                  {mindMap.mindMap.nodes.map((node) => (
                    <div
                      key={node.id}
                      className="border border-border/30 bg-card/40 px-3 py-2"
                    >
                      <p className="text-[12px] font-semibold leading-tight">
                        {node.label}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
                        {node.type} · x:{Math.round(node.position.x)} y:
                        {Math.round(node.position.y)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-border/40 bg-card/20 p-4">
                <h2 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-3">
                  Edges
                </h2>
                <div className="flex flex-col gap-2">
                  {mindMap.mindMap.edges.length === 0 && (
                    <p className="text-[11px] font-mono text-muted-foreground/50">
                      No edges.
                    </p>
                  )}
                  {mindMap.mindMap.edges.map((edge) => (
                    <div
                      key={edge.id}
                      className="border border-border/30 bg-card/40 px-3 py-2"
                    >
                      <p className="text-[12px] font-mono leading-tight">
                        {edge.source} → {edge.target}
                      </p>
                      {edge.label && (
                        <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
                          {edge.label}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
