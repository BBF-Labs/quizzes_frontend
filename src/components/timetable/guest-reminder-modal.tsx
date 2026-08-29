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
} from "lucide-react";
import { api } from "@/lib/api";
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
}

interface GuestReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  papers: GuestReminderPaper[];
  selectedPaper?: GuestReminderPaper | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAllPapers, setShowAllPapers] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      setShowAllPapers(false);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const targetPapers = selectedPaper
    ? [selectedPaper]
    : papers.length > 0
    ? papers
    : [];

  const displayCount = targetPapers.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/learning/timetables/guest-reminders", {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
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
                disabled={isSubmitting || displayCount === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-xs font-extrabold text-white transition hover:bg-[#0C60FC] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-500/10"
              >
                {isSubmitting ? (
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
