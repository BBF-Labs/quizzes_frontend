"use client";

import { useState, useEffect } from "react";
import {
  X,
  Bell,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Loader2,
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { useSubscribeGuestTimetableReminders } from "@/hooks/use-public-exams";
import { useTimetableSocket } from "@/hooks/use-timetable-socket";
import { toast } from "sonner";
import { format } from "date-fns";

export interface GuestReminderPaper {
  id?: string;
  courseCode: string;
  courseName: string;
  scheduledAt: string | Date;
  venue?: string;
  assignedVenue?: string;
  time?: string;
  date?: string;
  semester?: string;
  academicYear?: string;
}

interface GuestReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  papers: GuestReminderPaper[];
  selectedPaper?: GuestReminderPaper | null;
}

interface SyncedEntry {
  _id: string;
  courseCode: string;
  courseName: string;
  scheduledAt: string;
  venues: { venue: string; indexStart?: string; indexEnd?: string }[];
  assignedVenue?: string | null;
  durationMinutes: number;
  semester?: string;
  academicYear?: string;
}

function toGuestPaper(e: SyncedEntry): GuestReminderPaper {
  const d = new Date(e.scheduledAt);
  return {
    id: e._id,
    courseCode: e.courseCode,
    courseName: e.courseName,
    scheduledAt: e.scheduledAt,
    venue: e.assignedVenue || e.venues.map(v => v.venue).join(", ") || "Main Campus",
    assignedVenue: e.assignedVenue || undefined,
    time: format(d, "HH:mm"),
    date: format(d, "EEE").toUpperCase(),
    semester: e.semester,
    academicYear: e.academicYear,
  };
}

