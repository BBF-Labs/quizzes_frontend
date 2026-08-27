"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface KnowledgeBlockItem {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming";
  description?: string;
}

interface KnowledgePathwayProps {
  items?: KnowledgeBlockItem[];
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
  const blocks: KnowledgeBlockItem[] =
    items && items.length > 0
      ? items
      : [
          {
            id: "1",
            title: "The Miller-Rabin test quickly finds large random primes",
            status: "current",
          },
          {
            id: "2",
            title: "Chapter 8 review questions practice gcd and modular ...",
            status: "upcoming",
          },
          {
            id: "3",
            title: "Active Recall Mechanism",
            status: "upcoming",
          },
        ];

  return (
    <div
      className={cn(
        "relative w-full max-w-md mx-auto rounded-[28px] bg-[#F7F6F3] border border-[#E8E6E0] pt-8 pb-7 px-5 sm:px-6 shadow-2xs",
        className
      )}
    >
      {/* ── Top Center Green Clover Badge ───────────────────────────────────── */}
      <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 z-20">
        <div className="h-9 w-9 rounded-full bg-white border border-slate-200/90 shadow-xs flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0" fill="none">
            <path d="M12 2L15 5L12 8L9 5Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="0.8" />
            <path d="M12 16L15 19L12 22L9 19Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="0.8" />
            <path d="M5 9L8 12L5 15L2 12Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="0.8" />
            <path d="M19 9L22 12L19 15L16 12Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="0.8" />
          </svg>
        </div>
      </div>

      {/* ── Relative Card Stack with Continuous Flowing Dotted S-Curve Track ── */}
      <div className="relative">
        {/* S-Curve Track with Green Active Segment and Dotted Upcoming Segment */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Base Dotted Upcoming Path */}
          <path
            d="M 50 -2 L 50 10 C 50 18, 20 18, 20 28 C 20 38, 85 40, 85 54 C 85 64, 20 68, 20 80 C 20 88, 16 94, 14 100"
            stroke="#CBD5E1"
            strokeWidth="1.8"
            strokeDasharray="2.5 3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Flowing Solid Green Active Path */}
          <motion.path
            d="M 50 -2 L 50 10 C 50 18, 20 18, 20 28 C 20 38, 85 40, 85 54"
            stroke="#84CC16"
            strokeWidth="2.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>

        {/* Stack of Pill Cards matching screenshot 2 (Read-only progress display) */}
        <div className="relative z-10 space-y-3.5">
          {blocks.map((block, idx) => {
            const isCurrent = block.status === "current" || (idx === 0 && !blocks.some((b) => b.status === "current"));
            const isCompleted = block.status === "completed";

            return (
              <div
                key={block.id || idx}
                className={cn(
                  "w-full text-left rounded-full bg-white border px-3.5 py-3 sm:py-3.5 flex items-center gap-3.5 shadow-2xs select-none",
                  isCurrent
                    ? "border-emerald-300/90 ring-1 ring-emerald-500/20 shadow-xs"
                    : isCompleted
                      ? "border-slate-300/80 bg-slate-50/70"
                      : "border-slate-200/90"
                )}
              >
                {/* Round Node Disc with Diamond */}
                <div
                  className={cn(
                    "h-8.5 w-8.5 rounded-full border flex items-center justify-center shrink-0 shadow-2xs transition",
                    isCompleted
                      ? "bg-linear-to-br from-[#84CC16] to-[#65A30D] border-[#4D7C0F] shadow-sm"
                      : isCurrent
                        ? "bg-[#ECFDF5] border-[#A7F3D0]"
                        : "bg-slate-50 border-slate-200/90"
                  )}
                >
                  <svg viewBox="0 0 14 18" className="h-3.5 w-2.5 shrink-0" fill="none">
                    <path
                      d="M7 1L13 9L7 17L1 9Z"
                      fill={
                        isCompleted
                          ? "#FFFFFF"
                          : isCurrent
                            ? "#84CC16"
                            : "#FFFFFF"
                      }
                      stroke={
                        isCompleted
                          ? "#FFFFFF"
                          : isCurrent
                            ? "#4D7C0F"
                            : "#94A3B8"
                      }
                      strokeWidth={isCompleted ? "1.6" : "1.3"}
                    />
                  </svg>
                </div>

                {/* Step Title */}
                <span
                  className={cn(
                    "text-xs sm:text-[12.5px] leading-snug line-clamp-2 transition",
                    isCurrent
                      ? "font-bold text-slate-950"
                      : isCompleted
                        ? "font-semibold text-slate-800"
                        : "font-medium text-slate-600"
                  )}
                >
                  {block.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
