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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SEMESTERS = ["Semester 1", "Semester 2", "Summer Session"];
const ACADEMIC_YEARS = ["2023-2024", "2024-2025", "2025-2026"];

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
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  const [selectedCourses, setSelectedCourses] = useState<ICourse[]>([]);

  const handleEnroll = async () => {
    if (selectedCourseIds.size === 0) return;
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

  return (
    <div className="flex flex-col gap-8 py-8 px-4 md:px-8 max-w-7xl mx-auto min-h-[calc(100dvh-3.5rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            My Courses
          </h1>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
            Manage your academic enrollments for notifications and timetables.
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

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="font-mono text-[10px] uppercase tracking-[0.2em] gap-2"
              >
                <Plus className="size-3" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-black tracking-tighter uppercase">
                  Add Course
                </DialogTitle>
                <DialogDescription className="font-mono text-[11px] uppercase tracking-widest leading-relaxed">
                  Search for a course to add to your semester enrollment.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                      Select Course
                    </label>
                    <div className="space-y-4">
                      {/* Selection Summary at Top */}
                      <AnimatePresence>
                        {selectedCourses.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-2 pb-4 border-b border-border/20">
                              {selectedCourses.map((c) => (
                                <motion.div
                                  layout
                                  key={c._id}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.8, opacity: 0 }}
                                  className="flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/30 rounded text-[10px] font-mono uppercase tracking-[0.1em] group/chip"
                                >
                                  <span className="text-primary font-bold">{c.code}</span>
                                  <button
                                    onClick={() => {
                                      setSelectedCourseIds((prev) => {
                                        const next = new Set(prev);
                                        next.delete(c._id);
                                        return next;
                                      });
                                      setSelectedCourses((prev) => prev.filter(x => x._id !== c._id));
                                    }}
                                    className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                                  >
                                    <X className="size-2.5 text-primary" />
                                  </button>
                                </motion.div>
                              ))}
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => {
                                  setSelectedCourseIds(new Set());
                                  setSelectedCourses([]);
                                }}
                                className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground hover:text-destructive h-6"
                              >
                                Clear All
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Integrated Search Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                          placeholder="SEARCH BY COURSE CODE OR TITLE..."
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          className="pl-9 font-mono text-[10px] uppercase tracking-[0.2em] bg-zinc-900/30 h-10 border-border/40 focus:border-primary/50 transition-colors"
                          autoFocus
                        />
                      </div>

                      {/* Integrated Scrollable List */}
                      <div className="border border-border/40 rounded-md bg-zinc-950/20 overflow-hidden">
                        <div className="max-h-[320px] overflow-y-auto no-scrollbar py-2 px-2 space-y-1">
                          {isSearching && searchResults.length === 0 ? (
                            <div className="py-16 text-center space-y-3">
                              <Loader2 className="size-5 animate-spin mx-auto text-primary" />
                              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
                                Indexing Platform...
                              </p>
                            </div>
                          ) : searchResults.length === 0 ? (
                            <div className="py-16 text-center">
                              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground/60">
                                No Matching Courses Found
                              </p>
                            </div>
                          ) : (
                            searchResults.map((c) => {
                              const isAlreadyEnrolled = enrollments.some(
                                (e) =>
                                  e.courseId?._id === c._id &&
                                  e.semester === selectedSemester &&
                                  e.academicYear === selectedYear
                              );
                              const isSelected = selectedCourseIds.has(c._id);

                              return (
                                <button
                                  key={c._id}
                                  disabled={isAlreadyEnrolled}
                                  onClick={() => {
                                    if (isAlreadyEnrolled) return;
                                    setSelectedCourseIds((prev) => {
                                      const next = new Set(prev);
                                      if (isSelected) {
                                        next.delete(c._id);
                                      } else {
                                        next.add(c._id);
                                      }
                                      return next;
                                    });
                                    setSelectedCourses((prev) => {
                                      if (isSelected) {
                                        return prev.filter((x) => x._id !== c._id);
                                      } else {
                                        return [...prev, c];
                                      }
                                    });
                                  }}
                                  className={cn(
                                    "w-full text-left p-3 rounded transition-all duration-200 group/item relative",
                                    isAlreadyEnrolled
                                      ? "opacity-50 cursor-not-allowed bg-zinc-900/20"
                                      : isSelected
                                      ? "bg-primary/5 border border-primary/20 shadow-[0_0_15px_-5px_rgba(var(--primary-rgb),0.2)]"
                                      : "hover:bg-zinc-900/50 border border-transparent"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                      <span
                                        className={cn(
                                          "font-bold text-[11px] font-mono uppercase tracking-widest transition-colors",
                                          isAlreadyEnrolled
                                            ? "text-muted-foreground"
                                            : isSelected
                                            ? "text-primary"
                                            : "text-foreground/90 group-hover/item:text-foreground"
                                        )}
                                      >
                                        {c.code}
                                      </span>
                                      <span className="text-[9px] text-muted-foreground/70 truncate font-mono uppercase tracking-tighter group-hover/item:text-muted-foreground transition-colors">
                                        {c.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {isAlreadyEnrolled && (
                                        <div className="px-1.5 py-0.5 rounded-sm bg-zinc-800 border border-border/20 text-[7px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                                          Synced
                                        </div>
                                      )}
                                      {isSelected && !isAlreadyEnrolled && (
                                        <motion.div
                                          initial={{ scale: 0.5, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          className="size-4 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                                        >
                                          <Check className="size-2.5 text-black stroke-[3]" />
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={selectedCourseIds.size === 0 || enrollMutation.isPending}
                  onClick={handleEnroll}
                  className="w-full font-mono text-[11px] uppercase tracking-widest"
                >
                  {enrollMutation.isPending
                    ? "Enrolling..."
                    : selectedCourseIds.size > 1
                      ? `Enroll in ${selectedCourseIds.size} Courses`
                      : "Enroll in Course"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {isEnrollmentsLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 border border-border/40 bg-card/20 animate-pulse border-dashed"
              />
            ))}
          </motion.div>
        ) : enrollments.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {enrollments.map((enrollment) => (
              <Card
                key={enrollment._id}
                className="group overflow-hidden border-border/40 hover:border-primary/40 bg-card/30 transition-all flex flex-col hover:shadow-lg hover:shadow-primary/5"
              >
                <CardHeader className="relative pb-0">
                  <div className="absolute top-4 right-4 translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => {
                        if (!enrollment.courseId?._id) return;
                        unenrollMutation.mutate({
                          courseId: enrollment.courseId._id,
                          semester: enrollment.semester,
                          academicYear: enrollment.academicYear,
                        });
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Unenroll"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span className="text-[9px] font-mono text-primary uppercase tracking-[0.2em]">
                      Enrolled
                    </span>
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight uppercase line-clamp-2 leading-tight">
                    {enrollment.courseId?.title || "Unknown Course"}
                  </CardTitle>
                  <CardDescription className="font-mono text-[10px] uppercase tracking-widest">
                    {enrollment.courseId?.code || "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/60 block">
                        Semester
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase">
                        {enrollment.semester}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/60 block">
                        Academic Year
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase">
                        {enrollment.academicYear}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 bg-secondary/5 border-t border-border/20 py-3">
                  <Link
                    href={enrollment.courseId?._id ? `/app/courses/${enrollment.courseId._id}` : "#"}
                    className={cn(
                      "w-full flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors",
                      enrollment.courseId?._id ? "hover:text-primary" : "cursor-not-allowed opacity-50"
                    )}
                  >
                    Course Content
                    <ChevronRight className="size-3" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/40 bg-card/20 gap-6"
          >
            <div className="size-16 border border-border/40 bg-muted/10 flex items-center justify-center">
              <BookOpen className="size-8 text-muted-foreground/40" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-black tracking-tighter uppercase">
                No courses found
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 max-w-xs mx-auto">
                Stay organized by keeping track of your current courses. Declare
                your enrollment to unlock personalized exam schedules.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em]"
            >
              + Start Enrollment
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
