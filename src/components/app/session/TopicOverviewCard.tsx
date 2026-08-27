"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

import type { IKnowledgeBlock } from "@/types/session";

interface TopicOverviewCardProps {
  title?: string;
  coreIdea?: string;
  whyItMatters?: string;
  prerequisites?: Array<IKnowledgeBlock | string>;
  onContinue?: () => void;
}

export function TopicOverviewCard({
  title = "Primality Testing and Active Recall Strategies",
  coreIdea = "Primality testing and number theory algorithms provide the mathematical tools to verify if a large number is prime with absolute certainty or high probability.",
  whyItMatters = "Modern cryptographic protocols like RSA and Diffie-Hellman rely on generating very large prime numbers efficiently to secure digital communications and financial systems.",
  prerequisites = [],
  onContinue,
}: TopicOverviewCardProps) {
  // Support independent multi-card expansion in the stack
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formattedPrereqs = (prerequisites || []).map((p) =>
    typeof p === "string" ? p : p.title || p.concept || "Knowledge Block",
  );

  const sections = [
    {
      id: "core-idea",
      label: "Core idea",
      content: coreIdea,
    },
    {
      id: "why-matters",
      label: "Why it matters",
      content: whyItMatters,
    },
    ...(formattedPrereqs.length > 0
      ? [
          {
            id: "prerequisites",
            label: "Prerequisites",
            isList: true,
            items: formattedPrereqs,
          },
        ]
      : []),
  ];

  return (
    <div className="w-full max-w-xl mx-auto rounded-[28px] border border-slate-200/80 bg-[#F9F8F6] p-6 sm:p-7 shadow-xs space-y-3.5">
      {/* Header Info Tag */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
        <Info className="h-3 w-3 text-slate-400" />
        <span>Introduction</span>
      </div>

      {/* Main Title */}
      <h2 className="text-base sm:text-lg font-sans font-bold text-slate-900 tracking-tight leading-snug">
        {title}
      </h2>

      {/* Physical Stack of Overlapping Cards with Independent Multi-Expansion */}
      <div className="relative pt-1 flex flex-col">
        {sections.map((sec, idx) => {
          const isOpen = !!openSections[sec.id];

          return (
            <motion.div
              key={sec.id}
              layout
              style={{ zIndex: 10 + idx }}
              className={cn(
                "relative rounded-[18px] bg-white border border-slate-200/90 shadow-[0_3px_12px_rgba(0,0,0,0.05)] transition-all overflow-hidden",
                idx > 0 && !isOpen && "-mt-2",
                isOpen ? "my-1.5 p-4 z-30 shadow-md" : "hover:translate-y-[-1px] hover:shadow-sm cursor-pointer"
              )}
            >
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className={cn(
                  "w-full flex items-center justify-between text-left text-xs font-bold text-slate-900 cursor-pointer",
                  isOpen ? "pb-2.5 border-b border-slate-100" : "px-3.5 py-3"
                )}
              >
                <span>{sec.label}</span>

                {/* Right Action Button */}
                {isOpen ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition shrink-0">
                    <X className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white hover:bg-slate-800 transition shadow-2xs shrink-0">
                    <Plus className="h-3 w-3 stroke-[2.5]" />
                  </span>
                )}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2.5 text-[11.5px] sm:text-xs text-slate-600 leading-relaxed font-sans"
                  >
                    {sec.isList && sec.items ? (
                      <div className="space-y-1.5 pt-0.5">
                        {sec.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>{sec.content}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
