"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BookOpen,
  Clock3,
  Search,
  Plus,
  ArrowRight,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Layers,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import { useSessions, useCreateSession } from "@/hooks";
import { toast } from "sonner";

export default function AllSessionsPage() {
  const router = useRouter();
  const { data: sessions = [], isLoading, error } = useSessions();
  const createSession = useCreateSession();

  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "completed" | "structured" | "free">("all");
  const [isCreating, setIsCreating] = useState(false);

  // Compute counts
  const counts = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter((s) => s.status === "active").length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    const structured = sessions.filter((s) => s.mode === "structured").length;
    const free = sessions.filter((s) => s.mode === "free").length;
    return { total, active, completed, structured, free };
  }, [sessions]);

  // Filter sessions
  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      // Search filter
      const title = s.name || s.title || "";
      const matchesSearch =
        !query.trim() ||
        title.toLowerCase().includes(query.toLowerCase()) ||
        (s.courseId && s.courseId.toLowerCase().includes(query.toLowerCase()));

      if (!matchesSearch) return false;

      // Mode / status filter
      if (filterMode === "active") return s.status === "active";
      if (filterMode === "completed") return s.status === "completed";
      if (filterMode === "structured") return s.mode === "structured";
      if (filterMode === "free") return s.mode === "free";
      return true;
    });
  }, [sessions, query, filterMode]);

  const handleStartSession = async (mode: "structured" | "free" = "structured") => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const session = await createSession.mutateAsync({ mode });
      const resolvedId = session?.id || (session as { _id?: string })?._id;
      if (!resolvedId) throw new Error("Invalid session ID returned");
      toast.success("Study session created!");
      router.push(`/study-session/${resolvedId}/journey`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create study session.");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 pb-24 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        {/* Header Hero Section */}
        <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#0C60FC] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0C60FC]" />
              Study History & Workspace
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              All Study Sessions
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Pick up where you left off or search through your learning history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleStartSession("structured")}
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#0C60FC] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {isCreating ? "Starting…" : "New Study Session"}
            </button>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sessions by topic or course…"
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:outline-none focus:ring-2 focus:ring-[#0C60FC]/10 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all" as const, label: "All", count: counts.total },
              { id: "active" as const, label: "Active", count: counts.active },
              { id: "completed" as const, label: "Completed", count: counts.completed },
              { id: "structured" as const, label: "Structured", count: counts.structured },
              { id: "free" as const, label: "Free Study", count: counts.free },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  filterMode === tab.id
                    ? "bg-slate-950 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                    filterMode === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-[26px] border border-slate-200 bg-white p-6"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="rounded-[26px] border border-rose-200 bg-rose-50/50 p-8 text-center text-sm font-semibold text-rose-700">
            {error instanceof Error ? error.message : "Failed to load study sessions"}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-300 bg-white py-20 px-6 text-center shadow-sm"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0C60FC] ring-1 ring-blue-200">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-base font-bold text-slate-900">
              {query || filterMode !== "all" ? "No matching sessions found" : "No study sessions yet"}
            </h3>
            <p className="mt-1.5 max-w-sm text-xs font-semibold text-slate-500">
              {query || filterMode !== "all"
                ? "Try searching for a different keyword or reset your active filters."
                : "Create your first interactive study session to practice quizzes, generate notes, and master concepts."}
            </p>
            {query || filterMode !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilterMode("all");
                }}
                className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Reset filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStartSession("structured")}
                disabled={isCreating}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#0C60FC]"
              >
                <Plus className="h-4 w-4" />
                Start your first study session
              </button>
            )}
          </motion.div>
        )}

        {/* Sessions Grid */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((session, i) => {
                const title =
                  session.name ||
                  session.title ||
                  `Study Session ${session.id.slice(0, 6)}`;
                const isStructured = session.mode === "structured";
                const isActive = session.status === "active";

                return (
                  <motion.article
                    key={session.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.18, delay: i * 0.02 }}
                    className="play-card group flex flex-col justify-between rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all min-w-0"
                    style={{ borderRadius: "26px" }}
                  >
                    <div>
                      {/* Top row: Mode Badge & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold ${
                            isStructured
                              ? "bg-blue-50 text-[#0C60FC] ring-1 ring-blue-200"
                              : "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
                          }`}
                        >
                          {isStructured ? (
                            <GraduationCap className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                          ) : (
                            <MessageSquare className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                          )}
                          {isStructured ? "Structured" : "Free Study"}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                          }`}
                        >
                          {isActive ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-slate-500" />
                          )}
                          {isActive ? "Active" : "Completed"}
                        </span>
                      </div>

                      {/* Title */}
                      <Link href={`/study-session/${session.id}/journey`} className="block mt-4 group">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-[#0C60FC] transition-colors">
                          {title}
                        </h3>
                      </Link>

                      {/* Metadata */}
                      <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
                        {session.startedAt && (
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                            {format(new Date(session.startedAt), "MMM d, yyyy")}
                          </span>
                        )}
                        {session.courseId && (
                          <>
                            <span>·</span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {session.courseId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <Link
                        href={`/study-session/${session.id}/journey`}
                        className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-extrabold text-white transition hover:bg-[#0C60FC]"
                      >
                        <span>Resume Session</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Count footer */}
        {!isLoading && filtered.length > 0 && (
          <p className="mt-8 text-center text-xs font-bold text-slate-400">
            Showing {filtered.length} of {sessions.length} study sessions
          </p>
        )}
      </div>
    </div>
  );
}
