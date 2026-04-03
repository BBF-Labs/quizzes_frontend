"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Bell, Calendar, Clock, MapPin } from "lucide-react";
import {
  useMyTimetable,
  type IExamSessionEntry,
} from "@/hooks/app/use-timetable";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SEMESTERS = ["Semester 1", "Semester 2", "Summer Session"];
const ACADEMIC_YEARS = ["2023-2024", "2024-2025", "2025-2026"];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const formatDuration = (minutes: number) => {
  if (minutes % 60 === 0) {
    return `${minutes / 60}h`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    day: date.toLocaleDateString(undefined, { weekday: "short" }),
    date: date.getDate(),
    month: date.toLocaleDateString(undefined, { month: "short" }),
    time: date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export default function TimetablePage() {
  const [selectedSemester, setSelectedSemester] = useState("Semester 1");
  const [selectedYear, setSelectedYear] = useState("2025-2026");
  const [nowMs, setNowMs] = useState(() => Date.now());

  const { data: timetables = [], isLoading } = useMyTimetable(
    selectedSemester,
    selectedYear,
  );

  const allEntries = useMemo<IExamSessionEntry[]>(() => {
    return [...timetables].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  }, [timetables]);

  const mostRecentEntry = allEntries[0] ?? null;
  const otherEntries = allEntries.slice(1);

  const mostRecentDaysRemaining = mostRecentEntry
    ? Math.max(
        0,
        Math.ceil(
          (new Date(mostRecentEntry.scheduledAt).getTime() - nowMs) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-8 py-8 px-4 md:px-8 max-w-7xl mx-auto min-h-[calc(100dvh-3.5rem)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Exam Timetable
          </h1>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
            Personalized schedule based on your course enrollments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-40 font-mono text-[11px] uppercase tracking-widest bg-background">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {SEMESTERS.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-35 font-mono text-[11px] uppercase tracking-widest bg-background">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 p-4 flex items-start gap-3 rounded-(--radius)">
        <Bell className="size-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[10px] font-mono uppercase tracking-widest text-primary/80 leading-relaxed">
          Push notifications are enabled. You will be reminded 7 days, 3 days,
          and 1 day before each exam.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-32 border border-border/40 animate-pulse bg-card/20 border-dashed rounded-(--radius)"
              />
            ))}
          </motion.div>
        ) : allEntries.length > 0 ? (
          <motion.div
            key="layout"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)] gap-0 border border-border/50 rounded-(--radius) overflow-hidden"
          >
            <motion.div
              variants={itemVariants}
              className="lg:sticky lg:top-8 border-b lg:border-b-0 lg:border-r border-border/50 p-8 md:p-10 flex flex-col justify-between bg-card"
            >
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary block animate-pulse" />
                  Most Recent Exam
                </div>

                {mostRecentEntry ? (
                  <>
                    <h3 className="text-lg font-mono font-bold text-foreground uppercase tracking-widest mb-2">
                      {mostRecentEntry.courseCode}
                    </h3>
                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-8">
                      {mostRecentEntry.courseName}
                    </p>
                    <div className="text-7xl md:text-8xl font-black text-foreground font-mono tracking-tight leading-none mb-2">
                      {mostRecentDaysRemaining}
                    </div>
                    <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                      Days Remaining
                    </div>
                  </>
                ) : (
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    No upcoming exams
                  </div>
                )}
              </div>

              {mostRecentEntry && (
                <div className="mt-10 pt-6 border-t border-border/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-black text-foreground font-mono">
                        {formatDate(mostRecentEntry.scheduledAt).time}
                      </div>
                      <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mt-1">
                        Start Time
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-foreground font-mono">
                        {formatDuration(mostRecentEntry.durationMinutes || 120)}
                      </div>
                      <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mt-1">
                        Duration
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="lg:max-h-160 flex flex-col"
            >
              <div className="p-4 border-b border-border/50 bg-background/80 flex items-center gap-4 font-mono text-xs">
                <div className="w-6 h-6 border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 rounded-none">
                  Z
                </div>
                <div className="font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-primary block animate-pulse" />
                  Other Exams
                </div>
              </div>

              <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0">
                {otherEntries.length > 0 ? (
                  otherEntries.map((entry) => {
                    const dateInfo = formatDate(entry.scheduledAt);
                    const isPast =
                      new Date(entry.scheduledAt).getTime() < nowMs;
                    const displayLabel =
                      entry.label &&
                      entry.label.trim() !== entry.courseName.trim()
                        ? entry.label
                        : null;

                    return (
                      <motion.div
                        key={entry._id}
                        variants={itemVariants}
                        className={cn(
                          "grid grid-cols-1 md:grid-cols-[100px_minmax(0,1fr)_120px] border-b border-border/50 last:border-b-0 transition-all hover:border-primary/40 group overflow-hidden",
                          isPast
                            ? "opacity-60 grayscale"
                            : "bg-card/5 hover:bg-card/10",
                        )}
                      >
                        <div
                          className={cn(
                            "flex flex-row md:flex-col items-center justify-center p-4 gap-2 md:gap-0 border-r border-b md:border-b-0 border-border/40",
                            isPast
                              ? "bg-muted/10"
                              : "bg-primary/5 group-hover:bg-primary/10 transition-colors",
                          )}
                        >
                          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                            {dateInfo.day}
                          </span>
                          <span className="text-2xl font-black tracking-tighter leading-none">
                            {dateInfo.date}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                            {dateInfo.month}
                          </span>
                        </div>

                        <div className="p-5 md:p-6 flex flex-col gap-3 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-[9px] uppercase tracking-widest h-5 rounded-(--radius) border-border/40"
                            >
                              {entry.courseCode}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="font-mono text-[9px] uppercase tracking-widest h-5 rounded-(--radius) border-primary/30 text-primary/70"
                            >
                              {entry.examType}
                            </Badge>
                            {displayLabel && (
                              <Badge
                                variant="secondary"
                                className="font-mono text-[9px] uppercase tracking-widest h-5 rounded-(--radius) border-primary/20 bg-primary/10 text-primary"
                              >
                                {displayLabel}
                              </Badge>
                            )}
                          </div>

                          <h4 className="text-lg md:text-xl font-black tracking-tight uppercase leading-tight text-foreground">
                            {entry.courseName}
                          </h4>

                          <div className="flex flex-wrap gap-y-2 gap-x-5 text-sm text-muted-foreground font-mono">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary/80" />
                              <span>
                                {dateInfo.time} ·{" "}
                                {formatDuration(entry.durationMinutes || 120)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary/80" />
                              <span className="truncate">{entry.venue}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-l border-border/50 flex flex-col items-center justify-center px-4 py-6 text-center bg-background/60">
                          <div className="text-4xl font-black font-mono tracking-tight leading-none text-foreground">
                            {Math.max(
                              0,
                              Math.ceil(
                                (new Date(entry.scheduledAt).getTime() -
                                  nowMs) /
                                  (1000 * 60 * 60 * 24),
                              ),
                            )}
                          </div>
                          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mt-2">
                            Days
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                    <div className="size-12 border border-border/40 bg-muted/10 flex items-center justify-center rounded-(--radius) mb-4">
                      <Calendar className="size-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest">
                      No other exams
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mt-2 max-w-xs">
                      The most recent exam is the only upcoming entry right now.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/40 bg-card/20 gap-6 rounded-(--radius)"
          >
            <div className="size-16 border border-border/40 bg-muted/10 flex items-center justify-center rounded-(--radius)">
              <Calendar className="size-8 text-muted-foreground/40" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-black tracking-tighter uppercase">
                No exams scheduled
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 max-w-xs mx-auto">
                We couldn&apos;t find any published exam timetables for your
                enrolled courses in this period.
              </p>
            </div>
            <Link href="/app/courses">
              <Button
                variant="outline"
                size="sm"
                className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em]"
              >
                Manage Enrollments
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
