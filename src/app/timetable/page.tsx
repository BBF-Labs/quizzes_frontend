"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Search,
  CalendarClock,
  Clock,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  usePublicTimetables,
  type PublicVenue,
} from "@/hooks/use-public-exams";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaginationController } from "@/components/common/pagination-controller";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const VENUE_NOISE_PATTERN =
  /Exams\s+Calender|Search\s+Schedules|Schedule\s+Generator/i;

const formatDuration = (minutes: number) => {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

function PublicExamsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const search = searchParams.get("search") ?? "";
  const studentId = searchParams.get("studentId") ?? "";
  const pageSize = 10;
  const SEARCH_DEBOUNCE_MS = 200;

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const [localSearch, setLocalSearch] = useState(search);
  const [localStudentId, setLocalStudentId] = useState(studentId);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Immediate fetch of public data
  const { data, isFetching } = usePublicTimetables(
    search,
    studentId,
    page,
    pageSize,
  );

  // Sync local state with URL if URL changes (e.g. browser back button)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    setLocalStudentId(studentId);
  }, [studentId]);

  // Short debounce to keep typing smooth while still feeling immediate
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        updateQueryParams({
          search: localSearch.toUpperCase() || null,
          page: "1",
        });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [localSearch, search, updateQueryParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localStudentId !== studentId) {
        updateQueryParams({ studentId: localStudentId || null, page: "1" });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [localStudentId, studentId, updateQueryParams]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const allEntries = data?.entries ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const hasActiveFilters = Boolean(search || studentId);

  const nextExam = allEntries[0] ?? null;
  const nextExamDaysAway = nextExam
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextExam.scheduledAt).getTime() - nowMs) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <section className="py-20 md:py-28 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="text-center space-y-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-(--radius) border border-primary/20 bg-primary/5"
          >
            <div className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary/80">
              Official University Schedule
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black tracking-[-0.04em] text-foreground uppercase"
          >
            Exam Protocol
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-muted-foreground text-xs md:text-sm font-mono uppercase tracking-widest"
          >
            Timetable synced from university source with personalized venue
            match.
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10"
        >
          <div className="flex items-center bg-card border border-border/50 rounded-(--radius) overflow-hidden focus-within:border-primary/40 transition-colors">
            <Search className="ml-4 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search course code (e.g. DCIT313)"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="h-12 bg-transparent border-none font-mono text-sm placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center bg-card border border-border/50 rounded-(--radius) overflow-hidden focus-within:border-primary/40 transition-colors">
            <MapPin className="ml-4 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Student ID / Index Number"
              value={localStudentId}
              onChange={(e) => setLocalStudentId(e.target.value)}
              className="h-12 bg-transparent border-none font-mono text-sm placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
        </motion.div>

        <div className="h-px w-full bg-border/50 mb-10" />

        <AnimatePresence mode="wait">
          {allEntries.length > 0 ? (
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                "grid grid-cols-1 lg:grid-cols-3 gap-0 border border-border/50 rounded-(--radius) overflow-hidden transition-opacity duration-300",
                isFetching && "opacity-60 pointer-events-none",
              )}
            >
              <div className="border-b lg:border-b-0 lg:border-r border-border/50 p-8 md:p-10 flex flex-col justify-between bg-card">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary block animate-pulse" />
                    Next Exam
                  </div>

                  {nextExam ? (
                    <>
                      <h3 className="text-lg font-mono font-bold text-foreground uppercase tracking-widest mb-2">
                        {nextExam.courseCode}
                      </h3>
                      <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-8">
                        {nextExam.courseName}
                      </p>
                      <div className="text-7xl md:text-8xl font-black text-foreground font-mono tracking-tight leading-none mb-2">
                        {nextExamDaysAway}
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

                {nextExam && (
                  <div className="mt-10 pt-6 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-black text-foreground font-mono">
                          {format(new Date(nextExam.scheduledAt), "h:mm a")}
                        </div>
                        <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mt-1">
                          Start Time
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-foreground font-mono">
                          {formatDuration(nextExam.durationMinutes || 120)}
                        </div>
                        <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mt-1">
                          Duration
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-1 lg:col-span-2 lg:max-h-160 flex flex-col">
                <div className="p-4 border-b border-border/50 bg-background/80 flex items-center gap-4 font-mono text-xs">
                  <div className="w-6 h-6 border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 rounded-(--radius)">
                    Z
                  </div>
                  <div className="font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-primary block animate-pulse" />
                    Other Upcoming Entries
                  </div>
                </div>

                <div className="divide-y divide-border/50 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0">
                  {allEntries.map((entry, idx) => {
                    const sessDate = new Date(entry.scheduledAt);
                    return (
                      <motion.div
                        key={`${entry._id}-${idx}`}
                        variants={itemVariants}
                        className="flex hover:bg-secondary/10 transition-colors"
                      >
                        <div className="flex-1 p-8 md:p-10">
                          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                            {entry.courseCode} · {entry.semester} ·{" "}
                            {entry.academicYear}
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-mono font-bold text-foreground uppercase tracking-tight">
                              {entry.courseName}
                            </h4>
                            {entry.label && (
                              <Badge
                                variant="secondary"
                                className="rounded-(--radius) border-primary/20 bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-widest px-2 py-0.5"
                              >
                                {entry.label}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-y-2 gap-x-5 text-sm text-muted-foreground font-mono mb-4">
                            <div className="flex items-center gap-1.5">
                              <CalendarClock className="w-3.5 h-3.5 text-primary/80" />
                              <span>
                                {format(sessDate, "eee dd MMM yyyy")} ·{" "}
                                {format(sessDate, "h:mm a")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary/80" />
                              <span>
                                {formatDuration(entry.durationMinutes || 120)}
                              </span>
                            </div>
                          </div>

                          {entry.assignedVenue && (
                            <div className="bg-primary/5 p-3 flex items-center gap-3 border border-primary/10 rounded-(--radius) mb-4">
                              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="text-xs font-mono text-primary uppercase tracking-wider">
                                Your venue: {entry.assignedVenue}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-4">
                            {entry.venues
                              .filter(
                                (v: PublicVenue) =>
                                  !VENUE_NOISE_PATTERN.test(v.venue),
                              )
                              .map((v: PublicVenue, vIdx: number) => (
                                <Badge
                                  key={vIdx}
                                  variant="outline"
                                  className="rounded-(--radius) border-border/50 bg-background font-mono text-[10px] py-1 px-3"
                                >
                                  {v.venue}
                                  {v.indexStart && (
                                    <span className="ml-2 opacity-70">
                                      [{v.indexStart}-{v.indexEnd}]
                                    </span>
                                  )}
                                </Badge>
                              ))}
                          </div>
                        </div>

                        <div className="border-l border-border/50 flex flex-col items-center justify-center px-8 min-w-30 text-center">
                          <div className="text-5xl md:text-6xl font-black font-mono tracking-tight leading-none text-foreground">
                            {Math.max(
                              0,
                              Math.ceil(
                                (sessDate.getTime() - nowMs) /
                                  (1000 * 60 * 60 * 24),
                              ),
                            )}
                          </div>
                          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mt-2">
                            days
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : isFetching ? (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-border/50 rounded-(--radius) bg-card"
            >
              <div className="mx-auto mb-4 size-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <h3 className="text-lg font-mono font-bold uppercase text-foreground">
                Searching timetable...
              </h3>
              <p className="text-sm font-mono text-muted-foreground mt-2">
                Please wait while we fetch matching schedules.
              </p>
            </motion.div>
          ) : hasActiveFilters ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-border/50 rounded-(--radius) bg-card"
            >
              <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-mono font-bold uppercase text-muted-foreground">
                No matching timetable entries found
              </h3>
              <p className="text-sm font-mono text-muted-foreground mt-2">
                Try a different course code or student ID.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="mt-6 border border-border/50 border-t-0">
            <PaginationController
              page={page}
              totalPages={totalPages}
              onPageChange={(nextPage) =>
                updateQueryParams({ page: String(nextPage) })
              }
              className="border-0"
            />
          </div>
        )}
        <footer className="mt-10 pt-6 border-t border-border/50 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] font-semibold">
            &copy; 2026 University of Ghana · Powered by Qz Platform
          </p>
        </footer>
      </div>
    </section>
  );
}

export default function PublicExamsPage() {
  return (
    <Suspense
      fallback={
        <section className="py-20 md:py-28 bg-background border-b border-border/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-(--radius) bg-card border border-border/50 animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>
      }
    >
      <PublicExamsContent />
    </Suspense>
  );
}
