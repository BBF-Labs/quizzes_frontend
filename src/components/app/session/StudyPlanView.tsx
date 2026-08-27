"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Mic,
  CheckCircle2,
  Diamond,
  Compass,
  Trophy,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface StudyPlanViewProps {
  userName?: string;
  onSelectTopic?: (topic: string) => void;
  onStartWrittenExam?: () => void;
  onStartOralExam?: () => void;
  onContinueSession?: () => void;
}

export function StudyPlanView({
  userName = "Student",
  onSelectTopic,
  onStartWrittenExam,
  onStartOralExam,
  onContinueSession,
}: StudyPlanViewProps) {
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [expandedChapter2, setExpandedChapter2] = useState<boolean>(false);

  const knowledgeBlocks = [
    { title: "Spaced Repetition Strategy", status: "completed" },
    { title: "Chapter 8 review questions practice gcd & modular arithmetic", status: "completed" },
    { title: "Primality testing is needed to find large random primes", status: "current" },
    { title: "Optimizing Information Absorption", status: "upcoming" },
    { title: "Active Recall Mechanism", status: "completed" },
    { title: "The Miller-Rabin test quickly finds large random primes", status: "upcoming" },
    { title: "Metacognition in Learning", status: "upcoming" },
    { title: "Cognitive Load Theory Definition", status: "upcoming" },
    { title: "AKS is a deterministic primality test", status: "upcoming" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 antialiased">
      {/* Chapter 1 Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-slate-200/90 bg-white overflow-hidden shadow-lg shadow-slate-200/40"
      >
        {/* Top Header Tag Banner */}
        <div className="bg-linear-to-r from-orange-500 to-amber-500 px-6 py-2 flex items-center justify-between text-white">
          <span className="text-[11px] font-black uppercase tracking-wider">
            Recommended
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Chapter Title & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-800">
                  1
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  Foundations of Cognitive Learning
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl pl-8.5">
                Explore the mechanics of how we learn, including cognitive load theory, active recall, and spaced repetition to optimize information absorption.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center pl-8.5 sm:pl-0">
              <span className="text-xs font-extrabold text-slate-400 font-mono">
                2 / 9
              </span>
              <button
                type="button"
                onClick={onContinueSession}
                className="rounded-full bg-slate-950 hover:bg-[#0C60FC] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Compass className="h-3.5 w-3.5 text-emerald-600" />
                <span>Lessons · Step 1</span>
              </div>
              <span className="font-mono">2 / 9</span>
            </div>

            {/* Knowledge Blocks Grid */}
            <div className="space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Knowledge blocks
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {knowledgeBlocks.map((block, idx) => {
                  const isCurrent = block.status === "current";
                  const isCompleted = block.status === "completed";

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectTopic?.(block.title)}
                      className={cn(
                        "w-full text-left rounded-2xl p-3 sm:p-3.5 border transition-all flex items-center gap-3 cursor-pointer shadow-xs",
                        isCurrent
                          ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 text-slate-900"
                          : isCompleted
                          ? "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          : "bg-slate-50/60 border-slate-200/70 text-slate-400 hover:bg-white hover:text-slate-700"
                      )}
                    >
                      <span
                        className={cn(
                          "h-5 w-5 rounded-lg flex items-center justify-center shrink-0 text-xs",
                          isCurrent
                            ? "text-emerald-700 font-black"
                            : isCompleted
                            ? "text-emerald-600"
                            : "text-slate-400"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isCurrent ? (
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-ping" />
                        ) : (
                          <Diamond className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold truncate",
                          isCurrent && "font-bold text-slate-950",
                          isCompleted && "text-slate-800",
                          !isCurrent && !isCompleted && "text-slate-500"
                        )}
                      >
                        {block.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chapter 2 Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[28px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs"
      >
        <button
          type="button"
          onClick={() => setExpandedChapter2((p) => !p)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
              2
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Advanced Analysis and Applied Mastery
            </h3>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <span>Locked</span>
            {expandedChapter2 ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {expandedChapter2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed overflow-hidden"
            >
              Complete the knowledge blocks in Chapter 1 to unlock advanced simulation models and case study assessments.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Time For A Test Purple Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-[32px] bg-linear-to-br from-[#7C4DFF] via-[#651FFF] to-[#512DA8] p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20 text-center space-y-4 relative overflow-hidden"
      >
        {/* Glow orbs */}
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex justify-center">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-sm font-black text-amber-300 shadow-sm">
            C
          </span>
        </div>

        <div className="relative z-10 space-y-1">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Time for a test, {userName}
          </h3>
          <p className="text-xs sm:text-sm text-purple-100/90 max-w-md mx-auto leading-relaxed">
            Test yourself on oral and written exams simulations tailored to your curriculum.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onStartWrittenExam}
            className="rounded-full bg-white text-slate-950 hover:bg-purple-50 px-5 py-2.5 text-xs font-extrabold shadow-md hover:scale-102 transition cursor-pointer flex items-center gap-2"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span>Start written exam</span>
          </button>

          <button
            type="button"
            onClick={onStartOralExam}
            className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 px-5 py-2.5 text-xs font-extrabold shadow-sm hover:scale-102 transition cursor-pointer flex items-center gap-2"
          >
            <Mic className="h-3.5 w-3.5 text-amber-300" />
            <span>Start oral exam</span>
          </button>
        </div>

        <div className="relative z-10 pt-2">
          <button
            type="button"
            className="text-[11px] font-bold text-purple-200/70 hover:text-white hover:underline cursor-pointer"
          >
            See your past exams →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
