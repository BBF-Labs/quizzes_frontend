"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  X,
  ChevronRight,
  ChevronDown,
  Trash2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useAdminTimetables,
  useAdminCreateTimetable,
  useAdminPublishTimetable,
  useAdminAddTimetableEntry,
  useAdminRemoveTimetableEntry,
  useAdminCourses,
  useAdminSyncTimetable,
} from "@/hooks/admin/use-academics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// --- Create Timetable Form ---
function CreateTimetableForm({ onClose }: { onClose: () => void }) {
  const createMutation = useAdminCreateTimetable();
  const [form, setForm] = useState({
    semester: "1",
    academicYear: new Date().getFullYear().toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...form,
        isPublished: false,
        entries: [],
      });
      toast.success("Timetable created successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create timetable");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-primary/30 bg-primary/5 p-6 mb-8 rounded-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-primary">
          Initialize New Timetable
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground/50 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 block">
            Semester
          </label>
          <Select
            value={form.semester}
            onValueChange={(val) => setForm((f) => ({ ...f, semester: val }))}
          >
            <SelectTrigger className="w-full font-mono h-10 uppercase tracking-widest">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent className="font-mono uppercase tracking-widest">
              <SelectItem value="1">Semester 1</SelectItem>
              <SelectItem value="2">Semester 2</SelectItem>
              <SelectItem value="3">Semester 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 block">
            Academic Year
          </label>
          <Input
            placeholder="e.g. 2023/2024"
            value={form.academicYear}
            onChange={(e) =>
              setForm((f) => ({ ...f, academicYear: e.target.value }))
            }
            className="font-mono"
            required
          />
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="font-mono text-[10px] uppercase tracking-widest"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="font-mono text-[10px] uppercase tracking-widest"
          >
            {createMutation.isPending ? "Creating..." : "Create skeleton"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
// --- Sync Timetable Dialog ---
function SyncTimetableDialog({ onClose }: { onClose: () => void }) {
  const syncMutation = useAdminSyncTimetable();
  const [form, setForm] = useState({
    startDate: new Date().toISOString(),
    days: 7,
    semester: "Semester 1",
    academicYear: "2025-2026",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await syncMutation.mutateAsync(form);
      toast.success("Timetable synchronization completed");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Sync failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-primary/30 bg-primary/5 p-6 mb-8 rounded-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary animate-pulse" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-primary">
            Sync with University STS
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground/50 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 block">
            Start Date
          </label>
          <DateTimePicker
            date={new Date(form.startDate)}
            setDate={(date) =>
              setForm((f) => ({ ...f, startDate: date.toISOString() }))
            }
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 block">
            Days to Scrape
          </label>
          <Input
            type="number"
            value={form.days}
            onChange={(e) =>
              setForm((f) => ({ ...f, days: parseInt(e.target.value) }))
            }
            className="font-mono"
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 block">
            Semester
          </label>
          <Select
            value={form.semester}
            onValueChange={(val) => setForm((f) => ({ ...f, semester: val }))}
          >
            <SelectTrigger className="w-full font-mono h-10 uppercase tracking-widest">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent className="font-mono uppercase tracking-widest">
              <SelectItem value="Semester 1">Semester 1</SelectItem>
              <SelectItem value="Semester 2">Semester 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 block">
            Academic Year
          </label>
          <Input
            placeholder="e.g. 2025-2026"
            value={form.academicYear}
            onChange={(e) =>
              setForm((f) => ({ ...f, academicYear: e.target.value }))
            }
            className="font-mono"
            required
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="font-mono text-[10px] uppercase tracking-widest"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={syncMutation.isPending}
            className="font-mono text-[10px] uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
          >
            {syncMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 size-3 animate-spin" />
                Scraping...
              </>
            ) : (
              "Trigger Scraper"
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

// --- Add Entry Form ---
function AddEntryForm({
  timetableId,
  onAdded,
}: {
  timetableId: string;
  onAdded: () => void;
}) {
  const addMutation = useAdminAddTimetableEntry(timetableId);
  const [courseSearch, setCourseSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(courseSearch), 300);
    return () => clearTimeout(t);
  }, [courseSearch]);

  const { data: coursesData } = useAdminCourses({
    limit: 50,
    search: debouncedSearch,
  });
  const courses = coursesData?.data || [];

  const [form, setForm] = useState({
    courseId: "",
    scheduledAt: new Date().toISOString(),
    venues: [{ venue: "", indexStart: "", indexEnd: "" }],
    durationMinutes: 120,
    label: "",
  });

  const selectedCourse = courses.find((c) => c._id === form.courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseId) return toast.error("Please select a course");

    try {
      await addMutation.mutateAsync({
        courseId: form.courseId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        venues: form.venues.filter((v) => v.venue.trim() !== ""),
        durationMinutes: form.durationMinutes,
        label: form.label,
        courseCode: "", // Backend will populate
        courseName: "", // Backend will populate
      });
      toast.success("Entry added");
      setForm({
        courseId: "",
        scheduledAt: new Date().toISOString(),
        venues: [{ venue: "", indexStart: "", indexEnd: "" }],
        durationMinutes: 120,
        label: "",
      });
      setCourseSearch("");
      onAdded();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add entry");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-secondary/5 p-3 border border-border/40 rounded-md mb-4"
    >
      <div className="md:col-span-1">
        <label className="text-[9px] font-mono uppercase text-muted-foreground mb-1 block">
          Course
        </label>
        <Combobox
          value={form.courseId}
          onValueChange={(val) => {
            const courseId = val as string;
            setForm((f) => ({ ...f, courseId }));
            const course = courses.find((c) => c._id === courseId);
            if (course) setCourseSearch(`${course.code} - ${course.title}`);
          }}
        >
          <ComboboxInput
            placeholder="Search Course..."
            className="h-9 text-[11px] font-mono uppercase tracking-widest w-full"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
          />
          <ComboboxContent className="font-mono border-border/40">
            <ComboboxEmpty className="font-mono text-[10px] uppercase p-2">
              No courses found
            </ComboboxEmpty>
            <ComboboxList className="max-h-60 no-scrollbar">
              {courses.map((c: any) => (
                <ComboboxItem
                  key={c._id}
                  value={c._id}
                  className="text-[10px] uppercase tracking-tighter"
                >
                  <span className="font-bold text-primary mr-2">{c.code}</span>
                  <span className="truncate">{c.title}</span>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div>
        <label className="text-[9px] font-mono uppercase text-muted-foreground mb-1 block">
          Date & Time
        </label>
        <DateTimePicker
          date={new Date(form.scheduledAt)}
          setDate={(date) =>
            setForm((f) => ({ ...f, scheduledAt: date.toISOString() }))
          }
        />
      </div>
      <div className="md:col-span-1 space-y-2">
        <label className="text-[9px] font-mono uppercase text-muted-foreground block">
          Venues & Index Ranges
        </label>
        {form.venues.map((v, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              placeholder="Venue"
              value={v.venue}
              onChange={(e) => {
                const newVenues = [...form.venues];
                newVenues[idx].venue = e.target.value;
                setForm((f) => ({ ...f, venues: newVenues }));
              }}
              className="h-8 text-[10px] font-mono"
            />
            <Input
              placeholder="Start"
              value={v.indexStart}
              onChange={(e) => {
                const newVenues = [...form.venues];
                newVenues[idx].indexStart = e.target.value;
                setForm((f) => ({ ...f, venues: newVenues }));
              }}
              className="h-8 text-[10px] font-mono w-16"
            />
            <Input
              placeholder="End"
              value={v.indexEnd}
              onChange={(e) => {
                const newVenues = [...form.venues];
                newVenues[idx].indexEnd = e.target.value;
                setForm((f) => ({ ...f, venues: newVenues }));
              }}
              className="h-8 text-[10px] font-mono w-16"
            />
            {form.venues.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    venues: f.venues.filter((_, i) => i !== idx),
                  }))
                }
                className="text-destructive/50 hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setForm((f) => ({
              ...f,
              venues: [
                ...f.venues,
                { venue: "", indexStart: "", indexEnd: "" },
              ],
            }))
          }
          className="h-6 text-[8px] font-mono uppercase tracking-widest px-2"
        >
          <Plus className="size-3 mr-1" /> Add Venue
        </Button>
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[9px] font-mono uppercase text-muted-foreground mb-1 block">
            Batch / Label
          </label>
          <Input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            className="h-9 text-[11px] font-mono uppercase"
            placeholder="e.g. Batch 1"
          />
        </div>
        <div className="flex-1">
          <label className="text-[9px] font-mono uppercase text-muted-foreground mb-1 block">
            Duration (Min)
          </label>
          <Input
            type="number"
            value={form.durationMinutes}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                durationMinutes: parseInt(e.target.value),
              }))
            }
            className="h-9 text-[11px] font-mono"
            required
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={addMutation.isPending}
          className="h-9 px-3"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </form>
  );
}

