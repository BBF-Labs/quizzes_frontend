"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  ChevronDown,
  Edit3,
  HelpCircle,
  BookOpen,
  Layers,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ExercisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

type ExerciseType = "study-session" | "open-ended" | "multiple-choice" | "true-false" | "flashcards";
type ExerciseScope = "sources" | "sections" | "chapters";

export function ExercisesModal({
  isOpen,
  onClose,
  sessionId,
}: ExercisesModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ExerciseType>("study-session");
  const [selectedScope, setSelectedScope] = useState<ExerciseScope>("sources");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Chapter8_MoreNumberTheory.pdf");

  if (!isOpen) return null;

  const scopeOptions: Record<ExerciseScope, string[]> = {
    sources: [
      "Chapter8_MoreNumberTheory.pdf",
      "Cognitive_Load_Theory_Notes.pdf",
      "All Uploaded Sources (2)",
    ],
    sections: [
      "Section 1: Attention & Working Memory",
      "Section 2: Primality Testing Tools",
      "Section 3: Modular Arithmetic & GCD",
    ],
    chapters: [
      "Chapter 1: Foundations of Cognitive Learning",
      "Chapter 2: Advanced Analysis and Applied Mastery",
      "All Chapters (Full Course)",
    ],
  };

  const handleStart = () => {
    onClose();
    toast.success(`Starting ${selectedType.replace("-", " ")} on ${selectedItem}`);
    const params = new URLSearchParams({
      exerciseType: selectedType,
      scope: selectedScope,
      item: selectedItem,
    });
    router.push(`/study-session/${sessionId}/session?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with blur matching screenshot */}
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
          className="relative z-10 w-full max-w-[480px] rounded-[30px] border border-slate-200/90 bg-white p-6 shadow-2xl space-y-5 select-none"
        >
          {/* Header with Title and Close Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-slate-950">
              Exercises
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Exercise Types Grid matching Screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
            {/* Left Big Card: Study Session */}
            <button
              type="button"
              onClick={() => setSelectedType("study-session")}
              className={cn(
                "sm:col-span-5 rounded-2xl border p-4 flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer",
                selectedType === "study-session"
                  ? "border-slate-900 bg-slate-50/70 text-slate-950 shadow-2xs"
                  : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300"
              )}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#52B32B]" fill="currentColor">
                <path d="M12 2.5L14.8 5.3L12 8.1L9.2 5.3Z" />
                <path d="M12 15.9L14.8 18.7L12 21.5L9.2 18.7Z" />
                <path d="M5.3 9.2L8.1 12L5.3 14.8L2.5 12Z" />
                <path d="M18.7 9.2L21.5 12L18.7 14.8L15.9 12Z" />
              </svg>
              <span>Study session</span>
            </button>

            {/* Right 2x2 Grid of Exercise Pill Buttons */}
            <div className="sm:col-span-7 grid grid-cols-2 gap-2">
              {/* Open-ended */}
              <button
                type="button"
                onClick={() => setSelectedType("open-ended")}
                className={cn(
                  "rounded-full border px-3 py-2 text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer",
                  selectedType === "open-ended"
                    ? "border-slate-900 bg-slate-50 text-slate-950 font-bold"
                    : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300"
                )}
              >
                <span className="text-orange-500 text-xs">📝</span>
                <span className="truncate">Open-ended</span>
              </button>

              {/* Multiple choice */}
              <button
                type="button"
                onClick={() => setSelectedType("multiple-choice")}
                className={cn(
                  "rounded-full border px-3 py-2 text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer",
                  selectedType === "multiple-choice"
                    ? "border-slate-900 bg-slate-50 text-slate-950 font-bold"
                    : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300"
                )}
              >
                <span className="text-blue-500 text-xs">❓</span>
                <span className="truncate">Multiple choice</span>
              </button>

              {/* True / false */}
              <button
                type="button"
                onClick={() => setSelectedType("true-false")}
                className={cn(
                  "rounded-full border px-3 py-2 text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer",
                  selectedType === "true-false"
                    ? "border-slate-900 bg-slate-50 text-slate-950 font-bold"
                    : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300"
                )}
              >
                <span className="text-pink-500 text-xs">📖</span>
                <span className="truncate">True / false</span>
              </button>

              {/* Flashcards */}
              <button
                type="button"
                onClick={() => setSelectedType("flashcards")}
                className={cn(
                  "rounded-full border px-3 py-2 text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer",
                  selectedType === "flashcards"
                    ? "border-slate-900 bg-slate-50 text-slate-950 font-bold"
                    : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300"
                )}
              >
                <span className="text-emerald-500 text-xs">🗂️</span>
                <span className="truncate">Flashcards</span>
              </button>
            </div>
          </div>

          {/* Scope Segmented Tabs matching Screenshot */}
          <div className="rounded-full bg-slate-100/90 p-1 flex items-center justify-between border border-slate-200/60 text-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedScope("sources");
                setSelectedItem(scopeOptions.sources[0]);
              }}
              className={cn(
                "flex-1 rounded-full py-1.5 text-center font-semibold transition cursor-pointer text-xs",
                selectedScope === "sources"
                  ? "bg-white text-slate-950 font-bold shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Sources
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedScope("sections");
                setSelectedItem(scopeOptions.sections[0]);
              }}
              className={cn(
                "flex-1 rounded-full py-1.5 text-center font-semibold transition cursor-pointer text-xs",
                selectedScope === "sections"
                  ? "bg-white text-slate-950 font-bold shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Course sections
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedScope("chapters");
                setSelectedItem(scopeOptions.chapters[0]);
              }}
              className={cn(
                "flex-1 rounded-full py-1.5 text-center font-semibold transition cursor-pointer text-xs",
                selectedScope === "chapters"
                  ? "bg-white text-slate-950 font-bold shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Chapters
            </button>
          </div>

          {/* Dropdown Selector matching "Select 1 ⌵" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="w-full rounded-2xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-400">Select</span>
                <span className="font-bold text-slate-950 truncate">{selectedItem}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 right-0 mt-1 z-30 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl space-y-0.5 text-xs max-h-48 overflow-y-auto"
                >
                  {scopeOptions[selectedScope].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedItem(opt);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between text-xs cursor-pointer",
                        selectedItem === opt
                          ? "bg-slate-100 font-bold text-slate-950"
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span className="truncate">{opt}</span>
                      {selectedItem === opt && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Action Button matching "Start →" */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="rounded-full bg-slate-900 hover:bg-slate-950 px-6 py-2 text-xs font-bold text-white shadow-xs hover:scale-102 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Start</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
