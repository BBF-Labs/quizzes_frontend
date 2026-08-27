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
    <div
      className={cn(
        "relative w-full max-w-xl mx-auto my-6 p-6 sm:p-8 rounded-[32px] bg-white border border-slate-200/90 shadow-xl shadow-slate-200/40",
        className
      )}
    >
      {/* Top Diamond Symbol from Screenshot 2 & 6 */}
      <div className="flex justify-center mb-6">
        <div className="h-8 w-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-xs">
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" />
          </svg>
        </div>
      </div>

      {/* Pathway Items List */}
      <div className="relative space-y-4">
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
                    "absolute left-6.5 top-12 w-0.5 h-8 -ml-px z-0",
                    isCompleted || isCurrent
                      ? "bg-emerald-500"
                      : "border-l-2 border-dotted border-slate-300"
                  )}
                />
              )}

              {/* Step Card */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onSelectBlock?.(item)}
                className={cn(
                  "relative z-10 w-full text-left rounded-[22px] p-4 sm:p-5 transition-all flex items-center gap-3.5 border cursor-pointer",
                  isCurrent &&
                    "bg-white border-emerald-300 shadow-lg shadow-emerald-500/10 text-slate-900 ring-2 ring-emerald-500/20",
                  isCompleted &&
                    "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-white hover:border-emerald-200",
                  isUpcoming &&
                    "bg-slate-50/40 border-slate-200/70 text-slate-400 hover:text-slate-700 hover:bg-white"
                )}
              >
                {/* Node Status Icon */}
                <div
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isCurrent && "bg-emerald-100 text-emerald-700 font-bold",
                    isCompleted && "bg-emerald-50 text-emerald-600",
                    isUpcoming && "bg-slate-100 text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <div className="h-3 w-3 rounded-full bg-emerald-600 animate-pulse" />
                  ) : (
                    <Diamond className="h-4 w-4" />
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
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                    Active
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