// --- Timetable Row ---
function TimetableRow({ timetable }: { timetable: any }) {
  const [expanded, setExpanded] = useState(false);
  const publishMutation = useAdminPublishTimetable();
  const removeEntryMutation = useAdminRemoveTimetableEntry(timetable._id);

  const handlePublish = async () => {
    if (
      !confirm(
        "Are you sure you want to publish this timetable? This will notify enrolled students.",
      )
    )
      return;
    try {
      await publishMutation.mutateAsync(timetable._id);
      toast.success("Timetable published!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish");
    }
  };

  const handleRemoveEntry = async (entryId: string) => {
    try {
      await removeEntryMutation.mutateAsync(entryId);
      toast.success("Entry removed");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove entry");
    }
  };

  return (
    <div className="border border-border/40 rounded-lg overflow-hidden mb-4 bg-card/20">
      {/* Header Info */}
      <div
        className={cn(
          "px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-primary/5 transition-colors",
          expanded && "bg-primary/5 border-b border-border/40",
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
            <Calendar className="size-5 text-primary/70" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-mono font-bold uppercase tracking-wider">
                Semester {timetable.semester} — {timetable.academicYear}
              </h4>
              <Badge
                variant={timetable.isPublished ? "default" : "outline"}
                className={cn(
                  "text-[9px] uppercase tracking-tighter h-4",
                  timetable.isPublished
                    ? "bg-green-500/20 text-green-500 border-green-500/30"
                    : "bg-orange-500/20 text-orange-500 border-orange-500/30",
                )}
              >
                {timetable.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">
              {timetable.entries?.length || 0} Scheduled Exams
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!timetable.isPublished && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[10px] uppercase font-mono tracking-widest border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                handlePublish();
              }}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          )}
          {expanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-background/40">
              <AddEntryForm timetableId={timetable._id} onAdded={() => {}} />

              {timetable.entries && timetable.entries.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {timetable.entries
                    .sort((a: any, b: any) => {
                      const timeA = a.sessions?.[0]?.scheduledAt
                        ? new Date(a.sessions[0].scheduledAt).getTime()
                        : 0;
                      const timeB = b.sessions?.[0]?.scheduledAt
                        ? new Date(b.sessions[0].scheduledAt).getTime()
                        : 0;
                      return timeA - timeB;
                    })
                    .map((entry: any) => (
                      <div
                        key={entry._id}
                        className="border border-border/20 rounded overflow-hidden"
                      >
                        {/* Course Header */}
                        <div className="bg-secondary/5 px-4 py-2 border-b border-border/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono font-bold text-primary">
                              {entry.courseCode}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-60">
                              {entry.courseName}
                            </span>
                            {entry.isAutoSynced && (
                              <Badge
                                variant="outline"
                                className="h-4 text-[7px] uppercase tracking-[0.2em] py-0 border-primary/20 bg-primary/5 text-primary/60"
                              >
                                STS Synced
                              </Badge>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveEntry(entry._id)}
                            className="p-1 px-2 text-muted-foreground/40 hover:text-destructive transition-colors text-[9px] uppercase font-mono tracking-widest flex items-center gap-1"
                          >
                            <Trash2 className="size-3" /> Remove Course
                          </button>
                        </div>

                        {/* Sessions List */}
                        <div className="divide-y divide-border/10">
                          {entry.sessions?.map(
                            (session: any, sIdx: number) => (
                              <div
                                key={session.sessionId || sIdx}
                                className="grid grid-cols-12 items-center px-4 py-3 hover:bg-primary/5 transition-colors"
                              >
                                <div className="col-span-3 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                                  <span className="text-[10px] font-mono uppercase font-bold">
                                    {session.label || `Batch ${sIdx + 1}`}
                                  </span>
                                </div>
                                <div className="col-span-4 flex items-center gap-2">
                                  <Clock className="size-3 text-muted-foreground/50" />
                                  <span className="text-[10px] font-mono uppercase">
                                    {format(
                                      new Date(session.scheduledAt),
                                      "MMM d, HH:mm",
                                    )}
                                    <span className="ml-2 opacity-40">
                                      ({session.durationMinutes}m)
                                    </span>
                                  </span>
                                </div>
                                <div className="col-span-5 flex items-center gap-2 overflow-hidden">
                                  <MapPin className="size-3 text-muted-foreground/50 shrink-0" />
                                  <div className="flex flex-wrap gap-1">
                                    {session.venues?.map(
                                      (v: any, vIdx: number) => (
                                        <Badge
                                          key={vIdx}
                                          variant="outline"
                                          className="rounded-none bg-primary/5 text-[8px] font-mono py-0 px-1 border-primary/20"
                                        >
                                          {v.venue}{" "}
                                          {v.indexStart
                                            ? `(${v.indexStart}-${v.indexEnd})`
                                            : ""}
                                        </Badge>
                                      ),
                                    ) || (
                                      <span className="text-[10px] font-mono opacity-40 italic">
                                        No venues
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ),
                          ) || (
                            <div className="py-4 text-center text-[10px] font-mono opacity-40 italic">
                              No sessions found
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center bg-card/10 rounded-lg border border-dashed border-border/40">
                  <AlertCircle className="size-6 text-muted-foreground/30 mb-2" />
                  <p className="text-[10px] font-mono uppercase text-muted-foreground/40 tracking-widest">
                    No entries added yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Page ---
export default function AdminTimetablesPage() {
  const { data: timetables, isLoading } = useAdminTimetables();
  const [showCreate, setShowCreate] = useState(false);
  const [showSync, setShowSync] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="size-2 bg-primary" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground font-semibold">
              Academic Control
            </span>
          </div>
          <h1 className="text-3xl font-mono font-black uppercase tracking-tighter flex items-center gap-3">
            <Calendar className="size-8 text-primary" />
            Exam Timetables
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowSync(true)}
            className="rounded-none font-mono uppercase tracking-widest px-6 border-primary/30 text-primary hover:bg-primary/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Sync with STS
          </Button>
          <Button
            onClick={() => setShowCreate(true)}
            className="rounded-none font-mono uppercase tracking-widest px-6"
          >
            <Plus className="mr-2 h-4 w-4" /> Initialize
          </Button>
        </div>
      </div>

      {showSync && <SyncTimetableDialog onClose={() => setShowSync(false)} />}
      {showCreate && (
        <CreateTimetableForm onClose={() => setShowCreate(false)} />
      )}

      <div className="grid grid-cols-1">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse bg-card/40 border border-border/30 rounded-lg"
              />
            ))}
          </div>
        ) : timetables?.data?.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center space-y-4">
            <div className="size-16 rounded-full border border-dashed border-primary/30 flex items-center justify-center">
              <Calendar className="size-8 text-muted-foreground/20" />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-sm uppercase font-bold text-muted-foreground/80">
                No Timetables Found
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
                Initialize a new timetable to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {timetables?.data?.map((t: any) => (
              <TimetableRow key={t._id} timetable={t} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-8 border-t border-border/40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-green-500" />
            <span className="text-[9px] font-mono uppercase text-muted-foreground">
              Published: Students Notified
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-orange-500" />
            <span className="text-[9px] font-mono uppercase text-muted-foreground">
              Draft: Private to Admins
            </span>
          </div>
        </div>
        <p className="text-[9px] font-mono uppercase text-muted-foreground/30 px-2 border-l border-border/40">
          Timetables v1.0.4
        </p>
      </div>
    </div>
  );
}
