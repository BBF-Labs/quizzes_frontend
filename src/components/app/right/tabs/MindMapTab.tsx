"use client";

import { MindMapVisualizer } from "@/components/app/mindmaps/MindMapVisualizer";
import type { StudioMindMap } from "@/types/session";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MindMapTabProps {
  mindMap: StudioMindMap | undefined;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MindMapTab({ mindMap }: MindMapTabProps) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50">
          Mind Map
        </span>
        {mindMap && mindMap.nodes.length > 0 && (
          <span className="text-[9px] font-mono text-muted-foreground/40 bg-background/50 px-1.5 py-0.5 rounded border border-border/20">
            {mindMap.nodes.length} nodes
          </span>
        )}
      </div>

      {!mindMap || mindMap.nodes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-border/30 bg-card/5 rounded-sm p-8 group">
          <p className="text-[10px] font-mono text-muted-foreground/40 text-center uppercase tracking-widest leading-loose max-w-50 animate-pulse group-hover:text-primary/40 transition-colors">
            No mind map yet — Z will build one as you study
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-100 rounded-sm overflow-hidden border border-border/30 bg-background/40">
           <MindMapVisualizer content={mindMap} />
        </div>
      )}
    </div>
  );
}
