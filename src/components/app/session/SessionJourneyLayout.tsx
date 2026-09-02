"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  FolderClosed,
  FileText,
  Sliders,
  Award,
  ChevronDown,
  Info,
  ArrowUpRight,
  HelpCircle,
  PanelLeft,
  Edit2,
  Plus,
  Compass,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useApp } from "@/hooks/app/use-app-queries";
import { useBillingStatus } from "@/hooks/common/use-billing";
import { QUBI_WAVE_SRC } from "@/lib/constants";
import { Loader } from "@/components/common/loader";
import { ExercisesModal } from "./ExercisesModal";
import { ExamSimulatorModal } from "./ExamSimulatorModal";
import { toast } from "sonner";

interface SessionJourneyLayoutProps {
  children: ReactNode;
  sessionId: string;
}

export function SessionJourneyLayout({
  children,
  sessionId,
}: SessionJourneyLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { data: app, isLoading } = useApp(sessionId);
  const { data: billing } = useBillingStatus();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isExercisesModalOpen, setIsExercisesModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  const userName = user?.name || user?.email?.split("@")[0] || "Student";
  const courseTitle = app?.name || "Cryptography & System Security";

  if (isLoading) {
    return <Loader message="Preparing your study journey..." />;
  }

  const activityCount =
    (billing?.dailyUsage?.tutorSessions || 0) +
    (billing?.dailyUsage?.quizGenerations || 0);
  const uploadCount = billing?.dailyUsage?.materialUploads || 0;
  const isSubscribed = Boolean(billing?.isSubscribed);
  const planBadge = isSubscribed
    ? "PRO"
    : billing?.planTier
      ? billing.planTier.replace("_", " ").toUpperCase()
      : "FREE";

  const isJourney = pathname?.includes("/journey");
  const isContext = pathname?.includes("/context");
  const isOverview = pathname?.includes("/overview");
  const isCourseSummary = pathname?.includes("/course-summary");
  const isSummary = isCourseSummary || isOverview;
  const isStudySession = pathname?.includes("/session");
  const isSession = isStudySession;

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-[#FAF9F6] text-slate-900 antialiased font-sans"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 20%, rgba(240, 238, 233, 0.6) 0%, rgba(250, 249, 246, 0.95) 70%)",
      }}
    >
      {/* ─── Left Sidebar ─────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 236, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="h-full border-r border-slate-200/90 bg-white flex flex-col justify-between shrink-0 overflow-hidden z-30 select-none shadow-xs text-xs"
          >
            <div className="p-3.5 space-y-4 flex-1 overflow-y-auto scrollbar-none">
              {/* Brand Logo & Collapse Toggle with Animated Qubi */}
              <div className="flex items-center justify-between pt-0.5 px-0.5">
                <Link
                  href="/app"
                  aria-label="Qz home"
                  className="group cursor-pointer flex items-center gap-2 rounded-xl hover:opacity-90 transition"
                >
                  <div className="relative h-9 w-9 shrink-0 flex items-center justify-center">
                    <img
                      src={QUBI_WAVE_SRC}
                      alt="Qubi"
                      className="h-8 w-8 object-contain qubi-bob"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="hand text-base font-bold leading-none text-[#0C60FC]">
                      Qz
                    </p>
                    <p className="text-[9.5px] font-semibold text-slate-400 leading-tight mt-0.5">
                      Study Companion
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Collapse sidebar"
                >
                  <PanelLeft className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Course / User Selector Pill with Billing Tier Badge */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCourseDropdownOpen((v) => !v)}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex items-center justify-center rounded-full bg-blue-50 border border-blue-200/80 text-[#0C60FC] px-1.5 py-0.2 text-[9px] font-black tracking-wider shrink-0">
                      {planBadge}
                    </span>
                    <span className="truncate">{userName}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </button>

                <AnimatePresence>
                  {isCourseDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-lg space-y-2 text-xs"
                    >
                      <div>
                        <div className="px-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Current Course
                        </div>
                        <div className="px-2 py-1 mt-0.5 rounded-md bg-blue-50 text-[#0C60FC] font-semibold truncate text-[11.5px]">
                          {courseTitle}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-1.5 space-y-1">
                        <Link
                          href="/app/billing"
                          className="flex items-center justify-between px-1.5 py-1 rounded-md hover:bg-slate-50 text-slate-700 text-[11px] font-medium"
                        >
                          <span>Subscription & Billing</span>
                          <span className="text-[10px] text-[#0C60FC] font-bold">{planBadge}</span>
                        </Link>
                        <Link
                          href="/app/usage"
                          className="flex items-center justify-between px-1.5 py-1 rounded-md hover:bg-slate-50 text-slate-700 text-[11px] font-medium"
                        >
                          <span>Daily Usage</span>
                          <span className="text-[10px] text-slate-400">{activityCount} actions</span>
                        </Link>
                        <Link
                          href="/app"
                          className="block px-1.5 py-1 rounded-md hover:bg-slate-50 text-slate-500 text-[11px] transition"
                        >
                          ← All Courses & Sessions
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Main Navigation: Study plan, Sources, Summary */}
              <div className="space-y-0.5">
                <Link
                  href={`/study-session/${sessionId}/journey`}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition",
                    isJourney
                      ? "bg-[#F5F5F3] text-slate-950 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="h-4 w-4 text-slate-500" />
                    <span>Study plan</span>
                  </div>
                  <Edit2 className="h-3 w-3 text-slate-400 opacity-60 group-hover:opacity-100 transition" />
                </Link>

                <Link
                  href={`/study-session/${sessionId}/context`}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition",
                    isContext
                      ? "bg-[#F5F5F3] text-slate-950 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderClosed className="h-4 w-4 text-slate-500" />
                    <span>Sources</span>
                  </div>
                  <FileText className="h-3 w-3 text-slate-400 opacity-60 group-hover:opacity-100 transition" />
                </Link>

                <Link
                  href={`/study-session/${sessionId}/summary`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition",
                    isSummary
                      ? "bg-[#F5F5F3] text-slate-950 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span>Summary</span>
                </Link>
              </div>

              {/* Study Tools Section */}
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-400 px-1">
                  Study tools
                </p>

                <div className="space-y-1">
                  {/* Study session black pill button */}
                  <Link
                    href={`/study-session/${sessionId}/session`}
                    className={cn(
                      "flex items-center justify-between rounded-full px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer",
                      isSession
                        ? "bg-black text-white"
                        : "bg-black hover:bg-slate-800 text-white"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#52B32B]" fill="currentColor">
                        <path d="M12 2.5L14.8 5.3L12 8.1L9.2 5.3Z" />
                        <path d="M12 15.9L14.8 18.7L12 21.5L9.2 18.7Z" />
                        <path d="M5.3 9.2L8.1 12L5.3 14.8L2.5 12Z" />
                        <path d="M18.7 9.2L21.5 12L18.7 14.8L15.9 12Z" />
                      </svg>
                      <span>Study session</span>
                    </div>
                    <span className="text-xs text-slate-400">→</span>
                  </Link>

                  {/* Custom exercises modal trigger */}
                  <button
                    type="button"
                    onClick={() => setIsExercisesModalOpen(true)}
                    className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-left cursor-pointer"
                  >
                    <Sliders className="h-4 w-4 text-amber-500" />
                    <span>Custom exercises</span>
                  </button>

                  {/* Exam simulator modal trigger */}
                  <button
                    type="button"
                    onClick={() => setIsExamModalOpen(true)}
                    className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-left cursor-pointer"
                  >
                    <Award className="h-4 w-4 text-amber-600" />
                    <span>Exam</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Weekly Usage Limits Card */}
            <div className="p-3 m-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <Link
                href="/app/usage"
                className="flex items-center justify-between text-[11px] font-bold text-slate-800 hover:text-blue-600 transition"
              >
                <span>Your usage limits</span>
                <Info className="h-3 w-3 text-slate-400" />
              </Link>

              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {activityCount} Activity
                </span>
                <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {uploadCount} Uploaded pages
                </span>
              </div>

              {/* Action Button: Upgrade to Pro or Manage Subscription */}
              <button
                type="button"
                onClick={() => router.push(isSubscribed ? "/app/billing" : "/pricing")}
                className="w-full relative rounded-full p-[1.5px] bg-linear-to-r from-[#0C60FC] via-[#38BDF8] to-[#6366F1] hover:opacity-95 transition cursor-pointer shadow-2xs"
              >
                <div className="rounded-full bg-white py-1.5 px-3 flex items-center justify-center gap-1 text-xs font-bold text-slate-900">
                  <span>{isSubscribed ? "Manage Subscription" : "Upgrade to Pro"}</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-500" />
                </div>
              </button>

              <p className="text-[10px] text-center text-slate-400 font-medium">
                or{" "}
                <Link
                  href="/pricing"
                  className="underline hover:text-slate-700 cursor-pointer"
                >
                  view pricing & perks
                </Link>
                .
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── Main Content Canvas Area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Header */}
        {!isSidebarOpen && (
          <header className="h-12 px-6 flex items-center justify-between pointer-events-auto shrink-0 z-20">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
          </header>
        )}

        {/* Dynamic Page Canvas Body */}
        <main className="flex-1 min-h-0 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
          {children}
        </main>

        {/* Floating Bottom Right Controls matching Screenshot */}
        <div className="fixed bottom-5 right-6 z-40 flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => toast.success("Feedback recorded! Thanks.")}
            className="rounded-full bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white transition cursor-pointer flex items-center gap-1"
          >
            <span>Feedback</span>
            <Megaphone className="h-3 w-3 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => toast.info("Qz Study Help: Navigate your journey, inspect sources, and launch study sessions.")}
            className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm hover:text-slate-950 cursor-pointer font-bold text-xs"
            title="Help"
          >
            ?
          </button>

          <Link
            href={`/study-session/${sessionId}/session`}
            className="flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-1.5 shadow-sm hover:bg-white transition cursor-pointer"
          >
            <div className="h-4.5 w-4.5 rounded-full bg-linear-to-tr from-[#0C60FC] via-[#38BDF8] to-[#6366F1]" />
            <span className="text-xs font-bold text-slate-900">Chat</span>
          </Link>
        </div>
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────────── */}
      <ExercisesModal
        isOpen={isExercisesModalOpen}
        onClose={() => setIsExercisesModalOpen(false)}
        sessionId={sessionId}
      />

      <ExamSimulatorModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        sessionId={sessionId}
      />
    </div>
  );
}
