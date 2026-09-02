"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QUBI_STUDY_SRC } from "@/lib/constants";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import {
  Clock,
  MapPin,
  ListTodo,
  Check,
  BarChart3,
  Flame,
  Trash2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTimetableOverview } from "@/hooks/app/use-timetable-overview";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/app/use-tasks";
import type { ITask } from "@/types/task";
import type { ITimetableWeekEvent, TimetableEventType } from "@/types/timetable";
import { useIsMobile } from "@/hooks";
import { toast } from "sonner";
import { getCurrentAcademicYear } from "@/lib/academic-year";
import { useQueryParams } from "@/hooks/common/use-query-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TabView = "week" | "month" | "agenda" | "exams";

const DOT_COLORS = [
  "bg-[#0C60FC]",
  "bg-violet-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-cyan-400",
  "bg-slate-300",
  "bg-rose-400",
];

const WORKLOAD_BAR_COLORS = [
  "bg-[#0C60FC]",
  "bg-[#0C60FC]",
  "bg-blue-400",
  "bg-blue-400",
  "bg-blue-300",
];

function getEventStyle(
  type: TimetableEventType,
  idx = 0,
): { bg: string; text: string; ring: string } {
  switch (type) {
    case "exam":
      return { bg: "bg-slate-950", text: "text-white", ring: "" };
    case "lab":
    case "tutorial":
      return {
        bg: "bg-violet-50",
        text: "text-violet-700",
        ring: "ring-1 ring-violet-200",
      };
    case "study_block":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        ring: "ring-1 ring-emerald-200",
      };
    case "lecture":
    default: {
      const palette = [
        {
          bg: "bg-blue-50",
          text: "text-[#0C60FC]",
          ring: "ring-1 ring-blue-200",
        },
        {
          bg: "bg-amber-50",
          text: "text-amber-800",
          ring: "ring-1 ring-amber-200",
        },
        {
          bg: "bg-cyan-50",
          text: "text-cyan-800",
          ring: "ring-1 ring-cyan-200",
        },
      ];
      return palette[idx % palette.length];
    }
  }
}

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

