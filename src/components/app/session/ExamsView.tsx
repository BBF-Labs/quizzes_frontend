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
import { useApp } from "@/hooks/app/use-app-queries";

interface ExamsViewProps {
  sessionId?: string;
  userName?: string;
  onStartWrittenExam: () => void;
  onStartOralExam: () => void;
  onSwitchToSession: () => void;
}

export function ExamsView({
  sessionId,
  userName = "Student",
  onStartWrittenExam,
  onStartOralExam,
  onSwitchToSession,
}: ExamsViewProps) {
  const [activeTab, setActiveTab] = useState<"available" | "history">("available");
  const { data: app } = useApp(sessionId || "");

  // Extract quizzes and test artifacts from session
  const examArtifacts = (app?.artifacts || []).filter(
    (a) => a.type === "quiz" || a.type === "exam" || a.type === "simulation"
  );

  const chapters = app?.studyPlan?.chapters || [];

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
          <span>Available Simulations ({chapters.length > 0 ? chapters.length : 2})</span>
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
          <span>Past Results ({examArtifacts.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === "available" ? (
        <div className="space-y-4">
          {/* Written Exam Simulation Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Written Exam
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">10 Questions &bull; 30 Mins</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Comprehensive Course Final Simulation
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Rigorous multiple-choice and short-answer assessment covering active knowledge blocks and conceptual frameworks.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50/70 p-3 text-blue-600 shrink-0">
                <FileText className="h-6 w-6" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Adaptive Grading Enabled</span>
              <button
                type="button"
                onClick={onStartWrittenExam}
                className="rounded-full bg-slate-900 hover:bg-blue-600 text-white px-4 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch Written Exam</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>

          {/* Oral Socratic Defense Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-purple-200/80 bg-linear-to-br from-purple-50/40 to-white p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    Oral Socratic
                  </span>
                  <span className="text-[11px] text-purple-600 font-mono">4 Defense Rounds &bull; 15 Mins</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Interactive Socratic Oral Defense
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time voice evaluation where Z probes your conceptual depth, asks follow-up questions, and tests your critical reasoning.
                </p>
              </div>

              <div className="rounded-xl bg-purple-100 p-3 text-purple-600 shrink-0">
                <Mic className="h-6 w-6" />
              </div>
            </div>

            <div className="pt-2 border-t border-purple-100/70 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Real-time Voice AI</span>
              <button
                type="button"
                onClick={onStartOralExam}
                className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch Oral Exam</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-3">
          {examArtifacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
              <Trophy className="h-8 w-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No completed exams yet</h3>
              <p className="text-xs text-slate-400">
                Start a written or oral exam simulation to see your scores and feedback history here.
              </p>
            </div>
          ) : (
            examArtifacts.map((artifact, idx) => (
              <div
                key={artifact.artifactId || idx}
                className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{artifact.title}</span>
                    <span className="rounded-md bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px] font-bold">
                      Completed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {new Date(artifact.updatedAt || artifact.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSwitchToSession}
                    className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 text-xs font-medium transition cursor-pointer"
                  >
                    View in Chat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
