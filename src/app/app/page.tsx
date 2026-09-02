"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  FileText,
  Flame,
  Layers,
  ListChecks,
  MessageSquare,
  Network,
  Plus,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Users,
  Compass,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  useCreateSession,
  useStreakStatus,
  useDashboard,
} from "@/hooks";
import { toast } from "sonner";

function getGreeting(name: string): string {
  const now = new Date();
  const hour = now.getHours();
  const first = name?.split(" ")[0] || "there";

  if (hour >= 5 && hour < 12) return `Good morning, ${first}.`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${first}.`;
  if (hour >= 17 && hour < 21) return `Good evening, ${first}.`;
  return `Quiet hours, ${first}. 🦉`;
}

function getFormattedDate(): string {
  const now = new Date();
  return format(now, "EEEE, d MMMM");
}

export default function AppHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: streak } = useStreakStatus();
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isError: dashboardError,
    refetch: refetchDashboard,
  } = useDashboard();
  const createSession = useCreateSession();

  const [promptInput, setPromptInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const greeting = getGreeting(user?.name ?? "");
  const formattedDate = getFormattedDate();

  const courses = dashboard?.courses.slice(0, 3) ?? [];
  const recentWork = dashboard?.recentWork ?? [];
  const brief = dashboard?.todaysBrief;
  const nextExam = dashboard?.nextExam ?? null;

  const briefItems: { title: string; sub: string }[] = [];
  if (brief) {
    if (brief.sessions.count > 0) {
      briefItems.push({
        title: `${brief.sessions.count} ${brief.sessions.count === 1 ? "session" : "sessions"} · ${brief.sessions.totalMinutes} min`,
        sub: "Recent study activity",
      });
    }
    if (brief.flashcards.reviewedCount > 0) {
      briefItems.push({
        title: `${brief.flashcards.reviewedCount} cards reviewed${
          brief.flashcards.averageMastery != null
            ? ` · avg mastery ${brief.flashcards.averageMastery}`
            : ""
        }`,
        sub:
          brief.flashcards.weakCount > 0
            ? `${brief.flashcards.weakCount} weak ${brief.flashcards.weakCount === 1 ? "card" : "cards"} to revisit`
            : "Flashcard review",
      });
    }
    if (brief.quizzes.attemptedCount > 0) {
      briefItems.push({
        title: `${brief.quizzes.attemptedCount} ${brief.quizzes.attemptedCount === 1 ? "quiz" : "quizzes"} attempted${
          brief.quizzes.averageScore != null
            ? ` · avg ${brief.quizzes.averageScore}%`
            : ""
        }`,
        sub: "Personal quizzes",
      });
    }
    if (brief.exams.upcomingCount > 0) {
      briefItems.push({
        title: `${brief.exams.upcomingCount} upcoming ${brief.exams.upcomingCount === 1 ? "exam" : "exams"}`,
        sub:
          brief.exams.daysToNext != null
            ? `Next in ${brief.exams.daysToNext} ${brief.exams.daysToNext === 1 ? "day" : "days"}`
            : "Check your timetable",
      });
    }
  }

  const handleStartSession = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isCreating) return;

    setIsCreating(true);
    try {
      const session = await createSession.mutateAsync({
        mode: "structured",
      });
      const resolvedId = session?.id || (session as { _id?: string })?._id;
      if (!resolvedId) throw new Error("Invalid session ID returned");

      if (promptInput.trim()) {
        sessionStorage.setItem(`qz_first_msg_${resolvedId}`, promptInput.trim());
      }
      toast.success("Session created! Entering study plan...");
      router.push(`/study-session/${resolvedId}/journey`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create study session.");
      setIsCreating(false);
    }
  };

  return (
    <div className="dash-grid min-h-screen px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12 text-slate-900 bg-[#F7F9FC]">
      <div className="mx-auto max-w-310">
        {/* Header Hero Section */}
        <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#0C60FC] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Your study path is updated
            </div>
            <h1 className="mt-4 display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {greeting}
            </h1>
            <p className="hand mt-1 text-2xl text-[#0C60FC]">let's make this one count ✦</p>
          </div>

          <div className="max-w-sm text-xs leading-5 text-slate-500 sm:text-right">
            <p className="font-semibold text-slate-700">{formattedDate}</p>
            <p className="mt-0.5">
              You have <b className="text-slate-900 font-bold">3 useful hours</b> before your next class.
            </p>
          </div>
        </section>

        {/* Primary Row: Next Best Move Card + Weekly Goal Widget */}
        <section className="grid gap-4 xl:grid-cols-[1.45fr_.75fr] items-stretch">
          {/* Next Best Move Card */}
          <div className="relative overflow-hidden rounded-[30px] bg-[#0C60FC] p-6 text-white shadow-xl shadow-blue-200/50 sm:p-8 flex flex-col justify-between h-full">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#DFFF61]/25 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-white">
                  Your next best move
                </span>
                <span className="rounded-full bg-[#DFFF61] px-3 py-1.5 text-[10px] font-extrabold text-slate-950">
                  14 min
                </span>
              </div>

              <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs font-bold text-blue-200">DCIT 205 · Algorithms</p>
                  <h2 className="mt-2 max-w-xl text-3xl font-bold leading-tight sm:text-4xl text-white">
                    Tighten up Big-O before moving on.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100">
                    You’re close. Six targeted questions will repair the two patterns you missed yesterday.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => handleStartSession()}
                      disabled={isCreating}
                      className="rounded-2xl bg-white px-5 py-3.5 text-center text-xs font-extrabold text-[#0C60FC] hover:bg-blue-50 transition"
                    >
                      {isCreating ? "Starting session..." : "Start quick quiz →"}
                    </button>
                    <Link
                      href="/app/library"
                      className="rounded-2xl border border-white/20 px-5 py-3.5 text-center text-xs font-extrabold text-white hover:bg-white/10 transition"
                    >
                      Review lesson
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-950/35 p-3 backdrop-blur-md">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DFFF61] text-2xl">
                    🦊
                  </span>
                  <div>
                    <p className="hand text-xl text-[#DFFF61]">you've got this!</p>
                    <p className="text-[10px] text-blue-100 font-semibold">Qz picked this for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Goal Widget */}
          <aside className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                    Weekly goal
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">4.1 of 5 hours</h2>
                </div>
                <span className="text-sm font-extrabold text-[#0C60FC]">82%</span>
              </div>

              <div className="mt-6 flex justify-center">
                <div
                  className="relative flex h-32 w-32 items-center justify-center rounded-full"
                  style={{
                    background:
                      "conic-gradient(#0C60FC 0 82%, #E8EDF5 82%)",
                  }}
                >
                  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                    <b className="text-2xl font-extrabold text-slate-950">49m</b>
                    <span className="text-[9px] font-bold uppercase text-slate-400">
                      to go
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#E9FFD3] p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-lime-800">
                On track
              </p>
              <p className="mt-1 text-xs font-bold text-slate-900">
                One focused session completes your week.
              </p>
            </div>
          </aside>
        </section>

        {dashboardError && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-xs font-bold text-rose-700">
              Couldn&apos;t load your dashboard.
            </p>
            <button
              onClick={() => refetchDashboard()}
              className="rounded-xl bg-rose-600 px-3 py-1.5 text-[10px] font-extrabold text-white transition hover:bg-rose-500"
            >
              Retry
            </button>
          </div>
        )}

        {/* Secondary Row: Desk Tools + My Courses + Recent Work + Brief Sidebar */}
        <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_330px]">
          {/* Main Area */}
          <div className="space-y-4">
            {/* Desk Tool Grid */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                    Desk
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Everything you need, right here.
                  </h2>
                </div>
                <Link href="/app/library" className="text-[10px] font-extrabold text-[#0C60FC] hover:underline">
                  Open all tools →
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Link
                  href="/app/all"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0C60FC]">
                    <MessageSquare className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Sessions</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">Resume or begin</p>
                </Link>

                <Link
                  href="/app/library"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <BookOpen className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Library</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">Notes &amp; decks</p>
                </Link>

                <Link
                  href="/app/flashcards"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Layers className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Flashcards</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">25 due today</p>
                </Link>

                <Link
                  href="/app/quizzes"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ListChecks className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Quizzes</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">Test a topic</p>
                </Link>

                <Link
                  href="/app/mindmaps"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Network className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Mind maps</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">See connections</p>
                </Link>

                <Link
                  href="/app/notes"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <FileText className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Notes</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">Write &amp; organise</p>
                </Link>

                <Link
                  href="/study-rooms"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-50 text-lime-600">
                    <Users className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Study rooms</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">8 people live</p>
                </Link>

                <Link
                  href="/app/timetable"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <CalendarDays className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Timetable</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">4 classes today</p>
                </Link>
              </div>
            </div>

            {/* Courses & Recent Work Side-by-side */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* My Courses */}
              <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-950">My courses</h2>
                  <Link href="/app/library" className="text-[10px] font-extrabold text-[#0C60FC] hover:underline">
                    View all
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {dashboardLoading && !dashboard ? (
                    [0, 1, 2].map((i) => (
                      <div key={i} className="rounded-2xl bg-[#F7F9FC] p-3">
                        <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-slate-200" />
                        <div className="mt-3 h-1.5 animate-pulse rounded-full bg-slate-200" />
                      </div>
                    ))
                  ) : courses.length > 0 ? (
                    courses.map((course, idx) => {
                      const color =
                        idx === 0
                          ? "bg-[#0C60FC]"
                          : idx === 1
                          ? "bg-violet-500"
                          : "bg-amber-400";
                      return (
                        <div key={course.courseId} className="rounded-2xl bg-[#F7F9FC] p-3">
                          <div className="flex justify-between gap-2 text-[11px] font-bold text-slate-950">
                            <span className="truncate">
                              {course.code} · {course.title}
                            </span>
                            <span>
                              {course.progressPercent != null
                                ? `${course.progressPercent}%`
                                : "—"}
                            </span>
                          </div>
                          {course.progressPercent != null ? (
                            <>
                              <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                                <div
                                  className={`h-full rounded-full ${color}`}
                                  style={{ width: `${course.progressPercent}%` }}
                                />
                              </div>
                              {course.daysToExam != null && (
                                <p className="mt-1.5 text-[9px] font-semibold text-slate-400">
                                  {course.daysToExam}d to {course.examType} exam
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="mt-1.5 text-[9px] font-semibold text-slate-400">
                              No exam scheduled
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : dashboardError ? (
                    <p className="rounded-2xl bg-[#F7F9FC] p-3 text-[11px] font-semibold text-slate-400">
                      Courses unavailable right now.
                    </p>
                  ) : (
                    <p className="rounded-2xl bg-[#F7F9FC] p-3 text-[11px] font-semibold text-slate-400">
                      No enrolled courses yet.{" "}
                      <Link
                        href="/app/library"
                        className="font-extrabold text-[#0C60FC] hover:underline"
                      >
                        Browse the library
                      </Link>{" "}
                      to add one.
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Work */}
              <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-950">Recent work</h2>
                  <Link href="/app/all" className="text-[10px] font-extrabold text-slate-400 hover:text-slate-600">
                    View all
                  </Link>
                </div>
                <div className="mt-4 divide-y divide-slate-100">
                  {dashboardLoading && !dashboard ? (
                    [0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3 py-3">
                        <span className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-slate-100" />
                          <div className="h-2 w-1/3 animate-pulse rounded-full bg-slate-100" />
                        </div>
                      </div>
                    ))
                  ) : recentWork.length > 0 ? (
                    recentWork.map((item, idx) => {
                      const TypeIcon =
                        [MessageSquare, ListChecks, Layers, FileText][idx] ??
                        MessageSquare;
                      const tint =
                        idx === 0
                          ? "bg-blue-50 text-[#0C60FC]"
                          : idx === 1
                          ? "bg-violet-50 text-violet-600"
                          : idx === 2
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600";
                      return (
                        <Link
                          key={item.id}
                          href={`/study-session/${item.id}/journey`}
                          className="flex items-center gap-3 py-3 hover:bg-slate-50 rounded-xl px-1 transition"
                        >
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}
                          >
                            <TypeIcon className="h-4 w-4" strokeWidth={2.25} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-bold text-slate-950">
                              {item.displayName}
                            </p>
                            <p className="text-[9px] text-slate-400 font-semibold">
                              {item.courseCode ?? "Session"} ·{" "}
                              {formatDistanceToNow(new Date(item.updatedAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <span className="ml-auto text-xs font-bold text-slate-300">
                            →
                          </span>
                        </Link>
                      );
                    })
                  ) : dashboardError ? (
                    <p className="py-3 text-[11px] font-semibold text-slate-400">
                      Recent sessions unavailable right now.
                    </p>
                  ) : (
                    <div className="py-3">
                      <p className="text-[11px] font-semibold text-slate-400">
                        No recent sessions yet.
                      </p>
                      <button
                        onClick={() => handleStartSession()}
                        disabled={isCreating}
                        className="mt-2 rounded-xl bg-[#0C60FC] px-3 py-2 text-[10px] font-extrabold text-white hover:bg-blue-600 transition"
                      >
                        {isCreating ? "Starting..." : "Start a session →"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column: Today's Brief + Next Exam */}
          <aside className="flex flex-col justify-between space-y-4 h-full">
            {/* Today's Brief */}
            <div className="flex-1 flex flex-col justify-between rounded-[28px] border border-slate-200 bg-[#FFFDF8] p-5 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-amber-700">
                    Today's brief
                  </p>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-xs shadow-sm font-bold">
                    i
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-950">
                  A calm plan for the rest of your day.
                </h2>
                <div className="mt-5 space-y-3">
                  {dashboardLoading && !dashboard ? (
                    [0, 1, 2].map((i) => (
                      <div key={i} className="flex gap-3">
                        <span className="mt-1 h-5 w-5 shrink-0 animate-pulse rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-slate-200" />
                          <div className="h-2 w-1/2 animate-pulse rounded-full bg-slate-200" />
                        </div>
                      </div>
                    ))
                  ) : briefItems.length > 0 ? (
                    briefItems.map((item, idx) => {
                      const badge =
                        [
                          "bg-[#0C60FC] text-white",
                          "bg-violet-500 text-white",
                          "bg-amber-400 text-slate-900",
                          "bg-emerald-500 text-white",
                        ][idx] ?? "bg-slate-200 text-slate-700";
                      return (
                        <div key={idx} className="flex gap-3">
                          <span
                            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${badge}`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{item.title}</p>
                            <p className="mt-1 text-[10px] leading-4 text-slate-500 font-semibold">
                              {item.sub}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs font-semibold text-slate-500">
                      No activity yet — start a session to build your streak.
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleStartSession()}
                className="mt-6 w-full rounded-xl bg-slate-950 py-3 text-xs font-extrabold text-white hover:bg-[#0C60FC] transition"
              >
                Add plan to today →
              </button>
            </div>

            {/* Next Exam Widget */}
            <div className="rounded-[28px] bg-[#131B27] p-5 text-white shadow-xl mt-auto">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-blue-300">
                  Next exam
                </p>
                {nextExam ? (
                  <span className="rounded-full bg-rose-400/15 px-2 py-1 text-[9px] font-bold text-rose-300">
                    {nextExam.daysLeft} {nextExam.daysLeft === 1 ? "day" : "days"}
                  </span>
                ) : (
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold text-slate-400">
                    —
                  </span>
                )}
              </div>

              {dashboardLoading && !dashboard ? (
                <div className="mt-5 space-y-3">
                  <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/10" />
                  <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-white/10" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-white/10" />
                </div>
              ) : nextExam ? (
                <>
                  <h2 className="mt-5 text-xl font-bold text-white">
                    {nextExam.courseCode}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    {nextExam.courseName} · {nextExam.venue ?? "Venue TBA"}
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <span className="rounded-full bg-[#0C60FC] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                      {nextExam.examType}
                    </span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">Scheduled for</p>
                      <p className="text-xs font-bold text-white">
                        {format(new Date(nextExam.scheduledAt), "EEE, d MMM · h:mm a")}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mt-5 text-xl font-bold text-white">No upcoming exams</h2>
                  <p className="text-xs text-slate-400 font-medium">
                    You&apos;re clear for now.
                  </p>
                </>
              )}

              <Link
                href="/app/timetable"
                className="mt-5 block rounded-xl bg-white/10 py-3 text-center text-[10px] font-extrabold text-[#DFFF61] hover:bg-white/20 transition"
              >
                Open my timetable →
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
