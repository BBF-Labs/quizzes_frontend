"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Mic,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamsViewProps {
  userName?: string;
  onStartWrittenExam: () => void;
  onStartOralExam: () => void;
  onSwitchToSession: () => void;
}

export function ExamsView({
  userName = "Student",
  onStartWrittenExam,
  onStartOralExam,
  onSwitchToSession,
}: ExamsViewProps) {
  const [activeTab, setActiveTab] = useState<"available" | "history">("available");

  const exams = [
    {
      id: "exam-1",
      title: "Foundations & Primality Number Theory Exam",
      type: "written",
      duration: "30 mins",
      questionsCount: 10,
      difficulty: "Medium",
      topics: ["AKS Primality Test", "Miller-Rabin Algorithm", "Modular Arithmetic", "RSA Key Generation"],
    },
    {
      id: "exam-2",
      title: "Oral Socratic Defense: Cryptographic Mechanics",
      type: "oral",
      duration: "15 mins",
      questionsCount: 4,
      difficulty: "Hard",
      topics: ["Cognitive Load Theory", "Spaced Retrieval", "Deterministic vs Probabilistic Tests"],
    },
  ];

  const pastExams = [
    {
      title: "Chapter 7 Modular Inverses Assessment",
      date: "2 days ago",
      score: "92%",
      grade: "A",
      type: "Written",
    },
    {
      title: "Oral Exam Simulation: Primality Primitives",
      date: "Last week",
      score: "88%",
      grade: "A-",
      type: "Oral",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 antialiased pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-normal text-slate-950">
            Exam &amp; Oral Simulations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Timed written exams and AI voice oral evaluations tailored to your curriculum.
          </p>
        </div>

        <button
          type="button"
          onClick={onSwitchToSession}
          className="rounded-full bg-slate-950 hover:bg-[#0C60FC] text-white px-4 py-2 text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5"
        >
          <span>Back to Session</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("available")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5",
            activeTab === "available"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Available Simulations ({exams.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5",
            activeTab === "history"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Past Results</span>
        </button>
      </div>

      {/* Main Content */}
      {activeTab === "available" ? (
        <div className="space-y-4">
          {/* Time For A Test Highlight Banner */}
          <div className="rounded-[32px] p-0.5 bg-linear-to-r from-[#8B5CF6] via-[#EC4899] to-[#8B5CF6] shadow-sm">
            <div className="rounded-[31px] bg-white p-6 sm:p-8 text-center space-y-4">
              <div className="flex justify-center">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF8E7] border border-[#FFE082] text-xs font-black text-amber-900 shadow-2xs">
                  C
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-serif text-slate-950 font-normal">
                  Ready for a live test, {userName}?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Put your knowledge to the test with real-time feedback and rubric scoring.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onStartWrittenExam}
                  className="rounded-full bg-slate-950 hover:bg-[#0C60FC] text-white px-5 py-2.5 text-xs font-bold shadow-md hover:scale-102 transition cursor-pointer flex items-center gap-2"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Start Written Exam (30m)</span>
                </button>

                <button
                  type="button"
                  onClick={onStartOralExam}
                  className="rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-5 py-2.5 text-xs font-bold shadow-2xs hover:scale-102 transition cursor-pointer flex items-center gap-2"
                >
                  <Mic className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Start Voice Oral Exam (15m)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Exam Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {exams.map((exam) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[28px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border",
                        exam.type === "written"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      )}
                    >
                      {exam.type === "written" ? "Written Exam" : "Oral Simulation"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {exam.duration}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {exam.title}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {exam.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={exam.type === "written" ? onStartWrittenExam : onStartOralExam}
                  className="w-full rounded-2xl bg-slate-900 hover:bg-[#0C60FC] text-white py-2.5 text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Begin Exam</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Past Exam Scores
          </h3>

          <div className="divide-y divide-slate-100">
            {pastExams.map((p, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{p.type} · {p.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600">{p.score}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1.5">({p.grade})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
