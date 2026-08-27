"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

interface ExamRecord {
  id: string;
  type: "oral" | "written";
  date: string;
  grade: string;
}

export function ExamHistoryDrawer({
  isOpen,
  onClose,
  userName = "Michael",
}: ExamHistoryDrawerProps) {
  const [filterTab, setFilterTab] = useState<"all" | "written" | "oral">("all");

  const exams: ExamRecord[] = [
    {
      id: "exam-1",
      type: "oral",
      date: "08/24/2026",
      grade: "C",
    },
  ];

  const filteredExams = exams.filter((ex) => {
    if (filterTab === "all") return true;
    return ex.type === filterTab;
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed right-6 top-14 bottom-6 z-40 w-[360px] sm:w-[390px] rounded-[28px] border border-slate-200/90 bg-white shadow-2xl flex flex-col p-6 space-y-4"
    >
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-slate-950 tracking-tight">
          Exam history
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Filter Tabs matching screenshot */}
      <div className="flex items-center gap-2 pt-1 border-b border-slate-100 pb-3">
        <button
          type="button"
          onClick={() => setFilterTab("all")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5",
            filterTab === "all"
              ? "bg-black text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <span>All</span>
          <span>1</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("written")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold font-mono transition cursor-pointer flex items-center gap-1.5",
            filterTab === "written"
              ? "bg-black text-white shadow-xs"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          )}
        >
          <span>Written</span>
          <span>0</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("oral")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold font-mono transition cursor-pointer flex items-center gap-1.5",
            filterTab === "oral"
              ? "bg-black text-white shadow-xs"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          )}
        >
          <span>Oral</span>
          <span>1</span>
        </button>
      </div>

      {/* Exam List Rows matching screenshot */}
      <div className="flex-1 overflow-y-auto space-y-2 pt-1 scrollbar-thin">
        {filteredExams.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/90 transition cursor-pointer group"
          >
            {/* Left: Type Icon + Date */}
            <div className="flex items-center gap-2.5">
              {ex.type === "oral" ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <MessageSquare className="h-3.5 w-3.5 fill-current" />
                </div>
              ) : (
                <span className="text-sm">✍️</span>
              )}
              <span className="text-xs font-bold text-slate-800 font-mono">
                {ex.date}
              </span>
            </div>

            {/* Right: Parchment 'C' Stamp Badge */}
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#FFF8E7] border border-[#FFE082] text-xs font-black text-amber-950 shadow-2xs">
              {ex.grade}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
