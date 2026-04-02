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
} from "lucide-react";
import {
  useMyCourses,
  useEnrollInCourse,
  useUnenrollFromCourse,
} from "@/hooks/app/use-user-courses";
import { useCourseSearch } from "@/hooks/common/use-courses";
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
    useMyCourses(selectedSemester, selectedYear);
  const enrollMutation = useEnrollInCourse();
  const unenrollMutation = useUnenrollFromCourse();

  const [courseSearch, setCourseSearch] = useState("");
  const debouncedSearch = useDebounce(courseSearch, 400);
  const { data: searchResults = [], isLoading: isSearching } =
    useCourseSearch(debouncedSearch);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (!selectedCourseId) return;
    await enrollMutation.mutateAsync({
      courseId: selectedCourseId,
      semester: selectedSemester,
      academicYear: selectedYear,
    });
    setIsAddDialogOpen(false);
    setSelectedCourseId(null);
    setCourseSearch("");
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
              <div className="py-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Course code or title..."
                    value={courseSearch}
                    onChange={(e) => {
                      setCourseSearch(e.target.value);
                      setSelectedCourseId(null);
                    }}
                    className="pl-10 font-mono text-sm"
                  />
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-2 no-scrollbar">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="size-4 animate-spin text-primary" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => setSelectedCourseId(c._id)}
                        className={cn(
                          "w-full text-left p-3 border transition-all flex flex-col gap-1",
                          selectedCourseId === c._id
                            ? "border-primary bg-primary/5"
                            : "border-border/40 hover:border-primary/40 hover:bg-muted/50",
                        )}
                      >
                        <span className="font-mono text-[11px] font-bold uppercase truncate">
                          {c.title}
                        </span>
                        <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                          {c.code}
                        </span>
                      </button>
                    ))
                  ) : courseSearch.length >= 2 ? (
                    <p className="text-center py-4 text-[10px] font-mono text-muted-foreground uppercase">
                      No courses found
                    </p>
                  ) : (
                    <p className="text-center py-4 text-[10px] font-mono text-muted-foreground uppercase">
                      Start typing to search
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={!selectedCourseId || enrollMutation.isPending}
                  onClick={handleEnroll}
                  className="w-full font-mono text-[11px] uppercase tracking-widest"
                >
                  {enrollMutation.isPending
                    ? "Enrolling..."
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
                      onClick={() =>
                        unenrollMutation.mutate({
                          courseId: enrollment.courseId._id,
                          semester: enrollment.semester,
                          academicYear: enrollment.academicYear,
                        })
                      }
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
                    {enrollment.courseId.title}
                  </CardTitle>
                  <CardDescription className="font-mono text-[10px] uppercase tracking-widest">
                    {enrollment.courseId.code}
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
                    href={`/app/courses/${enrollment.courseId._id}`}
                    className="w-full flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
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
