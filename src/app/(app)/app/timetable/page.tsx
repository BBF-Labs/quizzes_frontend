"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock, MapPin, Bell, AlertCircle } from "lucide-react";
import { useMyTimetable } from "@/hooks/app/use-timetable";
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

const formatDuration = (minutes: number) => {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours}h`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export default function TimetablePage() {
  const [selectedSemester, setSelectedSemester] = useState("Semester 1");
  const [selectedYear, setSelectedYear] = useState("2025-2026");
  const [nowMs, setNowMs] = useState(() => Date.now());

  const { data: timetables = [], isLoading } = useMyTimetable(
    selectedSemester,
    selectedYear,
  );

  const allEntries = useMemo(() => {
    return timetables
      .flatMap((t) => t.entries)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
  }, [timetables]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      date: d.getDate(),
      month: d.toLocaleDateString(undefined, { month: "short" }),
      time: d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
      full: d.toLocaleDateString(undefined, { dateStyle: "medium" }),
    };
  };

  return (
    <div className="flex flex-col gap-8 py-8 px-4 md:px-8 max-w-7xl mx-auto min-h-[calc(100dvh-3.5rem)]">
      {/* Header */}
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
            <SelectTrigger className="w-[160px] font-mono text-[11px] uppercase tracking-widest bg-background">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {SEMESTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px] font-mono text-[11px] uppercase tracking-widest bg-background">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
        <Bell className="size-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-primary/80 leading-relaxed">
          Push notifications are enabled. You will be reminded 7 days, 3 days,
          and 1 day before each exam.
        </p>
      </div>

      {/* Timetable List */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 border border-border/40 animate-pulse bg-card/20 border-dashed"
              />
            ))}
          </motion.div>
        ) : allEntries.length > 0 ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {allEntries.map((entry) => {
              const dateInfo = formatDate(entry.scheduledAt);
              const isPast = new Date(entry.scheduledAt).getTime() < nowMs;

              return (
                <div
                  key={entry._id}
                  className={cn(
                    "flex flex-col sm:flex-row border transition-all hover:border-primary/40 group overflow-hidden h-full",
                    isPast
                      ? "opacity-60 grayscale border-border/40"
                      : "border-border/60 bg-card/10 shadow-sm shadow-primary/2",
                  )}
                >
                  {/* Date Column */}
                  <div
                    className={cn(
                      "w-full sm:w-28 flex flex-row sm:flex-col items-center justify-center p-4 gap-2 sm:gap-0 border-b sm:border-b-0 sm:border-r border-border/40",
                      isPast
                        ? "bg-muted/10"
                        : "bg-primary/5 group-hover:bg-primary/10 transition-colors",
                    )}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                      {dateInfo.day}
                    </span>
                    <span className="text-3xl font-black tracking-tighter leading-none">
                      {dateInfo.date}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                      {dateInfo.month}
                    </span>
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px] uppercase tracking-widest h-5 rounded-none border-border/40"
                        >
                          {entry.courseCode}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px] uppercase tracking-widest h-5 rounded-none border-primary/30 text-primary/70"
                        >
                          {entry.examType}
                        </Badge>
                        {isPast && (
                          <Badge
                            variant="secondary"
                            className="font-mono text-[8px] uppercase tracking-widest h-5 rounded-none"
                          >
                            Completed
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-black tracking-tight uppercase leading-tight">
                        {entry.courseName}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 lg:flex lg:items-center gap-6 lg:gap-12 xl:gap-20">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-muted-foreground/50">
                          <Clock className="size-3" />
                          <span className="text-[8px] font-mono uppercase tracking-widest">
                            Time / Dur.
                          </span>
                        </div>
                        <p className="text-[11px] font-mono font-bold uppercase truncate">
                          {dateInfo.time}{" "}
                          <span className="text-muted-foreground/40 font-normal">
                            / {formatDuration(entry.durationMinutes)}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-muted-foreground/50">
                          <MapPin className="size-3" />
                          <span className="text-[8px] font-mono uppercase tracking-widest">
                            Venue
                          </span>
                        </div>
                        <p className="text-[11px] font-mono font-bold uppercase truncate">
                          {entry.venue}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info Trigger */}
                  <div className="hidden lg:flex items-center justify-center px-6 border-l border-border/40">
                    <button
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      title="Exam Details"
                    >
                      <AlertCircle className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/40 bg-card/20 gap-6"
          >
            <div className="size-16 border border-border/40 bg-muted/10 flex items-center justify-center">
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
