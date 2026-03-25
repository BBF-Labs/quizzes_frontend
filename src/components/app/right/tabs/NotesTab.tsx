"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Pencil, Trash2, Plus, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { StudioNote, SharedNote } from "@/types/session";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotesTabProps {
  sessionId: string;
  notes: StudioNote[];
  isPeerMode: boolean;
  sharedNotes: SharedNote[];
  onNotesChange: (notes: StudioNote[]) => void;
  onSharedNotesChange: (notes: SharedNote[]) => void;
}

// ─── Single Note Card ─────────────────────────────────────────────────────────

interface NoteCardProps {
  sessionId: string;
  note: StudioNote;
  onUpdate: (updated: StudioNote) => void;
  onDelete: () => void;
}

const DEBOUNCE_MS = 500;

function NoteCard({ sessionId, note, onUpdate, onDelete }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [deleting, setDeleting] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAutoSave = useCallback(
    (value: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          const res = await api.patch(`/app/${sessionId}/studio/notes/${note.id}`, {
            content: value,
          });
          onUpdate({ ...note, content: value, updatedAt: res.data?.data?.updatedAt ?? new Date().toISOString() });
        } catch (err) {
          console.error("[NotesTab] auto-save failed", err);
        }
      }, DEBOUNCE_MS);
    },
    [sessionId, note, onUpdate],
  );

  const handleBlur = () => {
    // Flush immediately
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    api
      .patch(`/app/${sessionId}/studio/notes/${note.id}`, { content: draft })
      .then((res) => {
        onUpdate({ ...note, content: draft, updatedAt: res.data?.data?.updatedAt ?? new Date().toISOString() });
      })
      .catch((err) => console.error("[NotesTab] save on blur failed", err))
      .finally(() => setEditing(false));
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/app/${sessionId}/studio/notes/${note.id}`);
      onDelete();
    } catch (err) {
      console.error("[NotesTab] delete failed", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn(
        "border border-border/40 bg-card/40",
        note.generatedByZ && "border-l-2 border-l-primary/50",
      )}
    >
      {/* Header row */}
      <div
        className="flex items-start gap-2 px-3 py-2 cursor-pointer select-none"
        onClick={() => !editing && setExpanded((p) => !p)}
      >
        {note.generatedByZ && (
          <Brain className="mt-0.5 size-3 shrink-0 text-primary/70" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono font-bold truncate text-foreground">
            {note.title || "Untitled"}
          </p>
          {!expanded && !editing && (
            <p className="text-[10px] font-mono text-muted-foreground/60 line-clamp-1 mt-0.5">
              {note.content.slice(0, 80)}
            </p>
          )}
        </div>
        <span className="shrink-0 text-[9px] font-mono text-muted-foreground/40">
          {formatTime(note.updatedAt)}
        </span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => { setEditing(true); setExpanded(true); setDraft(note.content); }}
            className="p-0.5 text-muted-foreground/50 hover:text-primary transition-colors"
            aria-label="Edit note"
          >
            <Pencil className="size-3" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="p-0.5 text-muted-foreground/50 hover:text-destructive transition-colors disabled:opacity-40"
            aria-label="Delete note"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </div>

      {/* Expanded / editing body */}
      <AnimatePresence initial={false}>
        {(expanded || editing) && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {editing ? (
                <Textarea
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    scheduleAutoSave(e.target.value);
                  }}
                  onBlur={handleBlur}
                  autoFocus
                  className="min-h-[120px] text-[11px] font-mono resize-none bg-background/50"
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none text-[11px] font-mono">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {note.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NotesTab({
  sessionId,
  notes,
  isPeerMode,
  sharedNotes,
  onNotesChange,
  onSharedNotesChange,
}: NotesTabProps) {
  const [creatingNew, setCreatingNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [addingShared, setAddingShared] = useState(false);
  const [sharedDraft, setSharedDraft] = useState("");
  const savedRef = useRef(false);

  const handleNewBlur = async () => {
    if (savedRef.current || !newContent.trim()) {
      setCreatingNew(false);
      setNewContent("");
      return;
    }
    savedRef.current = true;
    try {
      const res = await api.post(`/app/${sessionId}/studio/notes`, {
        content: newContent,
        title: newContent.split("\n")[0].slice(0, 60) || "New Note",
      });
      const created: StudioNote = res.data?.data ?? {
        id: `local-${Date.now()}`,
        title: newContent.split("\n")[0].slice(0, 60) || "New Note",
        content: newContent,
        generatedByZ: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onNotesChange([...notes, created]);
    } catch (err) {
      console.error("[NotesTab] create failed", err);
    } finally {
      setCreatingNew(false);
      setNewContent("");
      savedRef.current = false;
    }
  };

  const handleAddShared = async () => {
    if (!sharedDraft.trim()) return;
    try {
      const res = await api.post(`/app/${sessionId}/studio/shared-notes`, {
        content: sharedDraft,
      });
      const created: SharedNote = res.data?.data ?? {
        id: `local-${Date.now()}`,
        content: sharedDraft,
        authorName: "Me",
        createdAt: new Date().toISOString(),
      };
      onSharedNotesChange([...sharedNotes, created]);
      setSharedDraft("");
      setAddingShared(false);
    } catch (err) {
      console.error("[NotesTab] shared note create failed", err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50">
          Notes
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-6 gap-1 text-[9px] font-mono uppercase tracking-widest px-2"
          onClick={() => { setCreatingNew(true); setNewContent(""); savedRef.current = false; }}
        >
          <Plus className="size-2.5" />
          New Note
        </Button>
      </div>

      {/* New note inline editor */}
      <AnimatePresence>
        {creatingNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onBlur={handleNewBlur}
              autoFocus
              placeholder="Start typing your note…"
              className="min-h-[80px] text-[11px] font-mono resize-none bg-background/50"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes list */}
      {notes.length === 0 && !creatingNew ? (
        <p className="text-[10px] font-mono text-muted-foreground/40 text-center py-4">
          No notes yet
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              sessionId={sessionId}
              note={note}
              onUpdate={(updated) =>
                onNotesChange(notes.map((n) => (n.id === updated.id ? updated : n)))
              }
              onDelete={() => onNotesChange(notes.filter((n) => n.id !== note.id))}
            />
          ))}
        </div>
      )}

      {/* Shared notes section (peer mode) */}
      {isPeerMode && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50">
              <Users className="size-3" />
              Shared Notes
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-6 gap-1 text-[9px] font-mono uppercase tracking-widest px-2"
              onClick={() => setAddingShared(true)}
            >
              <Plus className="size-2.5" />
              Add
            </Button>
          </div>

          <AnimatePresence>
            {addingShared && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden flex flex-col gap-1.5"
              >
                <Textarea
                  value={sharedDraft}
                  onChange={(e) => setSharedDraft(e.target.value)}
                  autoFocus
                  placeholder="Write a shared note…"
                  className="min-h-[60px] text-[11px] font-mono resize-none bg-background/50"
                />
                <div className="flex gap-1.5">
                  <Button size="sm" className="flex-1 h-6 text-[9px] font-mono" onClick={handleAddShared}>
                    Share
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-6 text-[9px] font-mono" onClick={() => { setAddingShared(false); setSharedDraft(""); }}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {sharedNotes.length === 0 ? (
            <p className="text-[10px] font-mono text-muted-foreground/40 text-center py-2">
              No shared notes yet
            </p>
          ) : (
            sharedNotes.map((sn) => (
              <div
                key={sn.id}
                className="border border-border/30 bg-card/20 px-3 py-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-muted-foreground/60">
                    {sn.authorName}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground/40">
                    {formatTime(sn.createdAt)}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-foreground/80 leading-relaxed">
                  {sn.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
