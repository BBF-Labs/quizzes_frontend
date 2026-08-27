"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Mic,
  CheckCircle2,
  Diamond,
  Compass,
  RotateCcw,
  Edit2,
  LayoutGrid,
  List,
  Sparkles,
  Maximize2,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface StudyPlanViewProps {
  userName?: string;
  onSelectTopic?: (topic: string) => void;
  onStartWrittenExam?: () => void;
  onStartOralExam?: () => void;
  onContinueSession?: () => void;
  onSwitchToChat?: () => void;
}

export function StudyPlanView({
  userName = "Student",
  onSelectTopic,
  onStartWrittenExam,
  onStartOralExam,
  onContinueSession,
  onSwitchToChat,
}: StudyPlanViewProps) {
  const [isLessonsExpanded, setIsLessonsExpanded] = useState<boolean>(true);
  const [expandedChapter2, setExpandedChapter2] = useState<boolean>(false);

  const knowledgeBlocks = [
    { title: "Spaced Repetition Strategy", status: "completed" },
    { title: "Chapter 8 review questions practice gcd & modular arithmetic", status: "completed" },
    { title: "Primality testing is needed to find large random primes", status: "completed" },
    { title: "Optimizing Information Absorption", status: "current" },
    { title: "Active Recall Mechanism", status: "upcoming" },
    { title: "The Miller-Rabin test quickly finds large random primes", status: "upcoming" },
    { title: "Metacognition in Learning", status: "upcoming" },
    { title: "Cognitive Load Theory Definition", status: "upcoming" },
    { title: "AKS is a deterministic primality test", status: "upcoming" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 antialiased pb-24">
      {/* Top Header Row matching Image 1 & 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950">
              Study plan
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              3/17
              <Diamond className="h-3 w-3 fill-emerald-500 text-emerald-500" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">2 chapters</p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onContinueSession}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Update</span>
          </button>

          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/60">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-900 shadow-2xs cursor-pointer"
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chapter 1 Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-slate-200/90 bg-white overflow-hidden shadow-sm"
      >
        {/* Recommended Pill Tag */}
        <div className="bg-linear-to-r from-[#FF6B35] via-[#FF5722] to-[#F4511E] px-6 py-2 flex items-center justify-between text-white">
          <span className="text-[11px] font-extrabold uppercase tracking-wider">
            Recommended
          </span>
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Chapter Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                  1
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-950">
                  Foundations of Cognitive Learning
                </h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl pl-8.5">
                Explore the mechanics of how we learn, including cognitive load theory, active recall, and spaced repetition to optimize information absorption.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center pl-8.5 sm:pl-0">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 font-mono">
                3 / 9
                <Diamond className="h-3 w-3 fill-emerald-500 text-emerald-500" />
              </span>
              <button
                type="button"
                onClick={onContinueSession}
                className="rounded-full bg-slate-950 hover:bg-[#0C60FC] px-5 py-2 text-xs font-bold text-white shadow-sm hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Lessons Expandable Row matching Image 1 & 2 */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <button
              type="button"
              onClick={() => setIsLessonsExpanded((p) => !p)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 transition cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#52B32B]" fill="currentColor">
                  <path d="M12 2.5L14.8 5.3L12 8.1L9.2 5.3Z" />
                  <path d="M12 15.9L14.8 18.7L12 21.5L9.2 18.7Z" />
                  <path d="M5.3 9.2L8.1 12L5.3 14.8L2.5 12Z" />
                  <path d="M18.7 9.2L21.5 12L18.7 14.8L15.9 12Z" />
                </svg>
                <span>Lessons</span>
                <span className="text-slate-400 font-normal">·</span>
                <span className="font-semibold text-slate-900">Step 1</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 font-mono">
                  3 / 9
                  <Diamond className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
                </span>
                <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </button>

            {/* Expandable Knowledge Blocks List */}
            <AnimatePresence>
              {isLessonsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden pt-1"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {knowledgeBlocks.map((block, idx) => {
                      const isCurrent = block.status === "current";
                      const isCompleted = block.status === "completed";

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            onSelectTopic?.(block.title);
                            onContinueSession?.();
                          }}
                          className={cn(
                            "w-full text-left rounded-2xl p-3 border transition-all flex items-center gap-2.5 cursor-pointer",
                            isCurrent
                              ? "bg-emerald-50/70 border-emerald-300 text-slate-950 font-bold shadow-xs"
                              : isCompleted
                              ? "bg-white border-slate-200/80 text-slate-700 hover:border-slate-300"
                              : "bg-slate-50/50 border-slate-200/60 text-slate-400 hover:text-slate-700"
                          )}
                        >
                          <span
                            className={cn(
                              "h-5 w-5 rounded-lg flex items-center justify-center shrink-0 text-xs",
                              isCurrent
                                ? "text-emerald-700"
                                : isCompleted
                                ? "text-emerald-600"
                                : "text-slate-400"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : isCurrent ? (
                              <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                            ) : (
                              <Diamond className="h-3 w-3" />
                            )}
                          </span>
                          <span className="text-xs truncate">{block.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Chapter 2 Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-[28px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs"
      >
        <button
          type="button"
          onClick={() => setExpandedChapter2((p) => !p)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              2
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Advanced Analysis and Applied Mastery
            </h3>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
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
              Complete Chapter 1 knowledge blocks to unlock advanced applied mastery modules.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Time For A Test Card matching Image 1 & 2 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[32px] p-0.5 bg-linear-to-r from-[#8B5CF6] via-[#EC4899] to-[#8B5CF6] shadow-sm"
      >
        <div className="rounded-[31px] bg-white p-6 sm:p-8 text-center space-y-4">
          {/* Parchment 'C' Badge */}
          <div className="flex justify-center">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF8E7] border border-[#FFE082] text-xs font-black text-amber-900 shadow-2xs">
              C
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-serif text-slate-950 font-normal">
              Time for a test, {userName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Test yourself on oral and written exams simulations.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onStartWrittenExam}
              className="rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:scale-102 transition cursor-pointer flex items-center gap-2"
            >
              <FileText className="h-3.5 w-3.5 text-slate-600" />
              <span>Start written exam</span>
              <RotateCcw className="h-3 w-3 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={onStartOralExam}
              className="rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:scale-102 transition cursor-pointer flex items-center gap-2"
            >
              <Mic className="h-3.5 w-3.5 text-indigo-600" />
              <span>Start oral exam</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-700 hover:underline cursor-pointer"
            >
              See your past exams
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating Bottom Right Controls matching Image 1 & 2 */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => alert("Feedback sent!")}
          className="rounded-full bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-white transition cursor-pointer"
        >
          Feedback
        </button>

        <button
          type="button"
          className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm hover:text-slate-800 cursor-pointer"
          title="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onSwitchToChat}
          className="flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-1.5 shadow-sm hover:bg-white transition cursor-pointer"
        >
          <div className="h-5 w-5 rounded-full bg-linear-to-tr from-[#FF5722] via-[#E91E63] to-[#3F51B5]" />
          <span className="text-xs font-bold text-slate-800">Chat</span>
        </button>
      </div>
    </div>
  );
}
