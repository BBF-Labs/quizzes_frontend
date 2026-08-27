"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  FileDown,
  Layers,
  BrainCircuit,
  HelpCircle,
  Clock,
} from "lucide-react";
import { useCreateStudioNote, useDeleteStudioNote } from "@/hooks/app/use-app-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotesViewProps {
  sessionId: string;
  notes?: Array<{ id: string; title: string; content: string; createdAt?: string }>;
  onSendMessage?: (message: string) => void;
}

export function NotesView({
  sessionId,
  notes = [],
  onSendMessage,
}: NotesViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [activeTab, setActiveTab] = useState<"notes" | "flashcards" | "mindmap">("notes");

  const createNoteMutation = useCreateStudioNote(sessionId);
  const deleteNoteMutation = useDeleteStudioNote(sessionId);

  const handleSaveNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please provide both title and note content.");
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        title: newTitle.trim(),
        content: newContent.trim(),
      });
      toast.success("Note saved to session studio.");
      setNewTitle("");
      setNewContent("");
      setIsCreating(false);
    } catch {
      toast.error("Failed to save note.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 antialiased">
      {/* Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Study Studio &amp; Notes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Key takeaways, synthesis notes, and generated flashcards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded-full bg-slate-950 hover:bg-[#0C60FC] text-white px-4 py-2 text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Mode Filter Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5",
            activeTab === "notes"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Notes ({notes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flashcards")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5",
            activeTab === "flashcards"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Flashcards</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mindmap")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5",
            activeTab === "mindmap"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <BrainCircuit className="h-3.5 w-3.5" />
          <span>Mind Map</span>
        </button>
      </div>

      {/* New Note Creation Modal / Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Create Study Note</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note Title (e.g. Miller-Rabin Primality Key Steps)"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-[#0C60FC]"
            />

            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write or paste your notes, equations, and observations here…"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-[#0C60FC]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={createNoteMutation.isPending}
                className="rounded-full bg-slate-950 hover:bg-[#0C60FC] text-white px-5 py-2 text-xs font-extrabold shadow-sm cursor-pointer"
              >
                {createNoteMutation.isPending ? "Saving…" : "Save Note"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Contents */}
      {activeTab === "notes" && (
        <div className="space-y-3">
          {notes.length === 0 && !isCreating ? (
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <BookOpen className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No notes recorded yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Take notes during your study session or ask Alice / Z to synthesize key takeaways for you.
              </p>
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                + Write first note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {notes.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-extrabold text-slate-950 truncate">
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {n.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => onSendMessage?.(`Explain and expand on my note: "${n.title}"`)}
                      className="font-bold text-[#0C60FC] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Ask AI to expand</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Delete this note?")) {
                          deleteNoteMutation.mutate(n.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "flashcards" && (
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">Spaced Repetition Flashcards</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Auto-generate spaced repetition flashcards from your active study session knowledge blocks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSendMessage?.("Generate a 10-card flashcard set based on what we've covered")}
            className="rounded-full bg-slate-950 hover:bg-[#0C60FC] text-white px-5 py-2.5 text-xs font-extrabold shadow-sm transition cursor-pointer"
          >
            Generate Flashcard Deck →
          </button>
        </div>
      )}

      {activeTab === "mindmap" && (
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">Concept Mind Map</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Visualize connections between concepts, algorithms, and theorems covered so far.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSendMessage?.("Create a visual concept mind map summarizing this chapter")}
            className="rounded-full bg-slate-950 hover:bg-[#0C60FC] text-white px-5 py-2.5 text-xs font-extrabold shadow-sm transition cursor-pointer"
          >
            Generate Concept Map →
          </button>
        </div>
      )}
    </div>
  );
}
