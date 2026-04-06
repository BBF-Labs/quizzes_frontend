"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Clock3,
  FileText,
  MessageSquare,
  Network,
  Plus,
  Paperclip,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  useSessions,
  useCreateSession,
  useCourseSearch,
  useDebounce,
} from "@/hooks";
import { cn } from "@/lib/utils";

// ─── Time-aware rotating greetings ───────────────────────────────────────────

function getGreeting(name: string): string {
  const now = new Date();
  const hour = now.getHours();
  const first = name?.split(" ")[0] || "there";

  const morning = [
    `${first} is up early! 🌅`,
    `Morning focus mode, ${first} ☀️`,
    `${first}, let's cook? 📚`,
  ];

  const afternoon = [
    `Welcome back, ${first}. 👋`,
    `${first}, momentum check ⚡`,
    `Afternoon grind, ${first} 🧠`,
  ];

  const evening = [
    `Good evening, ${first} 🌙`,
    `${first}, returns! ✨`,
    `Prime study hours, ${first} 📖`,
  ];

  const lateNight = [
    `It's late, ${first} 🦉`,
    `${first.slice(-1) === "s" ? first : first + "'s"}, shenanigans! 🌌`,
    `Quiet hours, ${first} 🎧`,
  ];

  const pool =
    hour >= 5 && hour < 12
      ? morning
      : hour >= 12 && hour < 17
        ? afternoon
        : hour >= 17 && hour < 21
          ? evening
          : lateNight;

  // Keep one greeting for a period, then rotate automatically.
  const periodMinutes = 15;
  const periodIndex = Math.floor(now.getTime() / (periodMinutes * 60 * 1000));
  const greetingIndex = periodIndex % pool.length;

  return pool[greetingIndex];
}

// ─── App mode options ─────────────────────────────────────────────────────────

const APP_MODES = [
  { value: "structured", label: "Structured Study" },
  { value: "free", label: "Free Chat" },
] as const;

type AppMode = (typeof APP_MODES)[number]["value"];

