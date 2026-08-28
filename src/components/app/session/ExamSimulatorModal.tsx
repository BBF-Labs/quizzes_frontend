"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Edit3, MessageSquare, Presentation, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ExamSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function ExamSimulatorModal({
  isOpen,
  onClose,
  sessionId,
}: ExamSimulatorModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSelectMode = (modeName: string, promptText: string) => {
    onClose();
    toast.success(`Starting ${modeName} exam simulation…`);
    router.push(`/study-session/${sessionId}/session`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs"
        />

        {/* Modal Window matching screenshot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[460px] rounded-[30px] border border-slate-200/90 bg-white p-6 shadow-2xl space-y-4 select-none"
        >
          {/* Header matching screenshot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#FFF8E7] border border-[#FFE082] text-[10px] font-black text-amber-950 shadow-2xs">
                C
              </span>
              <h2 className="text-xl font-serif font-normal text-slate-950">
                Exam simulator
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Section Label: Modes */}
          <p className="text-[11px] font-semibold text-slate-400">
            Modes
          </p>

          {/* 3 Mode Option Cards matching screenshot */}
          <div className="space-y-2.5">
            {/* Written */}
            <button
              type="button"
              onClick={() =>
                handleSelectMode(
                  "Written",
                  "Start written exam simulation with multiple choice and open ended questions"
                )
              }
              className="w-full text-left rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50/80 p-4 transition shadow-2xs group cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs">✏️</span>
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#0C60FC] transition">
                  Written
                </span>
                <Info className="h-3 w-3 text-slate-400 ml-0.5" />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal pl-4.5">
                Test yourself on your course curriculum with a combination of multiple choice and open ended questions.
              </p>
            </button>

            {/* Curriculum */}
            <button
              type="button"
              onClick={() =>
                handleSelectMode(
                  "Curriculum Oral",
                  "Start Socratic oral exam simulation on course curriculum"
                )
              }
              className="w-full text-left rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50/80 p-4 transition shadow-2xs group cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs">💬</span>
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#0C60FC] transition">
                  Curriculum
                </span>
                <Info className="h-3 w-3 text-slate-400 ml-0.5" />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal pl-4.5">
                Test yourself on your course curriculum.
              </p>
            </button>

            {/* Project */}
            <button
              type="button"
              onClick={() =>
                handleSelectMode(
                  "Project Defense",
                  "Start project and thesis oral defense simulation"
                )
              }
              className="w-full text-left rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50/80 p-4 transition shadow-2xs group cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🗣️</span>
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#0C60FC] transition">
                  Project
                </span>
                <Info className="h-3 w-3 text-slate-400 ml-0.5" />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal pl-4.5">
                Present or defend your project or thesis.
              </p>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