export function GuestReminderModal({
  isOpen,
  onClose,
  studentId,
  papers,
  selectedPaper,
}: GuestReminderModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAllPapers, setShowAllPapers] = useState(false);
  const [syncedPapers, setSyncedPapers] = useState<GuestReminderPaper[]>([]);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [useEnrolledCourses, setUseEnrolledCourses] = useState(false);

  const { mutateAsync: subscribeReminders, isPending } =
    useSubscribeGuestTimetableReminders();

  // Listen for real-time timetable sync (enrolled courses for this student)
  // Populates syncedPapers but does NOT auto-select — user must explicitly choose
  useTimetableSocket(studentId, {
    onSynced: (payload) => {
      if (payload?.entries?.length) {
        const enrolled = payload.entries.map(toGuestPaper);
        setSyncedPapers(enrolled);
      }
    },
  });

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setShowAllPapers(false);
      setShowCoursePicker(false);
      setSelectedCourseIds([]);
      setUseEnrolledCourses(false);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  // Determine which papers to show:
  // 1. If a specific paper was selected, use that
  // 2. Else if user explicitly opted into enrolled courses, use those
  // 3. Else if user is in course picker mode, use manually selected courses
  // 4. Else fall back to passed papers (from initial API)
  let targetPapers: GuestReminderPaper[] = [];
  let dataSource = "passed";

  if (selectedPaper) {
    targetPapers = [selectedPaper];
    dataSource = "selected";
  } else if (useEnrolledCourses && syncedPapers.length > 0) {
    targetPapers = syncedPapers;
    dataSource = "enrolled";
  } else if (showCoursePicker && selectedCourseIds.length > 0) {
    // Find manually selected courses from synced papers (or fallback to passed papers)
    const source = syncedPapers.length > 0 ? syncedPapers : papers;
    targetPapers = source.filter(p => selectedCourseIds.includes(p.id || p.courseCode));
    dataSource = "manual";
  } else {
    targetPapers = papers.length > 0 ? papers : [];
    dataSource = "passed";
  }

  const displayCount = targetPapers.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await subscribeReminders({
        email: cleanEmail,
        name: name.trim() || undefined,
        studentId: studentId?.trim() || undefined,
        courseCodes: targetPapers.map((p) => p.courseCode),
        papers: targetPapers.map((p) => ({
          courseCode: p.courseCode,
          courseName: p.courseName,
          scheduledAt:
            p.scheduledAt instanceof Date
              ? p.scheduledAt.toISOString()
              : String(p.scheduledAt),
          venue: p.venue,
          assignedVenue: p.assignedVenue,
          semester: p.semester,
          academicYear: p.academicYear,
        })),
      });

      setIsSuccess(true);
      toast.success("Exam countdown alerts activated!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to activate exam reminders";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {isSuccess ? (
          <div className="p-8 text-center sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
              <CheckCircle2 className="h-9 w-9 animate-in zoom-in-75 duration-300" />
            </div>

            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
              You&apos;re All Set for Exam Alerts! 🔔
            </h3>

            <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
              We will send countdown emails to{" "}
              <b className="text-slate-900">{email}</b> at{" "}
              <span className="font-extrabold text-[#0C60FC]">
                7 days, 3 days, and 24 hours
              </span>{" "}
              before each of your {displayCount} scheduled exam papers.
            </p>

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Free Student Study Tips Included</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-emerald-800/90">
                You will also receive our weekly student newsletter with past
                question breakdowns and study hacks. You can unsubscribe anytime
                with 1 click.
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-slate-950 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC]"
            >
              Done & Return to Timetable
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 p-6 sm:p-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/60 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0C60FC]">
                <Bell className="h-3 w-3" />
                <span>Free Exam Reminders</span>
              </div>

              <h2 className="mt-2 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                Get Exam Alerts & Countdown Reminders
              </h2>

              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                Never miss an exam date, time change, or assigned seat venue.
              </p>

              {/* Scope Summary Badge */}
              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Tracking Schedule For:
                    </p>
                    <p className="truncate text-xs font-black text-slate-900">
                      {selectedPaper
                        ? `${selectedPaper.courseCode} · ${selectedPaper.courseName}`
                        : studentId
                        ? `Student ID: ${studentId} (${displayCount} papers)`
                        : `${displayCount} Selected Course(s)`}
                    </p>
                    {dataSource === "enrolled" && syncedPapers.length > 0 && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        From your enrolled schedule
                      </p>
                    )}
                  </div>
                  {displayCount > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowAllPapers(!showAllPapers)}
                      className="shrink-0 text-[10px] font-extrabold text-[#0C60FC] hover:underline"
                    >
                      {showAllPapers ? "Hide list" : `View ${displayCount} papers`}
                    </button>
                  )}
                </div>

                {/* Course selection options (only when we have papers to pick from) */}
                {!selectedPaper && !showCoursePicker && (syncedPapers.length > 1 || papers.length > 1) && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {/* Use enrolled courses button */}
                    {syncedPapers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUseEnrolledCourses(!useEnrolledCourses)}
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0C60FC] hover:underline"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {useEnrolledCourses ? "Using enrolled courses ✓" : "Use my enrolled courses"}
                      </button>
                    )}
                    {/* Choose specific courses button */}
                    <button
                      type="button"
                      onClick={() => setShowCoursePicker(true)}
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0C60FC] hover:underline"
                    >
                      <Plus className="h-3 w-3" />
                      Choose specific courses
                    </button>
                  </div>
                )}

                {/* Collapsible Paper List */}
                {(showAllPapers || displayCount === 1) && (
                  <div className="mt-3 max-h-44 space-y-1.5 overflow-y-auto border-t border-slate-100 pt-2.5">
                    {targetPapers.map((p, idx) => {
                      const d = p.scheduledAt
                        ? new Date(p.scheduledAt)
                        : new Date();
                      const dateDisplay = format(d, "EEE, MMM d");
                      const timeDisplay = format(d, "HH:mm");

                      return (
                        <div
                          key={p.id || idx}
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-2.5 py-1.5 text-[11px]"
                        >
                          <span className="font-extrabold text-slate-900">
                            {p.courseCode}
                          </span>
                          <div className="flex items-center gap-3 text-slate-500">
                            <span className="flex items-center gap-1 font-semibold">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              {dateDisplay}
                            </span>
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {timeDisplay} GMT
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Course picker — manual selection */}
                {showCoursePicker && !selectedPaper && (() => {
                  const pool = syncedPapers.length > 0 ? syncedPapers : papers;
                  const filtered = pool.filter(p => {
                    const q = courseSearch.trim().toLowerCase();
                    return !q || p.courseCode.toLowerCase().includes(q) || p.courseName.toLowerCase().includes(q);
                  });
                  const toggle = (id: string) => {
                    setSelectedCourseIds(prev =>
                      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                    );
                  };
                  return (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            placeholder="Filter courses…"
                            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-[11px] font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:bg-white focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => { setShowCoursePicker(false); setSelectedCourseIds([]); setUseEnrolledCourses(false); }}
                          className="text-[10px] font-extrabold text-slate-500 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="mt-2 max-h-44 space-y-1 overflow-y-auto pr-1 no-scrollbar">
                        {filtered.length === 0 ? (
                          <p className="py-3 text-center text-[11px] font-semibold text-slate-400">
                            No courses match
                          </p>
                        ) : filtered.map((p, idx) => {
                          const key = p.id || p.courseCode || String(idx);
                          const checked = selectedCourseIds.includes(key);
                          return (
                            <label
                              key={key}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-slate-50 px-2.5 py-1.5 text-[11px] hover:border-slate-200 hover:bg-white"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggle(key)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-[#0C60FC] focus:ring-[#0C60FC]"
                              />
                              <span className="font-extrabold text-slate-900">{p.courseCode}</span>
                              <span className="truncate text-slate-500">{p.courseName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Form & Agreement Details */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
              {/* Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kwame@st.ug.edu.gh"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  First Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kwame"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Value & Transparency Agreement Box */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3.5 text-slate-700 space-y-2">
                <p className="text-[11px] font-bold text-slate-900">
                  What you&apos;ll receive with your subscription:
                </p>
                <div className="space-y-1.5 text-[10px] font-semibold text-slate-600">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <b>Automated Countdown Alerts:</b> Reminders sent 7d, 3d,
                      and 24h before each exam with verified seat venues.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <b>Free Revision Tips & Past Questions:</b> Weekly student
                      study hacks and course materials via student newsletter.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-600 mt-0.5" />
                    <span>
                      <b>Zero Spam Guarantee:</b> 100% free, no login required,
                      and 1-click unsubscribe anytime.
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending || displayCount === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-xs font-extrabold text-white transition hover:bg-[#0C60FC] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-500/10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Activating Reminders...</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    <span>Activate Free Reminders 🔔</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