const WEEK_DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export default function PrivateTimetablePage() {
  const isMobile = useIsMobile();
  const { setQueryParams, getParam } = useQueryParams();

  const urlTab = (getParam("tab") || getParam("view")) as TabView;
  const initialTab: TabView = ["week", "month", "agenda", "exams"].includes(urlTab)
    ? urlTab
    : "week";

  const initialSemester = getParam("semester") || "Semester 2";
  const initialYear = getParam("academicYear") || getParam("year") || getCurrentAcademicYear();
  const initialDateStr = getParam("date");
  const initialDate = initialDateStr ? new Date(initialDateStr + "T00:00:00") : new Date();

  const [activeTab, setActiveTabState] = useState<TabView>(initialTab);
  const [selectedSemester, setSelectedSemesterState] = useState(initialSemester);
  const [selectedYear, setSelectedYearState] = useState(initialYear);
  const [selectedDate, setSelectedDateState] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate,
  );
  const [monthCursor, setMonthCursor] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const setActiveTab = (tab: TabView) => {
    setActiveTabState(tab);
    setQueryParams({ tab, view: tab });
  };

  const setSelectedSemester = (sem: string) => {
    setSelectedSemesterState(sem);
    setQueryParams({ semester: sem });
  };

  const setSelectedYear = (yr: string) => {
    setSelectedYearState(yr);
    setQueryParams({ academicYear: yr });
  };

  const setSelectedDate = (d: Date) => {
    setSelectedDateState(d);
    setQueryParams({ date: format(d, "yyyy-MM-dd") });
  };

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // ─── Timetable Aggregated Overview Query ───────────────────────────────────
  const { data: overview, isLoading: overviewLoading } = useTimetableOverview({
    semester: selectedSemester,
    academicYear: selectedYear,
    date: selectedDateStr,
  });

  // ─── Live Tasks State & Mutations ──────────────────────────────────────────
  const [taskFilter, setTaskFilter] = useState<"all" | "active" | "completed">("all");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const { data: tasksData, isLoading: tasksLoading } = useTasks(
    taskFilter === "all" ? undefined : taskFilter,
  );
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const tasks = useMemo(
    () => tasksData?.tasks || overview?.tasks?.tasks || [],
    [tasksData, overview?.tasks?.tasks],
  );
  const taskMetadata = tasksData?.metadata ||
    overview?.tasks?.metadata || {
      completed: 0,
      total: 0,
      progress: 0,
    };

  const toggleTask = async (task: ITask) => {
    const taskId = task.id || task._id;
    if (!taskId) return;
    const nextStatus = task.status === "completed" ? "active" : "completed";
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        input: { status: nextStatus },
      });
      toast.success(
        nextStatus === "completed" ? "Task completed! 🎉" : "Task marked active",
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update task");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await createTaskMutation.mutateAsync({
        title: newTaskTitle.trim(),
      });
      setNewTaskTitle("");
      toast.success("Task created!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create task");
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId?: string) => {
    e.stopPropagation();
    if (!taskId) return;
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast.success("Task deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete task");
    }
  };

  // ─── Header & Event Data from Overview ─────────────────────────────────────
  const header = overview?.header || {
    activeDate: new Date().toISOString(),
    dayName: format(selectedDate, "EEEE"),
    formattedDate: format(selectedDate, "EEEE, d MMMM"),
    academicWeek: 1,
    todayEventsCount: 0,
    daysToFirstExam: 0,
    upNext: null,
    isSynced: true,
  };

  const weekDays = useMemo(() => {
    if (overview?.weekDays && overview.weekDays.length > 0) {
      return overview.weekDays;
    }
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const cur = addDays(monday, i);
      return {
        date: format(cur, "yyyy-MM-dd"),
        day: format(cur, "EEE").toUpperCase(),
        dayNumber: format(cur, "d"),
        isToday: isToday(cur),
        isSelected: isSameDay(cur, selectedDate),
        eventCount: 0,
        hasExams: false,
      };
    });
  }, [overview?.weekDays, selectedDate]);

  const weekEvents: ITimetableWeekEvent[] = overview?.weekEvents || [];
  const exams = overview?.exams || [];
  const agenda = overview?.agenda || [];
  const workload = overview?.workloadMetrics || {
    dailyHours: [
      { day: "Mon", date: selectedDateStr, hrs: 0 },
      { day: "Tue", date: selectedDateStr, hrs: 0 },
      { day: "Wed", date: selectedDateStr, hrs: 0 },
      { day: "Thu", date: selectedDateStr, hrs: 0 },
      { day: "Fri", date: selectedDateStr, hrs: 0 },
    ],
    weeklyTotalHours: 0,
    streakDays: 0,
  };

  // ─── Filtered Agenda for Search ────────────────────────────────────────────
  const filteredAgenda = useMemo(() => {
    if (!searchQuery.trim()) return agenda;
    const q = searchQuery.toLowerCase();
    return agenda
      .map((grp) => ({
        ...grp,
        events: grp.events.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.courseCode.toLowerCase().includes(q) ||
            e.venue.toLowerCase().includes(q),
        ),
      }))
      .filter((grp) => grp.events.length > 0);
  }, [agenda, searchQuery]);

  // ─── Month View Calendar Matrix ────────────────────────────────────────────
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(monthCursor);
    const monthEnd = endOfMonth(monthCursor);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [monthCursor]);

  return (
    <div className="dash-grid min-h-screen px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12 text-slate-900 bg-[#F7F9FC]">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* ── Header Hero Banner ── */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#131B27] p-5 text-white sm:p-7 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#0C60FC]/30 blur-3xl" />
          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Synced with UG official timetable
              </div>
              <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[.2em] text-blue-300">
                {header.formattedDate} · Week {header.academicWeek}
              </p>
              <h1 className="mt-2 display text-3xl font-bold tracking-tight sm:text-5xl">
                Your timetable.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                {header.upNext ? (
                  <>
                    Up next:{" "}
                    <b className="text-white font-bold">{header.upNext.title}</b>{" "}
                    at {header.upNext.time}.
                  </>
                ) : (
                  <>
                    Up next:{" "}
                    <b className="text-white font-bold">Planned study block</b>.
                    Track upcoming exams, lectures, and tasks below.
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="min-w-24 rounded-2xl bg-white/7 p-4">
                <p className="text-3xl font-bold text-white">
                  {header.todayEventsCount}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  today
                </p>
              </div>
              <div className="min-w-24 rounded-2xl bg-white/7 p-4">
                <p className="text-3xl font-bold text-[#DFFF61]">
                  {header.daysToFirstExam}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  days to exams
                </p>
              </div>
              <Link
                href="/app"
                className="flex min-w-32 items-center justify-center rounded-2xl bg-[#0C60FC] px-5 py-4 text-xs font-extrabold text-white hover:bg-blue-700 transition"
              >
                Start study session →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Main 2-Column Grid with Equal Height Stretching ── */}
        <div className="grid gap-5 xl:grid-cols-[1fr_380px] items-stretch">
          {/* ── LEFT MAIN BOARD ── */}
          <div className="flex flex-col space-y-4 h-full">
            {/* Board Selector & Tabs */}
            <section
              id="board"
              className="panel p-4 sm:p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm shrink-0"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                    {format(selectedDate, "MMMM yyyy")} · {selectedSemester}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    Everything on your schedule
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="h-9 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-[#0C60FC] hover:bg-slate-50 transition cursor-pointer">
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 bg-white font-sans text-xs shadow-lg">
                      {(overview?.availableSemesters || ["Semester 1", "Semester 2"]).map((sem) => (
                        <SelectItem key={sem} value={sem} className="text-xs font-bold text-slate-700 cursor-pointer">
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-9 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-[#0C60FC] hover:bg-slate-50 transition cursor-pointer">
                      <SelectValue placeholder="Select Academic Year" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 bg-white font-sans text-xs shadow-lg">
                      {(overview?.availableAcademicYears || ["2025/2026", "2024/2025"]).map((yr) => (
                        <SelectItem key={yr} value={yr} className="text-xs font-bold text-slate-700 cursor-pointer">
                          {yr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
                          className={`shrink-0 rounded-lg px-3.5 py-2 text-[10px] font-extrabold capitalize transition cursor-pointer ${
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

              {/* Dynamic 7-Day Selector Rail */}
              <div className="date-rail mt-5 grid grid-cols-7 gap-2 pb-1">
                {weekDays.map((d, i) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDate(new Date(d.date + "T00:00:00"))}
                    className={`min-w-0 rounded-2xl p-2 sm:p-3 text-center transition cursor-pointer border ${
                      d.isSelected
                        ? "bg-[#0C60FC] text-white shadow-md border-[#0C60FC]"
                        : d.isToday
                          ? "bg-blue-50/80 border-blue-200 text-slate-900 font-extrabold"
                          : "bg-slate-50 border-transparent text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <p
                      className={`text-[9px] font-bold uppercase ${
                        d.isSelected ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      {d.day}
                    </p>
                    <p className="mt-1 text-xl font-bold">{d.dayNumber}</p>
                    <i
                      className={`mx-auto mt-2 block h-1.5 w-1.5 rounded-full ${
                        d.isSelected ? "bg-white" : DOT_COLORS[i % DOT_COLORS.length]
                      }`}
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* ── TAB 1: WEEK VIEW ── */}
            {activeTab === "week" && (
              <section className="panel p-4 sm:p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm flex-1 flex flex-col justify-between min-h-130">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-950">
                        Week {header.academicWeek} · {format(selectedDate, "MMMM yyyy")}
                      </h2>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        Lectures, labs, tutorials and planned study blocks.
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
                        <i className="h-2 w-2 rounded-full bg-slate-950" />
                        Exam
                      </span>
                    </div>
                  </div>

                  {weekEvents.length === 0 ? (
                    <div className="mt-8 flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                      <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-3">
                        <Image
                          src={QUBI_STUDY_SRC}
                          alt="Qubi"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-800">
                        It seems you have nothing set for this week
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 max-w-xs">
                        No events, lectures, or exams scheduled for this week.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Week Time Grid (08:00 - 18:00) */}
                      <div className="mt-5 hidden lg:block">
                        <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] gap-1 pb-2 text-center font-bold">
                          <span />
                          {weekDays.map((d) => (
                            <span
                              key={d.date}
                              className={`rounded-lg py-1.5 text-[10px] ${
                                d.isSelected
                                  ? "bg-blue-50 text-[#0C60FC] font-extrabold"
                                  : "text-slate-500"
                              }`}
                            >
                              {d.day} {d.dayNumber}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] grid-rows-[repeat(10,40px)] gap-1">
                          {TIME_SLOTS.map((t, i) => (
                            <span
                              key={t}
                              className="text-[9px] font-extrabold uppercase text-slate-400 pt-1"
                              style={{ gridColumn: 1, gridRow: i + 1 }}
                            >
                              {t}
                            </span>
                          ))}

                          {weekEvents.map((event, idx) => {
                            const style = getEventStyle(event.type, idx);
                            return (
                              <div
                                key={event.id}
                                className={`rounded-xl px-2 py-1.5 transition ${style.bg} ${style.text} ${style.ring ?? ""}`}
                                style={{
                                  gridColumn: event.day + 1,
                                  gridRow: `${event.startRow} / ${event.endRow}`,
                                }}
                              >
                                <b className="block truncate text-[10px] font-bold leading-tight">
                                  {event.title}
                                </b>
                                <span className="block truncate text-[9px] opacity-75 mt-0.5 font-semibold">
                                  {event.meta}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mobile Schedule List */}
                      <div className="mt-5 space-y-3 lg:hidden">
                        {weekEvents.map((event, idx) => {
                          const style = getEventStyle(event.type, idx);
                          const dayLabel = WEEK_DAY_LABELS[event.day - 1] || "DAY";
                          const dayCard = weekDays[event.day - 1];
                          return (
                            <div
                              key={event.id}
                              className={`flex items-start gap-3 rounded-2xl p-3 ${style.bg} ${style.text} ${style.ring ?? ""}`}
                            >
                              <span className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white/80 px-1 py-1.5 text-center">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider">
                                  {dayLabel}
                                </span>
                                <span className="text-sm font-extrabold leading-none">
                                  {dayCard?.dayNumber}
                                </span>
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold leading-snug">
                                  {event.title}
                                </p>
                                <p className="mt-0.5 text-[10px] opacity-80 font-semibold">
                                  {event.meta}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* ── TAB 2: MONTH VIEW ── */}
            {activeTab === "month" && (
              <section className="panel p-4 sm:p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm flex-1 flex flex-col justify-between min-h-130">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-950">
                        {format(monthCursor, "MMMM yyyy")}
                      </h2>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        Full month calendar with scheduled classes and exams.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setMonthCursor(subMonths(monthCursor, 1))}
                        className="h-8 w-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        onClick={() => setMonthCursor(new Date())}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-[10px] font-extrabold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Current Month
                      </button>
                      <button
                        onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
                        className="h-8 w-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    <div className="min-w-160">
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
                        {monthDays.map((d) => {
                          const dStr = format(d, "yyyy-MM-dd");
                          const inMonth = isSameMonth(d, monthCursor);
                          const active = isSameDay(d, selectedDate);
                          const today = isToday(d);
                          const eventCount = overview?.monthEventDates?.[dStr] || 0;
                          return (
                            <button
                              key={dStr}
                              type="button"
                              onClick={() => setSelectedDate(d)}
                              className={`min-h-19 rounded-2xl p-2 text-left transition border cursor-pointer ${
                                active
                                  ? "border-[#0C60FC] bg-blue-50/70 ring-2 ring-[#0C60FC]"
                                  : today
                                    ? "border-blue-300 bg-blue-50/30"
                                    : inMonth
                                      ? "border-slate-200 bg-white hover:border-blue-300"
                                      : "border-dashed border-slate-200 bg-slate-50/50 opacity-40"
                              }`}
                            >
                              <span
                                className={`text-[11px] font-bold ${
                                  active || today ? "text-[#0C60FC]" : "text-slate-900"
                                }`}
                              >
                                {format(d, "d")}
                              </span>
                              {eventCount > 0 && (
                                <p className="mt-1.5 rounded-md bg-[#0C60FC] px-1.5 py-0.5 text-[9px] font-bold text-white truncate">
                                  {eventCount} {eventCount === 1 ? "event" : "events"}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── TAB 3: AGENDA VIEW ── */}
            {activeTab === "agenda" && (
              <section className="panel p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm space-y-4 flex-1 flex flex-col justify-between min-h-130">
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="min-w-0 text-base font-bold text-slate-950">
                      Agenda Timeline
                    </h2>
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search timeline..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 mt-3">
                    {filteredAgenda.length > 0 ? (
                      filteredAgenda.map((grp) => (
                        <div key={grp.date} className="py-4 space-y-2">
                          <p className="text-xs font-extrabold text-[#0C60FC] uppercase tracking-wider">
                            {grp.dateLabel}
                          </p>
                          <div className="space-y-2">
                            {grp.events.map((ev) => (
                              <div
                                key={ev.id}
                                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-slate-100/70 transition"
                              >
                                <div>
                                  <p className="text-xs font-bold text-slate-900">
                                    {ev.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                    {ev.timeRange} · {ev.venue}
                                  </p>
                                </div>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-extrabold text-slate-700 shadow-2xs">
                                  {ev.type.toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-xs font-semibold text-slate-400">
                        No events found matching your filter.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── TAB 4: EXAMS VIEW ── */}
            {activeTab === "exams" && (
              <section className="panel p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm flex-1 flex flex-col justify-between min-h-130">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-950">
                        Exam Papers &amp; Venues
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Official scheduled examination sittings for this semester.
                      </p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-extrabold text-rose-700">
                      {exams.length} {exams.length === 1 ? "Exam" : "Exams"} Total
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-5">
                    {exams.length > 0 ? (
                      exams.map((entry) => {
                        const isPast = entry.timingStatus === "past";
                        const isTodayExam = entry.timingStatus === "today" || entry.daysToExam === 0;

                        return (
                          <article
                            key={entry.id}
                            className={`rounded-[24px] border p-5 transition flex flex-col justify-between ${
                              isPast
                                ? "border-slate-200/60 bg-slate-50/60 opacity-80"
                                : "border-slate-200 bg-white shadow-xs hover:shadow-md"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                {isPast ? (
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-extrabold text-slate-500 uppercase">
                                    PAST
                                  </span>
                                ) : isTodayExam ? (
                                  <span className="rounded-full bg-rose-500 text-white px-2.5 py-1 text-[9px] font-extrabold uppercase shadow-2xs">
                                    TODAY
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-extrabold text-rose-600 uppercase">
                                    IN {entry.daysToExam} {entry.daysToExam === 1 ? "DAY" : "DAYS"}
                                  </span>
                                )}
                                <span className="text-xs font-extrabold text-slate-400">
                                  {format(new Date(entry.scheduledAt), "d MMM")}
                                </span>
                              </div>

                              <h3 className="mt-3 text-base font-bold text-slate-950">
                                {entry.courseCode}
                              </h3>
                              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                {entry.courseName}
                              </p>

                              <div className="mt-4 space-y-1.5 text-xs font-semibold text-slate-600">
                                <p className="flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  {format(new Date(entry.scheduledAt), "HH:mm")} ·{" "}
                                  {entry.durationMinutes} mins
                                </p>
                                <p className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                  {entry.venue}
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span
                                className={`text-[10px] font-extrabold uppercase ${
                                  isPast ? "text-slate-400" : "text-emerald-600"
                                }`}
                              >
                                {entry.assignedVenue ? "✓ Seat Assigned" : "General Hall"}
                              </span>
                              <Link
                                href="/app"
                                className={`rounded-xl px-3 py-1.5 text-[10px] font-extrabold transition ${
                                  isPast
                                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                    : "bg-slate-950 text-white hover:bg-[#0C60FC]"
                                }`}
                              >
                                {isPast ? "Review paper →" : "Study paper →"}
                              </Link>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 text-center text-xs font-semibold text-slate-400">
                        No upcoming exam entries recorded for this semester.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT SIDEBAR: Tasks & Workload Widget (Matched Equal Height) ── */}
          <aside className="flex flex-col gap-4 h-full">
            {/* 1. Tasks Card */}
            <div className="panel p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm flex-1 flex flex-col justify-between min-h-95">
              <div className="space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-1.5">
                      <ListTodo className="h-4 w-4 text-[#0C60FC]" /> Tasks
                    </h3>
                    <p className="hand text-base text-[#0C60FC] leading-none mt-0.5">
                      cross them off!
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-[#0C60FC]">
                    {taskMetadata.completed} / {taskMetadata.total} DONE
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-extrabold text-slate-500">
                    <span>Progress</span>
                    <span>{taskMetadata.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0C60FC] transition-all duration-300"
                      style={{ width: `${taskMetadata.progress}%` }}
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

              {/* Tasks List */}
              <div className="my-2 max-h-55 overflow-y-auto no-scrollbar flex-1">
                {tasksLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin text-[#0C60FC]" />
                    <span className="text-xs font-semibold">Loading tasks...</span>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
                    <p className="text-xs font-bold text-slate-700">No tasks yet</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Add a task below to plan your study session.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {tasks.map((t) => {
                        const isDone = t.status === "completed";
                        const taskId = t.id || t._id;
                        return (
                          <motion.li
                            key={taskId}
                            layout
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => toggleTask(t)}
                            className={`group cursor-pointer flex items-start gap-2.5 rounded-2xl p-2.5 transition border relative ${
                              isDone
                                ? "bg-[#F7F9FC] border-slate-100 text-slate-400 line-through"
                                : "bg-white border-slate-200 text-slate-900 shadow-2xs hover:border-[#0C60FC]/40"
                            }`}
                          >
                            <button
                              type="button"
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition ${
                                isDone
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-slate-300 bg-white group-hover:border-[#0C60FC]"
                              }`}
                            >
                              {isDone && <Check className="h-3 w-3 stroke-3" />}
                            </button>

                            <div className="min-w-0 flex-1 pr-6">
                              <p
                                className={`text-xs font-bold leading-snug ${
                                  isDone ? "line-through text-slate-400" : "text-slate-900"
                                }`}
                              >
                                {t.title}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteTask(e, taskId)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition absolute right-2 top-2 rounded-md hover:bg-rose-50"
                              title="Delete task"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="pt-1 shrink-0">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#F7F9FC] px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0C60FC]/20 transition">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    disabled={createTaskMutation.isPending}
                    className="min-w-0 flex-1 bg-transparent py-1 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={createTaskMutation.isPending || !newTaskTitle.trim()}
                    className="rounded-xl bg-slate-950 px-2.5 py-1.5 text-[10px] font-extrabold text-white hover:bg-[#0C60FC] disabled:opacity-50 transition cursor-pointer"
                  >
                    {createTaskMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      "+ Add"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Workload & Metrics Widget */}
            <div className="panel p-4.5 rounded-[28px] border border-slate-200 bg-white shadow-sm space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-950 flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-[#0C60FC]" /> Workload &amp; Metrics
                  </h3>
                  <p className="hand text-sm text-[#0C60FC] leading-none mt-0.5">
                    weekly breakdown
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-600">
                  <Flame className="h-2.5 w-2.5" strokeWidth={2.25} />
                  {workload.streakDays}d Streak
                </span>
              </div>

              {/* Weekly Workload Bar Chart */}
              <div className="space-y-1.5 pt-0.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Daily Study Hours ({workload.weeklyTotalHours} hrs total)
                </p>
                <div className="grid grid-cols-5 gap-1.5 items-end pt-1 pb-2.5 border-b border-slate-100">
                  {workload.dailyHours.map((bar, i) => {
                    const pct = Math.min(100, Math.round((bar.hrs / 6.0) * 100)) + "%";
                    const color = WORKLOAD_BAR_COLORS[i % WORKLOAD_BAR_COLORS.length];
                    return (
                      <div
                        key={bar.day}
                        className="flex flex-col items-center gap-1 justify-end"
                      >
                        <div className="h-16 w-full flex items-end justify-center rounded-lg bg-slate-50 p-1">
                          <div
                            className={`w-full rounded-md transition-all duration-500 ${color}`}
                            style={{ height: pct }}
                          />
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-500">
                          {bar.day}
                        </span>
                        <span className="text-[8px] font-semibold text-slate-400">
                          {bar.hrs}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
