"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  CheckSquare,
  Square,
  ListTodo,
  Check,
  BarChart3,
  Flame,
} from "lucide-react";
import {
  useMyTimetable,
  type IExamSessionEntry,
} from "@/hooks/app/use-timetable";
import { useMyCourses } from "@/hooks/app/use-user-courses";
import { useIsMobile } from "@/hooks";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

type TabView = "week" | "month" | "agenda" | "exams";

interface TaskItem {
  id: string;
  title: string;
  category: string;
  done: boolean;
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "t1",
    title: "Re-read DCIT 205 L03 notes",
    category: "Algorithms",
    done: true,
  },
  {
    id: "t2",
    title: "10 Big-O practice questions",
    category: "Algorithms",
    done: true,
  },
  {
    id: "t3",
    title: "Memoization vs tabulation review",
    category: "Algorithms",
    done: false,
  },
  {
    id: "t4",
    title: "OS Process Scheduling lab prep",
    category: "Operating Systems",
    done: false,
  },
  {
    id: "t5",
    title: "Linear Algebra Problem Set 4",
    category: "Mathematics",
    done: false,
  },
  {
    id: "t6",
    title: "Linear Algebra Problem Set 4",
    category: "Mathematics",
    done: false,
  },
  {
    id: "t7",
    title: "Linear Algebra Problem Set 4",
    category: "Mathematics",
    done: false,
  },
  {
    id: "t8",
    title: "Linear Algebra Problem Set 4",
    category: "Mathematics",
    done: false,
  },
];

const WEEK_DAYS = [
  { day: "MON", date: "12", isToday: true, dotColor: "bg-[#DFFF61]" },
  { day: "TUE", date: "13", isToday: false, dotColor: "bg-slate-300" },
  { day: "WED", date: "14", isToday: false, dotColor: "bg-violet-400" },
  { day: "THU", date: "15", isToday: false, dotColor: "bg-amber-400" },
  { day: "FRI", date: "16", isToday: false, dotColor: "bg-emerald-400" },
  { day: "SAT", date: "17", isToday: false, dotColor: "bg-cyan-400" },
  { day: "SUN", date: "18", isToday: false, dotColor: "bg-rose-400" },
];

// Events for the week grid. Each event has a day (1-5 = MON-FRI in the grid)
// plus a row range. The same data drives both the desktop grid and the
// mobile-friendly list view.
interface WeekEvent {
  title: string;
  meta: string;
  day: number; // 1=MON, 2=TUE, 3=WED, 4=THU, 5=FRI
  startRow: number;
  endRow: number;
  tone: "blue" | "violet" | "amber" | "cyan" | "slate" | "ink";
}

const WEEK_EVENTS: WeekEvent[] = [
  {
    title: "DCIT 205 Lecture",
    meta: "09:00–11:00 · Great Hall",
    day: 1,
    startRow: 2,
    endRow: 4,
    tone: "blue",
  },
  {
    title: "UGRC 210 Tutorial",
    meta: "13:00–14:30 · NNB 4",
    day: 1,
    startRow: 6,
    endRow: 8,
    tone: "slate",
  },
  {
    title: "DCIT 207 Lecture",
    meta: "08:00–10:00 · Balme Hall",
    day: 2,
    startRow: 1,
    endRow: 3,
    tone: "violet",
  },
  {
    title: "MATH 223 Lecture",
    meta: "11:00–13:00 · Maths 12",
    day: 2,
    startRow: 4,
    endRow: 6,
    tone: "amber",
  },
  {
    title: "DCIT 201 Lecture",
    meta: "10:00–12:00 · N Block",
    day: 3,
    startRow: 3,
    endRow: 5,
    tone: "cyan",
  },
  {
    title: "MATH 223 Tutorial",
    meta: "09:00–10:30 · Maths 4",
    day: 4,
    startRow: 2,
    endRow: 4,
    tone: "amber",
  },
  {
    title: "Weekly review with Qz",
    meta: "15:00–16:00",
    day: 5,
    startRow: 8,
    endRow: 10,
    tone: "ink",
  },
];

