"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  ChevronRight,
  Loader2,
  Check,
  X,
} from "lucide-react";
import {
  useMyCourses,
  useEnrollInCourse,
  useUnenrollFromCourse,
} from "@/hooks/app/use-user-courses";
import { ICourse, useCourseSearch } from "@/hooks/common/use-courses";
import { useDebounce } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const SEMESTERS = ["Semester 1", "Semester 2", "Summer Session"];
const ACADEMIC_YEARS = ["2024-2025", "2025-2026", "2026-2027"];

export default function MyCoursesPage() {
  const [selectedSemester, setSelectedSemester] = useState("Semester 1");
  const [selectedYear, setSelectedYear] = useState("2025-2026");

  const { data: enrollments = [], isLoading: isEnrollmentsLoading } =
    useMyCourses();
  const enrollMutation = useEnrollInCourse();
  const unenrollMutation = useUnenrollFromCourse();

  const [courseSearch, setCourseSearch] = useState("");
  const debouncedSearch = useDebounce(courseSearch, 400);
  const { data: searchResults = [], isLoading: isSearching } =
    useCourseSearch(debouncedSearch);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCourses, setSelectedCourses] = useState<ICourse[]>([]);

  const totalCount = enrollments.length;
  const selectedCount = selectedCourseIds.size;

  const handleEnroll = async () => {
    if (selectedCount === 0) return;
    try {
      const enrollmentPromises = Array.from(selectedCourseIds).map((courseId) =>
        enrollMutation.mutateAsync({
          courseId,
          semester: selectedSemester,
          academicYear: selectedYear,
        }),
      );
      await Promise.all(enrollmentPromises);
      setIsAddDialogOpen(false);
      setSelectedCourseIds(new Set());
      setSelectedCourses([]);
      setCourseSearch("");
    } catch (err: any) {
      // Error handling is likely done via global toast
    }
  };

  // Current term enrollment count for stat strip
  const currentTermCount = useMemo(
    () =>
      enrollments.filter(
        (e) =>
          e.semester === selectedSemester &&
          e.academicYear === selectedYear,
      ).length,
    [enrollments, selectedSemester, selectedYear],
  );

  return (
    <div className="qz-app min-h-full bg-[#F7F9FC] text-slate-900 antialiased">
      {/* Header / Hero — mirrors library and quizzes pages */}
      <header className="border-b border-slate-200 bg-white px-6 pt-8 pb-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              My Library
            </p>
            <h1 className="display mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Your courses.
            </h1>
            <p className="hand mt-1 text-xl text-[#0C60FC]">
              keep your term in sync ✦
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              {totalCount} total
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[#0C60FC]">
              {currentTermCount} this term
            </span>
          </div>
        </div>

        {/* Term picker + Add Course row */}
        <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 w-20 shrink-0">
                Semester
              </span>
              {SEMESTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSemester(s)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-bold transition",
                    selectedSemester === s
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 w-20 shrink-0">
                Year
              </span>
              {ACADEMIC_YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setSelectedYear(y)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-bold transition",
                    selectedYear === y
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            className="squishy group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Course</span>
          </button>
        </div>
      </header>

      {/* Grid */}
      <section className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {isEnrollmentsLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#0C60FC]" />
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Loading your courses…
              </p>
            </div>
          ) : enrollments.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {enrollments.map((enrollment) => (
                  <CourseCard
                    key={enrollment._id}
                    title={enrollment.courseId?.title || "Unknown Course"}
                    code={enrollment.courseId?.code || "N/A"}
                    semester={enrollment.semester}
                    academicYear={enrollment.academicYear}
                    href={
                      enrollment.courseId?._id
                        ? `/app/courses/${enrollment.courseId._id}`
                        : "#"
                    }
                    onUnenroll={() => {
                      if (!enrollment.courseId?._id) return;
                      unenrollMutation.mutate({
                        courseId: enrollment.courseId._id,
                        semester: enrollment.semester,
                        academicYear: enrollment.academicYear,
                      });
                    }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20">
              <BookOpen className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No courses yet</p>
              <p className="mt-1 max-w-sm text-center text-xs font-semibold text-slate-500">
                Stay organized by tracking the courses you're taking this term —
                we'll wire them into exam reminders and timetables for you.
              </p>
              <button
                type="button"
                onClick={() => setIsAddDialogOpen(true)}
                className="squishy mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC]"
              >
                <Plus className="h-4 w-4" />
                Add your first course
              </button>
            </div>
          )}
        </div>
      </section>

      {!isEnrollmentsLoading && enrollments.length > 0 && (
        <p className="pb-10 text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          showing {enrollments.length} enrolled{" "}
          {enrollments.length === 1 ? "course" : "courses"}
        </p>
      )}

      {/* Add Course Dialog — matches landing dropdown identity-block styling */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-xl ring-1 ring-black/5">
          <div className="border-b border-slate-100 px-6 py-4">
            <DialogTitle className="text-base font-bold text-slate-900">
              Add Course
            </DialogTitle>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">
              Search the catalog and pick the courses you're taking this{" "}
              <span className="font-extrabold text-[#0C60FC]">
                {selectedSemester} · {selectedYear}
              </span>
              .
            </p>
          </div>

          {/* Selected chips */}
          {selectedCourses.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-[#F7F9FC] px-6 py-3">
              {selectedCourses.map((c) => (
                <motion.span
                  layout
                  key={c._id}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-[#0C60FC] ring-1 ring-blue-100"
                >
                  {c.code}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourseIds((prev) => {
                        const next = new Set(prev);
                        next.delete(c._id);
                        return next;
                      });
                      setSelectedCourses((prev) =>
                        prev.filter((x) => x._id !== c._id),
                      );
                    }}
                    className="rounded-full p-0.5 transition hover:bg-blue-100"
                    aria-label={`Remove ${c.code}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSelectedCourseIds(new Set());
                  setSelectedCourses([]);
                }}
                className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition"
              >
                Clear
              </button>
            </div>
          )}

          {/* Search */}
          <div className="px-6 pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search by course code or title…"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                autoFocus
              />
              {courseSearch && (
                <button
                  type="button"
                  onClick={() => setCourseSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Result list */}
          <div className="mt-3 max-h-72 overflow-y-auto px-3 pb-3 no-scrollbar">
            {isSearching && searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#0C60FC]" />
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Searching catalog…
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <BookOpen className="mb-2 h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">
                  No matching courses
                </p>
                <p className="mt-1 max-w-xs text-center text-[11px] font-semibold text-slate-500">
                  Try a different course code or title.
                </p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {searchResults.map((c) => {
                  const isAlreadyEnrolled = enrollments.some(
                    (e) =>
                      e.courseId?._id === c._id &&
                      e.semester === selectedSemester &&
                      e.academicYear === selectedYear,
                  );
                  const isSelected = selectedCourseIds.has(c._id);

                  return (
                    <li key={c._id}>
                      <button
                        type="button"
                        disabled={isAlreadyEnrolled}
                        onClick={() => {
                          if (isAlreadyEnrolled) return;
                          setSelectedCourseIds((prev) => {
                            const next = new Set(prev);
                            if (isSelected) next.delete(c._id);
                            else next.add(c._id);
                            return next;
                          });
                          setSelectedCourses((prev) =>
                            isSelected
                              ? prev.filter((x) => x._id !== c._id)
                              : [...prev, c],
                          );
                        }}
                        className={cn(
                          "group flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left transition",
                          isAlreadyEnrolled
                            ? "cursor-not-allowed bg-slate-50 opacity-60"
                            : isSelected
                              ? "bg-blue-50 ring-1 ring-blue-200"
                              : "hover:bg-slate-50",
                        )}
                      >
                        <div className="flex min-w-0 flex-col">
                          <span
                            className={cn(
                              "text-xs font-bold",
                              isSelected ? "text-[#0C60FC]" : "text-slate-800",
                            )}
                          >
                            {c.code}
                          </span>
                          <span className="truncate text-[11px] font-semibold text-slate-500">
                            {c.title}
                          </span>
                        </div>
                        {isAlreadyEnrolled ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                            Enrolled
                          </span>
                        ) : isSelected ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0C60FC]">
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
            <p className="text-[11px] font-semibold text-slate-500">
              {selectedCount === 0 ? (
                "Pick at least one course to enroll."
              ) : (
                <>
                  {selectedCount}{" "}
                  {selectedCount === 1 ? "course" : "courses"} selected for{" "}
                  <span className="font-extrabold text-slate-700">
                    {selectedSemester}
                  </span>
                </>
              )}
            </p>
            <button
              type="button"
              disabled={selectedCount === 0 || enrollMutation.isPending}
              onClick={handleEnroll}
              className={cn(
                "squishy inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-extrabold shadow-sm transition",
                selectedCount === 0 || enrollMutation.isPending
                  ? "bg-slate-200 text-slate-400"
                  : "bg-slate-950 text-white hover:bg-[#0C60FC]",
              )}
            >
              {enrollMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Enrolling…
                </>
              ) : (
                <>
                  Enroll
                  {selectedCount > 1 ? ` (${selectedCount})` : ""}
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Course card ─────────────────────────────────────────────────────────────

function CourseCard({
  title,
  code,
  semester,
  academicYear,
  href,
  onUnenroll,
}: {
  title: string;
  code: string;
  semester: string;
  academicYear: string;
  href: string;
  onUnenroll: () => void;
}) {
  const disabled = href === "#";
  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex flex-col rounded-[26px] bg-white p-5 shadow-[0_8px_28px_-12px_rgba(15,23,42,.12)] ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-slate-300"
    >
      <button
        type="button"
        onClick={onUnenroll}
        className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label={`Unenroll from ${title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#0C60FC]">
          {code}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Enrolled
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-tight text-slate-900">
        {title}
      </h3>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
            Semester
          </p>
          <p className="mt-1 text-xs font-bold text-slate-700">{semester}</p>
        </div>
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
            Academic year
          </p>
          <p className="mt-1 text-xs font-bold text-slate-700">
            {academicYear}
          </p>
        </div>
      </div>

      <Link
        href={href}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "mt-5 flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs font-extrabold transition",
          disabled
            ? "pointer-events-none bg-slate-50 text-slate-300"
            : "bg-slate-50 text-slate-700 hover:bg-[#0C60FC] hover:text-white",
        )}
      >
        Course content
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}