export default function AppHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const createSession = useCreateSession();

  // ── Composer state ──────────────────────────────────────────────────────────
  const [input, setInput] = useState("");
  const [course, setCourse] = useState("");
  const [mode, setMode] = useState<AppMode>("structured");
  const [courseSearch, setCourseSearch] = useState("");
  const debouncedSearch = useDebounce(courseSearch, 400);
  const { data: searchResults = [], isLoading: isSearchingByText } =
    useCourseSearch(debouncedSearch);

  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  // Close mode menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        plusMenuRef.current &&
        !plusMenuRef.current.contains(e.target as Node)
      ) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const message = input.trim();
    if (!message || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const courseId = course.trim();
      const session = await createSession.mutateAsync({
        courseId: courseId ? courseId : undefined,
        mode,
      });
      const resolvedSessionId =
        session?.id || (session as { _id?: string })?._id;

      if (!resolvedSessionId || resolvedSessionId === "undefined") {
        console.error("No valid session ID returned", session);
        throw new Error("Failed to create session: Invalid ID returned");
      }

      // Pass first message via sessionStorage so [id]/page picks it up
      sessionStorage.setItem(`qz_first_msg_${resolvedSessionId}`, message);
      if (attachedFile) {
        // File name stored for display; actual upload wired later
        sessionStorage.setItem(
          `qz_first_file_${resolvedSessionId}`,
          attachedFile.name,
        );
      }

      router.push(`/app/${resolvedSessionId}`);
    } catch (err) {
      console.error("Failed to create session", err);
      setIsSubmitting(false);
    }
  }, [input, course, mode, attachedFile, isSubmitting, createSession, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const recentSessions = sessions.slice(0, 5);
  const greeting = getGreeting(user?.name ?? "");

  return (
    <div className="flex flex-col h-full min-h-[calc(100dvh-3.5rem)]">
      {/* ── Greeting + recent sessions ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-2xl text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-primary/40 bg-primary/5 px-3 py-1 mb-6">
            <span className="size-1.5 rounded-(--radius) bg-primary animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-primary">
              Z Study Partner
            </span>
          </div>

          {/* Greeting */}
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-3">
            {greeting}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Start typing below to begin a new study session.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="mt-8"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 mb-3 text-left">
              Desktop
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
              {[
                { href: "/app/all", label: "Sessions", Icon: MessageSquare },
                { href: "/app/library", label: "Library", Icon: BookOpen },
                {
                  href: "/app/flashcards",
                  label: "Flashcards",
                  Icon: Clock3,
                },
                { href: "/app/quizzes", label: "Quizzes", Icon: Sparkles },
                { href: "/app/mindmaps", label: "Mind Maps", Icon: Network },
                { href: "/app/notes", label: "Notes", Icon: FileText },
                {
                  href: recentSessions[0]
                    ? `/app/${recentSessions[0].id}`
                    : "/app/all",
                  label: "Studio",
                  Icon: Sparkles,
                },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex items-center gap-2 border border-border/40 bg-card/30 px-3 py-2 text-left hover:border-primary/40 hover:bg-primary/5 transition-all md:flex-col md:items-center md:justify-center md:gap-3 md:px-4 md:py-4 md:min-h-28"
                >
                  <Icon className="size-3.5 md:size-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[11px] md:text-xs font-mono tracking-wide text-muted-foreground group-hover:text-foreground transition-colors md:text-center">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent sessions */}
          {!sessionsLoading && recentSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-10 text-left"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                Recent
              </p>
              <div className="flex flex-col gap-1.5">
                {recentSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/app/${s.id}`}
                    className="group flex items-center gap-3 border border-border/40 bg-card/30 px-3 py-2.5 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <Clock3 className="size-3.5 text-muted-foreground/50 shrink-0" />
                    <span className="flex-1 truncate text-[11px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                      {s.name || s.title || `Session ${s.id.slice(0, 8)}`}
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">
                      {s.startedAt
                        ? new Date(s.startedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </Link>
                ))}
              </div>
              {sessions.length > 5 && (
                <Link
                  href="/app/all"
                  className="mt-2 inline-block text-[10px] font-mono uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
                >
                  View all {sessions.length} sessions →
                </Link>
              )}
            </motion.div>
          )}

          {!sessionsLoading && sessions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-10 flex flex-col items-center gap-3"
            >
              <div className="flex size-14 items-center justify-center border border-primary/20 bg-primary/5">
                <BookOpen className="size-6 text-primary/60" />
              </div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
                No sessions yet — ask Z anything to start
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Composer — sticky to bottom of content area ─────────────────────── */}
      <div className="sticky bottom-0 z-50 -mx-4 px-4 py-4 md:-mx-8 md:px-8 bg-background border-t border-border/50">
        <div className="mx-auto max-w-2xl">
          {/* Attached file pill */}
          <AnimatePresence>
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mb-2 flex items-center gap-2 border border-border/50 bg-card/60 px-3 py-1.5 w-fit"
              >
                <Paperclip className="size-3 text-muted-foreground" />
                <span className="text-[11px] font-mono text-muted-foreground truncate max-w-50">
                  {attachedFile.name}
                </span>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-muted-foreground/60 hover:text-destructive transition-colors"
                >
                  <X className="size-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 px-2 py-2 border border-border/50">
            <div className="flex items-center gap-2 shrink-0">
              {/* Plus menu trigger */}
              <div className="relative" ref={plusMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowPlusMenu((v) => !v)}
                  className="flex size-7 items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  title="More options"
                >
                  <Plus className="size-3.5" />
                </button>

                <AnimatePresence>
                  {showPlusMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute bottom-full left-0 mb-2 z-50 w-64 border border-border/60 bg-popover shadow-lg p-3"
                    >
                      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                        Session Options
                      </p>

                      <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-1">
                        Course
                      </label>
                      <div className="relative mb-3">
                        <input
                          type="text"
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          placeholder="Search for a course..."
                          className="w-full bg-transparent border border-border/40 px-2.5 py-1.5 text-[11px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                        />
                        {course && (
                          <button
                            type="button"
                            onClick={() => {
                              setCourse("");
                              setCourseSearch("");
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-primary hover:text-primary/70"
                          >
                            CLEAR
                          </button>
                        )}

                        <AnimatePresence>
                          {courseSearch.length >= 2 &&
                            searchResults.length > 0 &&
                            !course && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute top-full left-0 right-0 z-60 mt-1 border border-border/60 bg-popover shadow-xl max-h-48 overflow-y-auto"
                              >
                                {searchResults.map((c) => (
                                  <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => {
                                      setCourse(c._id);
                                      setCourseSearch(c.title || c.code);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-primary/5 transition-colors border-b border-border/20 last:border-0"
                                  >
                                    <p className="text-[11px] font-mono text-foreground truncate">
                                      {c.title}
                                    </p>
                                    <p className="text-[9px] font-mono text-muted-foreground uppercase">
                                      {c.code}
                                    </p>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                        </AnimatePresence>
                      </div>

                      <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-1">
                        Mode
                      </label>
                      <div className="flex gap-1">
                        {APP_MODES.map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setMode(m.value)}
                            className={cn(
                              "px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest border transition-colors",
                              mode === m.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/40 text-muted-foreground hover:border-primary/40",
                            )}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Upload */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex size-7 items-center justify-center transition-colors",
                  attachedFile
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
                title="Attach file"
              >
                <Paperclip className="size-3.5" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Z anything — a topic, a question, a concept…"
              rows={1}
              disabled={isSubmitting}
              className="flex-1 w-full resize-none bg-transparent py-1.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 font-mono"
              style={{ minHeight: "36px", maxHeight: "140px" }}
            />

            {isSubmitting && (
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 shrink-0">
                Starting...
              </span>
            )}
          </div>

          <p className="mt-2 text-center text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">
            Z may make mistakes — verify important information
          </p>
        </div>
      </div>
    </div>
  );
}
