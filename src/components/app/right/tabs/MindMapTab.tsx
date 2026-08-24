"use client";

import { MindMapVisualizer } from "@/components/app/mindmaps/MindMapVisualizer";
import type { StudioMindMap } from "@/types/session";
import { Network } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MindMapTabProps {
  mindMap: StudioMindMap | undefined;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MindMapTab({ mindMap }: MindMapTabProps) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Mind Map
        </span>
        {mindMap && mindMap.nodes.length > 0 && (
          <span className="text-[10px] font-extrabold text-[#0C60FC] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {mindMap.nodes.length} nodes
          </span>
        )}
      </div>

      {!mindMap || mindMap.nodes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#0C60FC] mb-3">
            <Network className="size-5" />
          </div>
          <p className="text-xs font-bold text-slate-600">
            No mind map yet
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-1 max-w-45">
            Z will generate a connected concept map as you study
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-100 rounded-2xl overflow-hidden border border-slate-200/80 bg-white">
          <MindMapVisualizer content={mindMap} />
        </div>
      )}
    </div>
  );
}
