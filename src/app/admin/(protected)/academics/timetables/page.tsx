"use client";

import { useState } from "react";
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
  AlertCircle
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
} from "@/hooks/admin/use-academics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
        <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-primary">Initialize New Timetable</h3>
        <button onClick={onClose} className="text-muted-foreground/50 hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 block">Semester</label>
          <Input
            type="number"
            min={1}
            max={2}
            value={form.semester}
            onChange={(e) => setForm(f => ({ ...f, semester: e.target.value }))}
            className="font-mono"
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5 block">Academic Year</label>
          <Input
            placeholder="e.g. 2023/2024"
            value={form.academicYear}
            onChange={(e) => setForm(f => ({ ...f, academicYear: e.target.value }))}
            className="font-mono"
            required
          />
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="font-mono text-[10px] uppercase tracking-widest">
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending} className="font-mono text-[10px] uppercase tracking-widest">
            {createMutation.isPending ? "Creating..." : "Create skeleton"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

// --- Add Entry Form ---
function AddEntryForm({ timetableId, onAdded }: { timetableId: string; onAdded: () => void }) {
  const addMutation = useAdminAddTimetableEntry(timetableId);
  const { data: coursesData } = useAdminCourses({ limit: 100 });
  const courses = coursesData?.data || [];

  const [form, setForm] = useState({
    courseId: "",
    scheduledAt: "",
    venue: "",
    durationMinutes: 120,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseId) return toast.error("Please select a course");
    
    try {
      await addMutation.mutateAsync({
        courseId: form.courseId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        venue: form.venue,
        durationMinutes: form.durationMinutes,
        courseCode: "", // Backend will populate
        courseName: "", // Backend will populate
      });
      toast.success("Entry added");
      setForm({ courseId: "", scheduledAt: "", venue: "", durationMinutes: 120 });
      onAdded();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add entry");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-secondary/5 p-3 border border-border/40 rounded-md mb-4">
      <div className="md:col-span-1">
        <label className="text-[9px] font-mono uppercase text-muted-foreground mb-1 block">Course</label>
        <select
          value={form.courseId}
          onChange={(e) => setForm(f => ({ ...f, courseId: e.target.value }))}
          className="w-full bg-background border border-border/50 text-[11px] h-9 px-2 font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
          required
        >
          <option value="">Select Course</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.code} - {c.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[9px] font-mono uppercase text-muted-foreground mb-1 block">Date & Time</label>
        <Input
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
          className="h-9 text-[11px] font-mono"
          required
        />
      </div>
      <div>
        <label className="text-[9px] font-mono uppercase text-muted-foreground mb-1 block">Venue</label>
        <Input
          placeholder="Hall 1 / LT 2"
          value={form.venue}
          onChange={(e) => setForm(f => ({ ...f, venue: e.target.value }))}
          className="h-9 text-[11px] font-mono"
          required
        />
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[9px] font-mono uppercase text-muted-foreground mb-1 block">Duration (Min)</label>
          <Input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) }))}
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
    if (!confirm("Are you sure you want to publish this timetable? This will notify enrolled students.")) return;
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
          expanded && "bg-primary/5 border-b border-border/40"
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
              <Badge variant={timetable.isPublished ? "default" : "outline"} className={cn(
                "text-[9px] uppercase tracking-tighter h-4",
                timetable.isPublished ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-orange-500/20 text-orange-500 border-orange-500/30"
              )}>
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
          {expanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
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
                <div className="space-y-2 mt-4">
                  <div className="grid grid-cols-12 px-3 py-2 text-[9px] font-mono uppercase text-muted-foreground tracking-widest border-b border-border/20">
                    <div className="col-span-3">Course</div>
                    <div className="col-span-3">Date & Time</div>
                    <div className="col-span-3">Venue</div>
                    <div className="col-span-2 text-center">Duration</div>
                    <div className="col-span-1"></div>
                  </div>
                  {timetable.entries.sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).map((entry: any) => (
                    <div key={entry._id} className="grid grid-cols-12 items-center px-3 py-2 border border-border/20 rounded hover:bg-primary/5 transition-colors">
                      <div className="col-span-3">
                        <p className="text-[11px] font-mono font-bold text-primary">{entry.courseId?.code || "???"}</p>
                        <p className="text-[9px] font-mono text-muted-foreground truncate">{entry.courseId?.title || "Unknown Course"}</p>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <Clock className="size-3 text-muted-foreground/50" />
                        <span className="text-[10px] font-mono uppercase">{format(new Date(entry.scheduledAt), "MMM d, HH:mm")}</span>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <MapPin className="size-3 text-muted-foreground/50" />
                        <span className="text-[10px] font-mono uppercase truncate">{entry.venue || "N/A"}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-[10px] font-mono opacity-60">{entry.durationMinutes}m</span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button 
                          onClick={() => handleRemoveEntry(entry._id)}
                          className="p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center bg-card/10 rounded-lg border border-dashed border-border/40">
                   <AlertCircle className="size-6 text-muted-foreground/30 mb-2" />
                   <p className="text-[10px] font-mono uppercase text-muted-foreground/40 tracking-widest">No entries added yet</p>
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
        <Button onClick={() => setShowCreate(true)} className="rounded-none font-mono uppercase tracking-widest px-6">
          <Plus className="mr-2 h-4 w-4" /> Initialize
        </Button>
      </div>

      {showCreate && <CreateTimetableForm onClose={() => setShowCreate(false)} />}

      <div className="grid grid-cols-1">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-card/40 border border-border/30 rounded-lg" />
            ))}
          </div>
        ) : timetables?.data?.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center space-y-4">
            <div className="size-16 rounded-full border border-dashed border-primary/30 flex items-center justify-center">
              <Calendar className="size-8 text-muted-foreground/20" />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-sm uppercase font-bold text-muted-foreground/80">No Timetables Found</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">Initialize a new timetable to get started.</p>
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
             <span className="text-[9px] font-mono uppercase text-muted-foreground">Published: Students Notified</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="size-2 rounded-full bg-orange-500" />
             <span className="text-[9px] font-mono uppercase text-muted-foreground">Draft: Private to Admins</span>
          </div>
        </div>
        <p className="text-[9px] font-mono uppercase text-muted-foreground/30 px-2 border-l border-border/40">
          Timetables v1.0.4
        </p>
      </div>
    </div>
  );
}
