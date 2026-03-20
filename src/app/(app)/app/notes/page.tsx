"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BookMarked, Brain, Search, Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { NoteSummary } from "@/types/session";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Single note row ──────────────────────────────────────────────────────────

function NoteRow({
  note,
  onDelete,
  deleting,
}: {
  note: NoteSummary;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={cn(
        "group border border-border/40 bg-card/30 hover:border-border/60 transition-all",
        deleting ? "opacity-40 pointer-events-none" : "",
      )}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
      >
        {/* Z icon */}
        {note.generatedByZ && (
          <Brain className="size-3.5 shrink-0 mt-0.5 text-primary/70" />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-mono font-bold text-[12px] text-foreground truncate">
            {note.title}
          </p>
          {!expanded && (
            <p className="mt-0.5 text-[10px] font-mono text-muted-foreground/60 line-clamp-2">
              {note.contentPreview}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {note.sessionName && (
              <span className="text-[9px] font-mono text-muted-foreground/40">
                {note.sessionName}
              </span>
            )}
            {note.courseTitle && (
              <>
                <span className="text-muted-foreground/20 text-[9px]">·</span>
                <span className="text-[9px] font-mono text-muted-foreground/40">
                  {note.courseTitle}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-[9px] font-mono text-muted-foreground/40">
            {formatDate(note.createdAt)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Delete note"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/30">
              <div className="mt-3 prose prose-sm prose-invert max-w-none text-[12px] font-mono leading-relaxed">
                <ReactMarkdown>{note.contentPreview}</ReactMarkdown>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href={`/app/${note.sessionId}`}
                  className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline"
                >
                  Back to session →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get<{ data: NoteSummary[] }>("/app/notes")
      .then((res) => setNotes(res.data?.data ?? []))
      .catch((err) => {
        console.error("[NotesPage] load failed", err);
        setError("Failed to load notes.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Client-side filtering — search on title + contentPreview
  const searchLower = search.trim().toLowerCase();

  const filtered = notes.filter((n) => {
    if (
      searchLower &&
      !n.title.toLowerCase().includes(searchLower) &&
      !n.contentPreview.toLowerCase().includes(searchLower)
    )
      return false;
    if (courseFilter && n.courseTitle !== courseFilter) return false;
    return true;
  });

  const courses = Array.from(
    new Set(notes.map((n) => n.courseTitle).filter(Boolean)),
  ) as string[];

  const handleDelete = async (note: NoteSummary) => {
    const key = `${note.sessionId}/${note.id}`;
    if (deletingIds.has(key)) return;
    setDeletingIds((p) => new Set([...p, key]));
    try {
      await api.delete(`/app/notes/${note.sessionId}/${note.id}`);
      setNotes((p) => p.filter((n) => n.id !== note.id));
    } catch (err) {
      console.error("[NotesPage] delete failed", err);
    } finally {
      setDeletingIds((p) => {
        const next = new Set(p);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-block border border-primary/40 bg-primary/5 px-2 py-1 mb-4">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-primary">
              Library
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">Notes</h1>
          <div className="mt-4 h-px w-10 bg-primary/40" />
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="w-full border border-border/50 bg-card/40 pl-9 pr-9 py-2.5 text-[12px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {courses.length > 0 && (
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="border border-border/50 bg-card/40 px-3 py-2.5 text-[12px] font-mono text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse bg-card/40 border border-border/30"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="flex size-14 items-center justify-center border border-primary/20 bg-primary/5">
              <BookMarked className="size-6 text-primary/60" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
              {search || courseFilter
                ? "No notes match your filters"
                : "No notes yet. Z saves important explanations automatically during study sessions."}
            </p>
          </motion.div>
        )}

        {/* List */}
        {!isLoading && !error && filtered.length > 0 && (
          <motion.div
            className="flex flex-col gap-2"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((note) => {
              const key = `${note.sessionId}/${note.id}`;
              return (
                <motion.div
                  key={note.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                  }}
                >
                  <NoteRow
                    note={note}
                    onDelete={() => handleDelete(note)}
                    deleting={deletingIds.has(key)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Count */}
        {!isLoading && notes.length > 0 && (
          <p className="mt-8 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30">
            {filtered.length} of {notes.length}{" "}
            {notes.length === 1 ? "note" : "notes"}
          </p>
        )}
      </div>
    </div>
  );
}
