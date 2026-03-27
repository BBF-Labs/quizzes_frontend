"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { StudioFlashcard } from "@/types/session";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FlashcardsTabProps {
  sessionId: string;
  flashcards: StudioFlashcard[];
  onFlashcardsChange: (cards: StudioFlashcard[]) => void;
}

// ─── Single flip card ─────────────────────────────────────────────────────────

function FlipCard({
  card,
  flipped,
  onFlip,
}: {
  card: StudioFlashcard;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      className="relative cursor-pointer"
      style={{ perspective: 800 }}
      onClick={onFlip}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-27.5"
      >
        {/* Front */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center border border-border/50 bg-card/60 px-3 py-2",
            "backface-hidden",
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {card.savedToLibrary && (
            <CheckCircle className="absolute top-1.5 right-1.5 size-3 text-green-500" />
          )}
          <p className="text-[11px] font-mono text-center text-foreground leading-relaxed">
            {card.front}
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-center border border-primary/30 bg-primary/5 px-3 py-2"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-[11px] font-mono text-center text-foreground leading-relaxed">
            {card.back}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FlashcardsTab({
  sessionId,
  flashcards,
  onFlashcardsChange,
}: FlashcardsTabProps) {
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [setTitle, setSetTitle] = useState("");

  const toggleFlip = (id: string) =>
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const handleSaveToLibrary = async () => {
    if (!setTitle.trim()) return;
    setSaving(true);
    try {
      await api.post(`/app/${sessionId}/studio/flashcards/save`, {
        title: setTitle.trim(),
      });
      // Mark all cards as saved
      onFlashcardsChange(flashcards.map((c) => ({ ...c, savedToLibrary: true })));
      setSaveDialogOpen(false);
      setSetTitle("");
    } catch (err) {
      console.error("[FlashcardsTab] save to library failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50">
          Flashcards
        </span>
        {flashcards.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 gap-1 text-[9px] font-mono uppercase tracking-widest px-2"
            onClick={() => setSaveDialogOpen(true)}
          >
            <BookOpen className="size-2.5" />
            Save to Library
          </Button>
        )}
      </div>

      {/* Card grid */}
      {flashcards.length === 0 ? (
        <p className="text-[10px] font-mono text-muted-foreground/40 text-center py-4">
          No flashcards yet — Z will generate them as you study
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-2 gap-2"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {flashcards.map((card) => (
              <motion.div
                key={card.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
                }}
              >
                <FlipCard
                  card={card}
                  flipped={flippedIds.has(card.id)}
                  onFlip={() => toggleFlip(card.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Save-to-library dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">
              Save Flashcard Set
            </DialogTitle>
          </DialogHeader>
          <Input
            value={setTitle}
            onChange={(e) => setSetTitle(e.target.value)}
            placeholder="Set title…"
            className="font-mono text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSaveToLibrary()}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              className="font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveToLibrary}
              disabled={saving || !setTitle.trim()}
              className="font-mono text-xs"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