const EVENT_TONE_CLS: Record<
  WeekEvent["tone"],
  { bg: string; text: string; ring?: string }
> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-[#0C60FC]",
    ring: "ring-1 ring-blue-200",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-1 ring-violet-200",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    ring: "ring-1 ring-amber-200",
  },
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-800",
    ring: "ring-1 ring-cyan-200",
  },
  slate: { bg: "bg-slate-100", text: "text-slate-700" },
  ink: { bg: "bg-slate-950", text: "text-white" },
};

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const WEEK_DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI"] as const;

export default function PrivateTimetablePage() {
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabView>("week");
  const [selectedSemester, setSelectedSemester] = useState("Semester 1");
  const [selectedYear, setSelectedYear] = useState("2025-2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    new Date(),
  );

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "active" | "completed">(
    "all",
  );

  const { data: timetables = [], isLoading } = useMyTimetable(
    selectedSemester,
    selectedYear,
  );

  const sortedExams = useMemo(() => {
    return [...timetables].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  }, [timetables]);

  const daysToFirstExam = useMemo(() => {
    if (sortedExams.length === 0) return 18;
    const firstMs = new Date(sortedExams[0].scheduledAt).getTime();
    const diff = Math.max(
      0,
      Math.ceil((firstMs - Date.now()) / (1000 * 60 * 60 * 24)),
    );
    return diff || 18;
  }, [sortedExams]);

  // Task actions
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.done;
          toast.success(nextState ? "Task completed! 🎉" : "Task uncompleted");
          return { ...t, done: nextState };
        }
        return t;
      }),
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: `t_${Date.now()}`,
      title: newTaskTitle.trim(),
      category: "General Study",
      done: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
    toast.success("Task added to schedule!");
  };

  const completedCount = useMemo(
    () => tasks.filter((t) => t.done).length,
    [tasks],
  );
  const completionPercentage = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedCount / tasks.length) * 100);
  }, [tasks, completedCount]);

  const filteredTasks = useMemo(() => {
    if (taskFilter === "active") return tasks.filter((t) => !t.done);
    if (taskFilter === "completed") return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, taskFilter]);

  return (
    <div className="dash-grid min-h-screen px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12 text-slate-900 bg-[#F7F9FC]">
      <div className="mx-auto max-w-[1280px] space-y-4">
        {/* Header Hero Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#131B27] p-5 text-white sm:p-7 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#0C60FC]/30 blur-3xl" />
          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Official timetable synced
              </div>
              <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[.2em] text-blue-300">
                Monday, 12 January · Week 9
              </p>
              <h1 className="mt-2 display text-3xl font-bold tracking-tight sm:text-5xl">
                Your timetable.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Up next:{" "}
                <b className="text-white font-bold">
                  DCIT 205 Algorithms lecture
                </b>{" "}
                at 9:00 AM · Great Hall. Three classes and one study block
                today.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="min-w-24 rounded-2xl bg-white/7 p-4">
                <p className="text-3xl font-bold text-white">4</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  today
                </p>
              </div>
              <div className="min-w-24 rounded-2xl bg-white/7 p-4">
                <p className="text-3xl font-bold text-[#DFFF61]">
                  {daysToFirstExam}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  days to exams
                </p>
              </div>
              <Link
                href="/app"
                className="flex min-w-32 items-center justify-center rounded-2xl bg-[#0C60FC] px-5 py-4 text-xs font-extrabold text-white hover:bg-blue-700 transition"
              >
                Start next block →
              </Link>
            </div>
          </div>
        </section>

        {/* Main 2-Column Grid: Timetable Board + Calendar & Tasks Sidebar */}
        <div className="grid gap-5 xl:grid-cols-[1fr_380px] items-stretch">
          {/* LEFT MAIN AREA */}
          <div className="space-y-4">
            {/* Board & Tab Selector Section */}
            <section
              id="board"
              className="panel p-4 sm:p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                    January 2026 · {selectedSemester}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    Everything on your schedule
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-[#F7F9FC] px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>

                  <div
                    id="tabs"
                    className="date-rail flex gap-1 overflow-x-auto rounded-xl bg-[#F0F3F8] p-1"
                  >
                    {(["week", "month", "agenda", "exams"] as TabView[])
                      .filter((tab) => !(isMobile && tab === "month"))
                      .map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`shrink-0 rounded-lg px-3.5 py-2 text-[10px] font-extrabold capitalize transition ${
                            activeTab === tab
                              ? "bg-white text-slate-950 shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Date Selector Rail */}
              <div className="date-rail mt-5 grid grid-cols-7 gap-2 pb-1">
                {WEEK_DAYS.map((d, idx) => (
                  <div
                    key={idx}
                    className={`min-w-0 rounded-2xl p-2 sm:p-3 text-center transition ${
                      d.isToday
                        ? "bg-[#0C60FC] text-white shadow-md"
                        : "bg-slate-50 text-slate-900"
                    }`}
                  >
                    <p
                      className={`text-[9px] font-bold uppercase ${d.isToday ? "text-blue-200" : "text-slate-400"}`}
                    >
                      {d.day}
                    </p>
                    <p className="mt-1 text-xl font-bold">{d.date}</p>
                    <i
                      className={`mx-auto mt-2 block h-1.5 w-1.5 rounded-full ${d.dotColor}`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* TAB 1: WEEK VIEW */}
            {activeTab === "week" && (
              <section className="space-y-4">
                <div className="panel p-4 sm:p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-950">
                        Week 9 · 12–16 January
                      </h2>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        Lectures, labs, tutorials and your planned study blocks.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <i className="h-2 w-2 rounded-full bg-[#0C60FC]" />
                        Lecture
                      </span>
                      <span className="flex items-center gap-1.5">
                        <i className="h-2 w-2 rounded-full bg-violet-400" />
                        Lab / tutorial
                      </span>
                      <span className="flex items-center gap-1.5">
                        <i className="h-2 w-2 rounded-full bg-lime-400" />
                        Study block
                      </span>
                      <span className="flex items-center gap-1.5">
                        <i className="h-2 w-2 rounded-full bg-rose-400" />
                        Exam
                      </span>
                    </div>
                  </div>

                  {/* Desktop Timetable Grid */}
                  <div className="mt-5 hidden lg:block">
                    <div className="grid grid-cols-[60px_repeat(5,minmax(0,1fr))] gap-1 pb-2 text-center font-bold">
                      <span />
                      {WEEK_DAY_LABELS.map((label, idx) => {
                        const isFirst = idx === 0;
                        return (
                          <span
                            key={label}
                            className={`rounded-lg py-1.5 text-[10px] ${
                              isFirst
                                ? "bg-blue-50 text-[#0C60FC]"
                                : "text-slate-500"
                            }`}
                          >
                            {label} {WEEK_DAYS[idx]?.date}
                          </span>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-[60px_repeat(5,minmax(0,1fr))] grid-rows-[repeat(10,48px)] gap-1">
                      {TIME_SLOTS.map((t, i) => (
                        <span
                          key={t}
                          className="text-[9px] font-extrabold uppercase text-slate-400"
                          style={{ gridColumn: 1, gridRow: i + 1 }}
                        >
                          {t}
                        </span>
                      ))}

                      {WEEK_EVENTS.map((event, i) => {
                        const tone = EVENT_TONE_CLS[event.tone];
                        return (
                          <div
                            key={i}
                            className={`rounded-xl p-2 ${tone.bg} ${tone.text} ${tone.ring ?? ""}`}
                            style={{
                              gridColumn: event.day + 1,
                              gridRow: `${event.startRow} / ${event.endRow}`,
                            }}
                          >
                            <b className="block text-[11px] font-bold">
                              {event.title}
                            </b>
                            <span className="text-[9px] opacity-80">
                              {event.meta}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tablet Timetable Grid (md only) */}
                  <div className="mt-5 hidden md:block lg:hidden">
                    <div className="grid grid-cols-[44px_repeat(5,minmax(0,1fr))] gap-1 pb-2 text-center font-bold">
                      <span />
                      {WEEK_DAY_LABELS.map((label, idx) => {
                        const isFirst = idx === 0;
                        return (
                          <span
                            key={label}
                            className={`rounded-none py-1 text-[10px] ${
                              isFirst
                                ? "bg-blue-50 text-[#0C60FC]"
                                : "text-slate-500"
                            }`}
                          >
                            {label} {WEEK_DAYS[idx]?.date}
                          </span>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-[44px_repeat(5,minmax(0,1fr))] grid-rows-[repeat(10,36px)] gap-1">
                      {TIME_SLOTS.map((t, i) => (
                        <span
                          key={t}
                          className="text-[9px] font-extrabold uppercase text-slate-400"
                          style={{ gridColumn: 1, gridRow: i + 1 }}
                        >
                          {t}
                        </span>
                      ))}

                      {WEEK_EVENTS.map((event, i) => {
                        const tone = EVENT_TONE_CLS[event.tone];
                        return (
                          <div
                            key={i}
                            className={`rounded-none px-1.5 py-1 ${tone.bg} ${tone.text} ${tone.ring ?? ""}`}
                            style={{
                              gridColumn: event.day + 1,
                              gridRow: `${event.startRow} / ${event.endRow}`,
                            }}
                          >
                            <b className="block truncate text-[10px] font-bold leading-tight">
                              {event.title}
                            </b>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile-friendly list fallback (visible below `md`) */}
                  <div className="mt-5 space-y-3 md:hidden">
                    {WEEK_EVENTS.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs font-semibold text-slate-400">
                        No classes scheduled this week.
                      </p>
                    ) : (
                      WEEK_EVENTS.map((event, i) => {
                        const tone = EVENT_TONE_CLS[event.tone];
                        const dayLabel = WEEK_DAY_LABELS[event.day - 1];
                        const dayDate = WEEK_DAYS[event.day - 1]?.date;
                        return (
                          <div
                            key={i}
                            className={`flex items-start gap-3 rounded-2xl p-3 ${tone.bg} ${tone.text} ${tone.ring ?? ""}`}
                          >
                            <span className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white/70 px-1 py-1.5 text-center">
                              <span className="text-[9px] font-extrabold uppercase tracking-wider">
                                {dayLabel}
                              </span>
                              <span className="text-sm font-extrabold leading-none">
                                {dayDate}
                              </span>
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold leading-snug">
                                {event.title}
                              </p>
                              <p className="mt-0.5 text-[10px] opacity-80">
                                {event.meta}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* TAB 2: MONTH VIEW */}
            {activeTab === "month" && isMobile && (
              <section className="panel rounded-none border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col items-start gap-2">
                  <h2 className="text-base font-bold text-slate-950">
                    Month view isn't available on small screens
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Showing your week instead.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("week")}
                    className="rounded-none border border-slate-200 bg-[#0C60FC] px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-white"
                  >
                    Switch to week
                  </button>
                </div>
              </section>
            )}

            {activeTab === "month" && !isMobile && (
              <section className="panel p-4 sm:p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">
                      January 2026
                    </h2>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      Classes, study blocks and the exam window in one view.
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="h-9 w-9 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50">
                      ‹
                    </button>
                    <button className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-extrabold text-slate-600">
                      Today
                    </button>
                    <button className="h-9 w-9 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50">
                      ›
                    </button>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <div className="min-w-[680px]">
                    <div className="grid grid-cols-7 gap-1.5 pb-2 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {/* Out of month days */}
                      <div className="min-h-[84px] rounded-2xl border border-dashed border-slate-200 p-2 opacity-45">
                        <span className="text-[11px] font-bold text-slate-400">
                          29
                        </span>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-dashed border-slate-200 p-2 opacity-45">
                        <span className="text-[11px] font-bold text-slate-400">
                          30
                        </span>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-dashed border-slate-200 p-2 opacity-45">
                        <span className="text-[11px] font-bold text-slate-400">
                          31
                        </span>
                      </div>

                      {/* Days 1 to 31 */}
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          1
                        </span>
                        <p className="mt-2 rounded-md bg-slate-100 px-1.5 py-1 text-[9px] font-bold text-slate-600">
                          Holiday
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          2
                        </span>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-400">
                          3
                        </span>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-400">
                          4
                        </span>
                      </div>

                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          5
                        </span>
                        <p className="mt-2 rounded-md bg-blue-50 px-1.5 py-1 text-[9px] font-bold text-[#0C60FC]">
                          3 classes
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          6
                        </span>
                        <p className="mt-2 rounded-md bg-violet-50 px-1.5 py-1 text-[9px] font-bold text-violet-700">
                          3 classes
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          7
                        </span>
                        <p className="mt-2 rounded-md bg-blue-50 px-1.5 py-1 text-[9px] font-bold text-[#0C60FC]">
                          2 classes
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          8
                        </span>
                        <p className="mt-2 rounded-md bg-blue-50 px-1.5 py-1 text-[9px] font-bold text-[#0C60FC]">
                          3 classes
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          9
                        </span>
                        <p className="mt-2 rounded-md bg-lime-100 px-1.5 py-1 text-[9px] font-bold text-lime-900">
                          Review · Qz
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-400">
                          10
                        </span>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-400">
                          11
                        </span>
                      </div>

                      {/* Today */}
                      <div className="min-h-[84px] rounded-2xl border border-[#0C60FC] bg-blue-50/60 p-2 ring-2 ring-[#0C60FC]">
                        <span className="text-[11px] font-extrabold text-[#0C60FC]">
                          12 · Today
                        </span>
                        <p className="mt-2 rounded-md bg-rose-100 px-1.5 py-1 text-[9px] font-bold text-rose-700">
                          EXAM · DCIT 205
                        </p>
                        <p className="mt-1 rounded-md bg-white px-1.5 py-1 text-[9px] font-bold text-slate-600">
                          +2 classes
                        </p>
                      </div>

                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          13
                        </span>
                        <p className="mt-2 rounded-md bg-rose-100 px-1.5 py-1 text-[9px] font-bold text-rose-700">
                          EXAM · UGRC 210
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          14
                        </span>
                        <p className="mt-2 rounded-md bg-rose-100 px-1.5 py-1 text-[9px] font-bold text-rose-700">
                          EXAM · DCIT 207
                        </p>
                        <p className="mt-1 rounded-md bg-violet-50 px-1.5 py-1 text-[9px] font-bold text-violet-700">
                          OS practical
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          15
                        </span>
                        <p className="mt-2 rounded-md bg-rose-100 px-1.5 py-1 text-[9px] font-bold text-rose-700">
                          EXAM · MATH 221
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          16
                        </span>
                        <p className="mt-2 rounded-md bg-rose-100 px-1.5 py-1 text-[9px] font-bold text-rose-700">
                          EXAM · BUSA 301
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-400">
                          17
                        </span>
                        <p className="mt-2 rounded-md bg-lime-100 px-1.5 py-1 text-[9px] font-bold text-lime-900">
                          Study block
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-400">
                          18
                        </span>
                      </div>

                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          19
                        </span>
                        <p className="mt-2 rounded-md bg-rose-100 px-1.5 py-1 text-[9px] font-bold text-rose-700">
                          EXAM · DCIT 201
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          20
                        </span>
                        <p className="mt-2 rounded-md bg-lime-100 px-1.5 py-1 text-[9px] font-bold text-lime-900">
                          Study block
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          21
                        </span>
                        <p className="mt-2 rounded-md bg-rose-100 px-1.5 py-1 text-[9px] font-bold text-rose-700">
                          EXAM · DCIT 203
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          22
                        </span>
                        <p className="mt-2 rounded-md bg-lime-100 px-1.5 py-1 text-[9px] font-bold text-lime-900">
                          Study block
                        </p>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-900">
                          23
                        </span>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-400">
                          24
                        </span>
                      </div>
                      <div className="min-h-[84px] rounded-2xl border border-slate-200 p-2 bg-white">
                        <span className="text-[11px] font-bold text-slate-400">
                          25
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* TAB 3: AGENDA VIEW */}
            {activeTab === "agenda" && (
              <section className="panel p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="min-w-0 text-base font-bold text-slate-950">
                    Upcoming Agenda
                  </h2>
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search agenda..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {sortedExams.length > 0 ? (
                    sortedExams.map((entry) => (
                      <div
                        key={entry._id}
                        className="py-3.5 flex items-center gap-4"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0C60FC] font-extrabold text-xs">
                          {new Date(entry.scheduledAt).getDate()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-950">
                            {entry.courseCode} · {entry.courseName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold">
                            {entry.examType.toUpperCase()} · {entry.venue}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">
                          {entry.durationMinutes} min
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs font-semibold text-slate-400">
                      No upcoming exam events found for this semester.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* TAB 4: EXAMS VIEW */}
            {activeTab === "exams" && (
              <section className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sortedExams.length > 0 ? (
                    sortedExams.map((entry) => (
                      <article
                        key={entry._id}
                        className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between">
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-extrabold text-rose-600">
                            FINAL EXAM
                          </span>
                          <span className="text-xs font-extrabold text-slate-400">
                            {format(new Date(entry.scheduledAt), "d MMM")}
                          </span>
                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-950">
                          {entry.courseCode}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {entry.courseName}
                        </p>

                        <div className="mt-5 space-y-2 text-xs font-semibold text-slate-600">
                          <p className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {format(new Date(entry.scheduledAt), "HH:mm")}{" "}
                            · {entry.durationMinutes} mins
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {entry.venue}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-emerald-600 uppercase">
                            ✓ Seat Assigned
                          </span>
                          <Link
                            href="/app"
                            className="rounded-xl bg-slate-950 px-3.5 py-2 text-[10px] font-extrabold text-white hover:bg-[#0C60FC] transition"
                          >
                            Study paper →
                          </Link>
                        </div>
                      </article>
                    ))
                  ) : (
                    <>
                      <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-extrabold text-rose-600">
                            IN 18 DAYS
                          </span>
                          <span className="text-xs font-extrabold text-slate-400">
                            12 Jan
                          </span>
                        </div>
                        <h3 className="mt-4 text-base font-bold text-slate-950">
                          DCIT 205 · Algorithms
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          Great Hall, Main Campus
                        </p>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-emerald-600 uppercase">
                            Seat #42 · Main Row
                          </span>
                          <Link
                            href="/app"
                            className="rounded-xl bg-slate-950 px-3.5 py-2 text-[10px] font-extrabold text-white hover:bg-[#0C60FC] transition"
                          >
                            Study paper →
                          </Link>
                        </div>
                      </article>

                      <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-extrabold text-rose-600">
                            IN 19 DAYS
                          </span>
                          <span className="text-xs font-extrabold text-slate-400">
                            13 Jan
                          </span>
                        </div>
                        <h3 className="mt-4 text-base font-bold text-slate-950">
                          DCIT 207 · Operating Systems
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          Balme Hall, Main Campus
                        </p>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-emerald-600 uppercase">
                            Seat #18 · Upper Wing
                          </span>
                          <Link
                            href="/app"
                            className="rounded-xl bg-slate-950 px-3.5 py-2 text-[10px] font-extrabold text-white hover:bg-[#0C60FC] transition"
                          >
                            Study paper →
                          </Link>
                        </div>
                      </article>
                    </>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT SIDEBAR: Tasks & Goals Widget */}
          <aside className="flex flex-col gap-4 h-full">
            {/* Tasks & Goals Widget Card with Strikethrough Completed Tasks */}
            <div className="panel p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm flex-1 flex flex-col gap-3 min-h-0">
              <div className="space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-1.5">
                      <ListTodo className="h-4 w-4 text-[#0C60FC]" /> Study
                      Tasks
                    </h3>
                    <p className="hand text-base text-[#0C60FC] leading-none mt-0.5">
                      cross them off!
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-[#0C60FC]">
                    {completedCount} / {tasks.length} DONE
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-extrabold text-slate-500">
                    <span>Progress</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0C60FC] transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5 rounded-xl bg-[#F7F9FC] p-1 text-[10px] font-bold text-slate-600">
                  {(["all", "active", "completed"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`flex-1 py-1.5 text-center rounded-lg capitalize transition cursor-pointer ${
                        taskFilter === f
                          ? "bg-white text-slate-950 shadow-2xs font-extrabold"
                          : "hover:text-slate-900"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks Checklist — fixed height and hidden scrollbar */}
              <ul className="space-y-2 h-[340px] overflow-y-auto no-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((t) => (
                    <motion.li
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => toggleTask(t.id)}
                      className={`group cursor-pointer flex items-start gap-2.5 rounded-2xl p-3 transition border ${
                        t.done
                          ? "bg-[#F7F9FC] border-slate-100 text-slate-400 line-through"
                          : "bg-white border-slate-200/90 text-slate-900 shadow-2xs hover:border-[#0C60FC]/40"
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition ${
                          t.done
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white group-hover:border-[#0C60FC]"
                        }`}
                      >
                        {t.done && <Check className="h-3 w-3 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-bold leading-snug ${t.done ? "line-through text-slate-400" : "text-slate-900"}`}
                        >
                          {t.title}
                        </p>
                        <span className="mt-0.5 inline-block text-[9px] font-semibold text-slate-400">
                          {t.category}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="pt-1 shrink-0">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#F7F9FC] px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0C60FC]/20 transition">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new study task..."
                    className="min-w-0 flex-1 bg-transparent py-1 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-950 px-2.5 py-1.5 text-[10px] font-extrabold text-white hover:bg-[#0C60FC] transition cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </form>
            </div>

            {/* Weekly Study Metrics & Workload Analytics Widget Card */}
            <div className="panel p-4.5 rounded-[28px] border border-slate-200 bg-white shadow-sm space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-950 flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-[#0C60FC]" />{" "}
                    Workload & Metrics
                  </h3>
                  <p className="hand text-sm text-[#0C60FC] leading-none mt-0.5">
                    weekly breakdown
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-600">
                  <Flame className="h-2.5 w-2.5" strokeWidth={2.25} />
                  8d Streak
                </span>
              </div>

              {/* Weekly Workload Visual Bar Chart */}
              <div className="space-y-1.5 pt-0.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Daily Study Hours
                </p>
                <div className="grid grid-cols-5 gap-1.5 items-end pt-1 pb-2.5 border-b border-slate-100">
                  {[
                    { day: "Mon", hrs: 4.5, pct: "75%", color: "bg-[#0C60FC]" },
                    {
                      day: "Tue",
                      hrs: 6.0,
                      pct: "100%",
                      color: "bg-[#0C60FC]",
                    },
                    { day: "Wed", hrs: 4.0, pct: "65%", color: "bg-blue-400" },
                    { day: "Thu", hrs: 3.5, pct: "55%", color: "bg-blue-400" },
                    { day: "Fri", hrs: 2.5, pct: "40%", color: "bg-blue-300" },
                  ].map((bar) => (
                    <div
                      key={bar.day}
                      className="flex flex-col items-center gap-1 justify-end"
                    >
                      <span className="text-[9px] font-extrabold text-slate-600">
                        {bar.hrs}h
                      </span>
                      <div className="w-full bg-slate-100 rounded-t-lg h-14 flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${bar.color}`}
                          style={{ height: bar.pct }}
                        />
                      </div>
                      <span className="text-[9px] font-extrabold uppercase text-slate-400">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Allocation Segmented Bar */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex justify-between text-[10px] font-extrabold text-slate-700">
                  <span>Semester Allocation</span>
                  <span className="text-slate-500">21 hrs / wk</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 flex overflow-hidden p-0.5">
                  <div
                    className="h-full w-[55%] rounded-l-full bg-[#0C60FC]"
                    title="Lectures 55%"
                  />
                  <div
                    className="h-full w-[25%] bg-violet-400"
                    title="Labs 25%"
                  />
                  <div
                    className="h-full w-[20%] rounded-r-full bg-[#DFFF61]"
                    title="Study 20%"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-y-0.5 text-[9px] font-bold text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-[#0C60FC]" /> 55%
                    Lectures
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-violet-400" /> 25%
                    Labs
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-[#DFFF61]" /> 20%
                    Study
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
