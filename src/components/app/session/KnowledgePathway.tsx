"use client";

import { motion } from "framer-motion";
import { Check, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KnowledgeBlockItem {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming";
  description?: string;
}

interface KnowledgePathwayProps {
  items: KnowledgeBlockItem[];
  onSelectBlock?: (item: KnowledgeBlockItem) => void;
  className?: string;
  compact?: boolean;
}

export function KnowledgePathway({
  items,
  onSelectBlock,
  className,
  compact = false,
}: KnowledgePathwayProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={cn("relative w-full max-w-xl mx-auto my-6 p-4 sm:p-6 rounded-[28px] bg-slate-50/80 border border-slate-200/80 shadow-xs", className)}>
      {/* Top Node Symbol */}
      <div className="flex justify-center mb-3">
        <div className="h-7 w-7 rounded-xl bg-emerald-100/80 border border-emerald-300/80 flex items-center justify-center text-emerald-700 shadow-xs">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" />
          </svg>
        </div>
      </div>

      {/* Pathway Items List */}
      <div className="relative space-y-3">
        {items.map((item, index) => {
          const isCurrent = item.status === "current";
          const isCompleted = item.status === "completed";
          const isUpcoming = item.status === "upcoming";

          return (
            <div key={item.id || index} className="relative">
              {/* Connector line between steps */}
              {index < items.length - 1 && (
                <div
                  className={cn(
                    "absolute left-6 top-10 w-0.5 h-6 -ml-px z-0",
                    isCompleted || isCurrent
                      ? "bg-emerald-400"
                      : "border-l border-dashed border-slate-300"
                  )}
                />
              )}

              {/* Step Card */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectBlock?.(item)}
                className={cn(
                  "relative z-10 w-full text-left rounded-2xl p-3.5 sm:p-4 transition-all flex items-center gap-3.5 border shadow-xs cursor-pointer",
                  isCurrent &&
                    "bg-white border-emerald-300 shadow-md shadow-emerald-500/10 text-slate-900 ring-2 ring-emerald-500/20",
                  isCompleted &&
                    "bg-white/90 border-slate-200 text-slate-700 hover:border-emerald-200",
                  isUpcoming &&
                    "bg-white/60 border-slate-200/80 text-slate-400 hover:text-slate-600 hover:bg-white"
                )}
              >
                {/* Node Status Icon */}
                <div
                  className={cn(
                    "h-7 w-7 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isCurrent && "bg-emerald-100 text-emerald-700 font-bold",
                    isCompleted && "bg-emerald-50 text-emerald-600",
                    isUpcoming && "bg-slate-100 text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  ) : (
                    <Diamond className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Title and optional description */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs sm:text-sm font-semibold truncate leading-snug",
                      isCurrent && "text-slate-950 font-bold",
                      isCompleted && "text-slate-800",
                      isUpcoming && "text-slate-500"
                    )}
                  >
                    {item.title}
                  </p>
                  {item.description && !compact && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.description}
                    </p>
                  )}
                </div>

                {isCurrent && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                    Current
                  </span>
                )}
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
