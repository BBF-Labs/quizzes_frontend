"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock3,
  FileText,
  Flame,
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
  useSessions,
  useCreateSession,
  useStreakStatus,
} from "@/hooks";
import { useMyCourses } from "@/hooks/app/use-user-courses";
import { useMyTimetable } from "@/hooks/app/use-timetable";
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
  return now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function AppHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: streak } = useStreakStatus();
  const { data: enrollments = [] } = useMyCourses();
  const createSession = useCreateSession();

  const [promptInput, setPromptInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const greeting = getGreeting(user?.name ?? "");
  const formattedDate = getFormattedDate();
  const recentSessions = sessions.slice(0, 4);

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
      toast.success("Session created! Entering studio...");
      router.push(`/app/${resolvedId}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create study session.");
      setIsCreating(false);
    }
  };

  return (
    <div className="dash-grid min-h-screen px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12 text-slate-900 bg-[#F7F9FC]">
      <div className="mx-auto max-w-[1240px]">
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
        <section className="grid gap-4 xl:grid-cols-[1.45fr_.75fr]">
          {/* Next Best Move Card */}
          <div className="relative overflow-hidden rounded-[30px] bg-[#0C60FC] p-6 text-white shadow-xl shadow-blue-200/50 sm:p-8">
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
          <aside className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 flex flex-col justify-between">
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
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                    ◫
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Sessions</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">Resume or begin</p>
                </Link>

                <Link
                  href="/app/library"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg">
                    ▦
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Library</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">Notes &amp; decks</p>
                </Link>

                <Link
                  href="/app/flashcards"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
                    ◷
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Flashcards</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">25 due today</p>
                </Link>

                <Link
                  href="/app/quizzes"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                    ✓
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Quizzes</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">Test a topic</p>
                </Link>

                <Link
                  href="/app/mindmaps"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-lg">
                    ⌘
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Mind maps</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">See connections</p>
                </Link>

                <Link
                  href="/app/notes"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-lg">
                    ▤
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Notes</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">Write &amp; organise</p>
                </Link>

                <Link
                  href="/study-rooms"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-50 text-lg">
                    ◉
                  </span>
                  <p className="mt-5 text-xs font-extrabold text-slate-950">Study rooms</p>
                  <p className="mt-1 text-[10px] text-slate-400 font-semibold">8 people live</p>
                </Link>

                <Link
                  href="/app/timetable"
                  className="tool-card rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg">
                    ▤
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
                  {enrollments.length > 0 ? (
                    enrollments.slice(0, 3).map((e: any, idx: number) => {
                      const code = e.courseId?.code || e.courseId?.courseCode || "DCIT 205";
                      const name = e.courseId?.name || e.courseId?.title || "Algorithms";
                      const progress = idx === 0 ? 74 : idx === 1 ? 58 : 41;
                      const color = idx === 0 ? "bg-[#0C60FC]" : idx === 1 ? "bg-violet-500" : "bg-amber-400";
                      return (
                        <div key={e._id || idx} className="rounded-2xl bg-[#F7F9FC] p-3">
                          <div className="flex justify-between text-[11px] font-bold text-slate-950">
                            <span>{code} · {name}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${color}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="rounded-2xl bg-[#F7F9FC] p-3">
                        <div className="flex justify-between text-[11px] font-bold text-slate-950">
                          <span>DCIT 205 · Algorithms</span>
                          <span>74%</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                          <div className="h-full w-[74%] rounded-full bg-[#0C60FC]" />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-[#F7F9FC] p-3">
                        <div className="flex justify-between text-[11px] font-bold text-slate-950">
                          <span>DCIT 207 · Operating Systems</span>
                          <span>58%</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                          <div className="h-full w-[58%] rounded-full bg-violet-500" />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-[#F7F9FC] p-3">
                        <div className="flex justify-between text-[11px] font-bold text-slate-950">
                          <span>MATH 223 · Statistics</span>
                          <span>41%</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                          <div className="h-full w-[41%] rounded-full bg-amber-400" />
                        </div>
                      </div>
                    </>
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
                  {recentSessions.length > 0 ? (
                    recentSessions.map((s: any, idx: number) => (
                      <Link
                        key={s.id || idx}
                        href={`/app/${s.id}`}
                        className="flex items-center gap-3 py-3 hover:bg-slate-50 rounded-xl px-1 transition"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm">
                          {idx === 0 ? "✓" : idx === 1 ? "◇" : "▤"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-bold text-slate-950">
                            {s.title || "Core Concepts Review"}
                          </p>
                          <p className="text-[9px] text-slate-400 font-semibold">
                            {s.mode || "Session"} · Recent
                          </p>
                        </div>
                        <span className="ml-auto text-xs font-bold text-emerald-600">
                          {idx === 0 ? "84%" : "→"}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <>
                      <a href="/app/all" className="flex items-center gap-3 py-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm">
                          ✓
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-slate-950">
                            Core Concepts Mastery Review
                          </p>
                          <p className="text-[9px] text-slate-400 font-semibold">Quiz · 18 minutes ago</p>
                        </div>
                        <b className="ml-auto text-[10px] text-emerald-600">84%</b>
                      </a>
                      <a href="/app/all" className="flex items-center gap-3 py-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-sm">
                          ◇
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-slate-950">
                            Recommendation Systems
                          </p>
                          <p className="text-[9px] text-slate-400 font-semibold">Flashcards · Yesterday</p>
                        </div>
                        <span className="ml-auto text-slate-300">→</span>
                      </a>
                      <a href="/app/all" className="flex items-center gap-3 py-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-sm">
                          ▤
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-slate-950">
                            Image Processing Notes
                          </p>
                          <p className="text-[9px] text-slate-400 font-semibold">Notes · 2 days ago</p>
                        </div>
                        <span className="ml-auto text-slate-300">→</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column: Today's Brief + Next Exam */}
          <aside className="space-y-4">
            {/* Today's Brief */}
            <div className="rounded-[28px] border border-slate-200 bg-[#FFFDF8] p-5 shadow-sm">
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
                <div className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0C60FC] text-[8px] font-bold text-white">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">14 min · Big-O quiz</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500 font-semibold">
                      Repair yesterday's two misses.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[8px] font-bold text-white">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">25 min · OS flashcards</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500 font-semibold">
                      Review before your 2 PM lab.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-slate-900">
                    3
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">50 min · Statistics</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500 font-semibold">
                      The paper that needs you most.
                    </p>
                  </div>
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
            <div className="rounded-[28px] bg-[#131B27] p-5 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-blue-300">
                  Next exam
                </p>
                <span className="rounded-full bg-rose-400/15 px-2 py-1 text-[9px] font-bold text-rose-300">
                  18 days
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">DCIT 205</h2>
              <p className="text-xs text-slate-400 font-medium">Algorithms · Great Hall</p>

              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0C60FC] text-xs font-extrabold text-white">
                  72%
                </span>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Exam readiness</p>
                  <p className="text-xs font-bold text-white">3 topics left</p>
                </div>
              </div>

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
