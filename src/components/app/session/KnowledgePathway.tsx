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
  // Default milestone items matching the screenshot if not provided
  const blocks: KnowledgeBlockItem[] = items && items.length > 0 ? items : [
    {
      id: "1",
      title: "Primality testing is needed to find large random primes",
      status: "completed",
    },
    {
      id: "2",
      title: "AKS is a deterministic primality test",
      status: "current",
    },
    {
      id: "3",
      title: "The Miller-Rabin test quickly finds large random primes",
      status: "upcoming",
    },
    {
      id: "4",
      title: "Chapter 8 review questions practice gcd and modular arithmetic tools",
      status: "upcoming",
    },
  ];

  return (
    <div
      className={cn(
        "relative w-full max-w-2xl mx-auto my-6 rounded-[36px] bg-[#F7F6F1] border border-[#E9E7DE] p-6 sm:p-8 shadow-xs",
        className
      )}
    >
      {/* Top 4-Diamond Clover Cross Badge */}
      <div className="flex justify-center -mt-10 sm:-mt-12 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-white border border-[#E9E7DE] shadow-sm flex items-center justify-center p-1.5">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-[#52B32B]"
            fill="currentColor"
          >
            {/* Top diamond */}
            <path d="M12 2.5L14.8 5.3L12 8.1L9.2 5.3Z" />
            {/* Bottom diamond */}
            <path d="M12 15.9L14.8 18.7L12 21.5L9.2 18.7Z" />
            {/* Left diamond */}
            <path d="M5.3 9.2L8.1 12L5.3 14.8L2.5 12Z" />
            {/* Right diamond */}
            <path d="M18.7 9.2L21.5 12L18.7 14.8L15.9 12Z" />
          </svg>
        </div>
      </div>

      {/* SVG S-Curve Snake Pathway Track */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 600 380"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Track 1: Top badge (300, 20) -> curves left to (100, 72) */}
        <path
          d="M 300 18 L 300 42 Q 300 58 280 58 L 130 58 Q 95 58 95 76 L 95 82"
          stroke="#52B32B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Track 2: From Pill 1 bottom-left (95, 118) -> curves right across to (500, 160) */}
        <path
          d="M 95 118 L 95 128 Q 95 142 120 142 L 475 142 Q 505 142 505 158 L 505 168"
          stroke="#52B32B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Track 3: From Pill 2 (500, 204) -> dotted curve left across to (95, 246) */}
        <path
          d="M 505 204 L 505 214 Q 505 228 475 228 L 120 228 Q 95 228 95 244 L 95 254"
          stroke="#94A3B8"
          strokeWidth="2.5"
          strokeDasharray="4 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Track 4: From Pill 3 (95, 290) -> dotted curve right across to (505, 332) */}
        <path
          d="M 95 290 L 95 300 Q 95 314 120 314 L 475 314 Q 505 314 505 330 L 505 340"
          stroke="#CBD5E1"
          strokeWidth="2.5"
          strokeDasharray="4 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Stack of 4 Milestone Step Pills */}
      <div className="relative z-10 space-y-4">
        {blocks.map((block, idx) => {
          const isCompleted = block.status === "completed";
          const isCurrent = block.status === "current";
          const isUpcoming = block.status === "upcoming";

          return (
            <motion.button
              key={block.id || idx}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectBlock?.(block)}
              className={cn(
                "w-full text-left rounded-full bg-white border px-4 sm:px-5 py-3 sm:py-3.5 flex items-center gap-3.5 shadow-sm transition-all cursor-pointer",
                isCurrent
                  ? "border-slate-300 ring-2 ring-emerald-500/20 text-slate-950"
                  : isCompleted
                  ? "border-slate-200/90 text-slate-700 hover:border-slate-300"
                  : "border-slate-200/70 text-slate-400 hover:text-slate-600 hover:border-slate-300"
              )}
            >
              {/* Badge Icon */}
              <div className="shrink-0">
                {isCompleted ? (
                  <div className="h-8 w-8 rounded-full bg-linear-to-br from-[#84CC16] via-[#65A30D] to-[#4D7C0F] text-white flex items-center justify-center shadow-xs">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 3L20 12L12 21L4 12Z" />
                    </svg>
                  </div>
                ) : isCurrent ? (
                  <div className="h-8 w-8 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] text-[#16A34A] flex items-center justify-center shadow-xs">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4L19 12L12 20L5 12Z" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-2xl bg-slate-100/90 text-slate-400 flex items-center justify-center">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M12 4L19 12L12 20L5 12Z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Step Text */}
              <span
                className={cn(
                  "text-xs sm:text-[13px] leading-snug truncate",
                  isCurrent && "font-bold text-slate-950",
                  isCompleted && "font-medium text-slate-700",
                  isUpcoming && "font-normal text-slate-400"
                )}
              >
                {block.title}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
