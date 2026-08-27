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
        {/* Full-width S-Curve Dotted Track running behind cards */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <motion.path
            d="M 50 -2 L 50 10 C 50 18, 20 18, 20 28 C 20 38, 85 40, 85 54 C 85 64, 20 68, 20 80 C 20 88, 16 94, 14 100"
            stroke="#CBD5E1"
            strokeWidth="1.8"
            strokeDasharray="2.5 3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            animate={{ strokeDashoffset: [0, -22] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </svg>

        {/* Stack of 3 Pill Cards matching screenshot */}
        <div className="relative z-10 space-y-3.5">
          {blocks.map((block, idx) => {
            return (
              <motion.button
                key={block.id || idx}
                type="button"
                whileHover={{ scale: 1.008 }}
                whileTap={{ scale: 0.992 }}
                onClick={() => onSelectBlock?.(block)}
                className="w-full text-left rounded-full bg-white border border-slate-200/90 px-3.5 py-3 sm:py-3.5 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 transition cursor-pointer select-none"
              >
                {/* Round Node Disc with Outline Diamond */}
                <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200/90 flex items-center justify-center shrink-0 shadow-2xs">
                  <svg viewBox="0 0 14 18" className="h-3.5 w-2.5 shrink-0" fill="none">
                    <path
                      d="M7 1L13 9L7 17L1 9Z"
                      fill="#FFFFFF"
                      stroke="#64748B"
                      strokeWidth="1.4"
                    />
                  </svg>
                </div>

                {/* Step Title */}
                <span className="text-xs sm:text-[12.5px] font-medium text-slate-700 leading-snug line-clamp-2">
                  {block.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
