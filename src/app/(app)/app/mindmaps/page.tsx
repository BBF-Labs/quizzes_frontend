"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Network, Search, ArrowUpRight } from "lucide-react";
import { useLibraryMindMaps } from "@/hooks/app";
import type { MindMapSummary } from "@/types/session";

export default function MindMapsPage() {
  const { data, isLoading, error } = useLibraryMindMaps();
  const [query, setQuery] = useState("");

  const mindMaps: MindMapSummary[] = data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mindMaps;
    return mindMaps.filter((m) => {
      const title = m.title?.toLowerCase() ?? "";
      const sessionName = m.sessionName?.toLowerCase() ?? "";
      return title.includes(q) || sessionName.includes(q);
    });
  }, [mindMaps, query]);

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-block border border-primary/40 bg-primary/5 px-2 py-1 mb-4">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-primary">
              Studio
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">Mind Maps</h1>
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            Standalone mind maps generated during your study sessions.
          </p>
          <div className="mt-4 h-px w-10 bg-primary/40" />
        </motion.div>

        <div className="mb-6 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mind maps..."
            className="w-full border border-border/50 bg-card/30 pl-9 pr-3 py-2 text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
          />
        </div>

        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse bg-card/40 border border-border/30"
              />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-mono text-destructive">
            Failed to load mind maps.
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex size-16 items-center justify-center border border-primary/20 bg-primary/5">
              <Network className="size-8 text-primary/50" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
              {mindMaps.length === 0
                ? "No mind maps yet — generate one during a study session"
                : "No mind maps match your search"}
            </p>
          </div>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((mindMap) => (
              <Link
                key={mindMap.id}
                href={`/app/mindmaps/${mindMap.id}`}
                className="group border border-border/40 bg-card/30 hover:border-primary/40 hover:bg-primary/5 transition-all p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                    {mindMap.title || "Mind Map"}
                  </h3>
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[11px] font-mono text-muted-foreground mb-3 truncate">
                  {mindMap.sessionName || "Study Session"}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
                  <span>{mindMap.nodeCount} nodes</span>
                  <span>{mindMap.edgeCount} edges</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
