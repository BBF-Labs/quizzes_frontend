"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicOverviewCardProps {
  title?: string;
  coreIdea?: string;
  whyItMatters?: string;
  knowledgeBlocks?: string[];
  prerequisites?: string[];
  onContinue?: () => void;
}

export function TopicOverviewCard({
  title = "Primality Testing and Number Theory Algorithms",
  coreIdea = "Primality testing and number theory algorithms provide the mathematical tools to verify if a large number is prime with absolute certainty or high probability.",
  whyItMatters = "Modern cryptographic protocols like RSA and Diffie-Hellman rely on generating very large prime numbers efficiently to secure digital communications and financial systems.",
  knowledgeBlocks = [
    "Primality testing is needed to find large random primes",
    "AKS is a deterministic primality test",
    "The Miller-Rabin test quickly finds large random primes",
    "Chapter 8 review questions practice gcd and modular arithmetic tools",
  ],
  prerequisites = ["Modular Arithmetic Basics", "Greatest Common Divisor (GCD)", "Euler's Totient Function"],
  onContinue,
}: TopicOverviewCardProps) {
  const [openSection, setOpenSection] = useState<string | null>("core-idea");

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-[32px] border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm space-y-4">
      {/* Intro Tag */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <Info className="h-3.5 w-3.5 text-slate-400" />
        <span>Introduction</span>
      </div>

      {/* Main Title */}
      <h2 className="text-xl sm:text-2xl font-serif text-slate-950 font-normal leading-snug">
        {title}
      </h2>

      {/* Accordion Sections matching Image 3 */}
      <div className="space-y-2 pt-1">
        {/* Core Idea */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("core-idea")}
            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-900 cursor-pointer"
          >
            <span>Core idea</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/80 text-slate-600">
              {openSection === "core-idea" ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {openSection === "core-idea" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3.5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans"
              >
                {coreIdea}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Why it matters */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("why-matters")}
            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-900 cursor-pointer"
          >
            <span>Why it matters</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/80 text-slate-600">
              {openSection === "why-matters" ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {openSection === "why-matters" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3.5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans"
              >
                {whyItMatters}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Knowledge blocks to learn */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("knowledge-blocks")}
            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-900 cursor-pointer"
          >
            <span>Knowledge blocks to learn</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/80 text-slate-600">
              {openSection === "knowledge-blocks" ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {openSection === "knowledge-blocks" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3.5 pb-4 text-xs text-slate-600 space-y-2 font-sans"
              >
                {knowledgeBlocks.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Prerequisites */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("prerequisites")}
            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-900 cursor-pointer"
          >
            <span>Prerequisites</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/80 text-slate-600">
              {openSection === "prerequisites" ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {openSection === "prerequisites" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3.5 pb-4 text-xs text-slate-600 space-y-1.5 font-sans"
              >
                {prerequisites.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
