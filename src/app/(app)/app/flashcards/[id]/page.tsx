"use client";

import { use, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUiPreferences } from "@/hooks/common/use-ui-preferences";
import confetti from "canvas-confetti";
import { FlipCard } from "@/components/flashcards/FlipCard";
import { CardForm } from "@/components/flashcards/CardForm";
import {
  useFlashcardSetDetail,
  useEditFlashcard,
  useDeleteFlashcard,
} from "@/hooks";

// const MAX_CARDS = 50; // Not used

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlashcardSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { remoteUiPreferences } = useUiPreferences();
  const confettiRef = useRef<HTMLDivElement>(null);

  // TanStack Query hooks
  const { data: set, isLoading, error } = useFlashcardSetDetail(id);
  // const addFlashcard = useAddFlashcard(id); // Not used yet
  const editFlashcard = useEditFlashcard(id);
  const deleteFlashcard = useDeleteFlashcard(id);

  // Local UI state
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const [addingCard] = useState(false); // Not used yet
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  // const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set()); // Not used
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mastery, setMastery] = useState<Record<string, number>>({});

  // Keep currentIndex in bounds
  const cardsLength = set?.cards.length ?? 0;
  const currentCard = set?.cards[currentIndex] ?? null;
  if (currentIndex > 0 && currentIndex >= cardsLength) {
    setCurrentIndex(Math.max(0, cardsLength - 1));
  }

  const toggleFlip = (cardId: string) =>
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });

  // Mastery logic: track correct/incorrect for each card
  const handleMastery = (cardId: string, correct: boolean) => {
    setMastery((prev) => {
      const prevVal = prev[cardId] ?? 0;
      const nextVal = Math.max(
        0,
        Math.min(100, prevVal + (correct ? 20 : -20)),
      );
      // Confetti on correct
      if (correct && confettiRef.current) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      return { ...prev, [cardId]: nextVal };
    });
  };

  // const isFull = (set?.cards.length ?? 0) >= MAX_CARDS; // Not used

  // UI preferences
  // const cardStyle = ... // Not used

  return (
    <div
      className="min-h-full px-2 py-6 flex flex-col items-center"
      ref={confettiRef}
    >
      {/* Title in top bar (breadcrumb area) */}
      <div className="w-full max-w-3xl mx-auto mb-8 flex flex-col items-center">
        <h1 className="text-2xl font-black tracking-tighter text-center">
          {set?.title}
        </h1>
        {(set?.courseTitle || set?.courseCode) && (
          <p className="mt-1 text-[11px] font-mono text-muted-foreground/60 text-center">
            {[set.courseTitle, set.courseCode].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="w-full flex flex-col items-center justify-center py-24">
          <div className="h-32 w-64 animate-pulse bg-card/40 border border-border/30 rounded-2xl" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive">
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {/* Main flashcard UI */}
      {set && set.cards.length > 0 && currentCard && (
        <div className="relative flex flex-row items-center justify-center w-full max-w-4xl min-h-105">
          {/* Left navigation */}
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 flex items-center justify-center rounded-(--radius) border border-border/50 bg-card/60 text-2xl text-muted-foreground/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous card"
          >
            <ChevronLeft className="size-7" />
          </button>

          {/* Card */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              {editingCardId === currentCard.id ? (
                <motion.div
                  key={"edit-" + currentCard.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full"
                >
                  <CardForm
                    initial={{
                      front: currentCard.front,
                      back: currentCard.back,
                    }}
                    onSave={(f, b) => {
                      editFlashcard.mutate(
                        { cardId: currentCard.id, front: f, back: b },
                        { onSuccess: () => setEditingCardId(null) },
                      );
                    }}
                    onCancel={() => setEditingCardId(null)}
                    loading={editFlashcard.isPending}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={currentCard.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full"
                >
                  <FlipCard
                    card={currentCard}
                    flipped={flippedIds.has(currentCard.id)}
                    onFlip={() => toggleFlip(currentCard.id)}
                    onEdit={() => setEditingCardId(currentCard.id)}
                    onDelete={() => {
                      deleteFlashcard.mutate(currentCard.id);
                    }}
                    style={
                      remoteUiPreferences
                        ? {
                            borderRadius: `${remoteUiPreferences.radiusRem ?? 1}rem`,
                            fontFamily: remoteUiPreferences.fontPreset,
                            background:
                              remoteUiPreferences.palette === "custom"
                                ? remoteUiPreferences.customColors.primary
                                : undefined,
                          }
                        : {}
                    }
                    className="w-85 sm:w-105 md:w-130 mx-auto"
                  >
                    {/* Mastery controls (only on front) */}
                    {!flippedIds.has(currentCard.id) && (
                      <div className="mt-8 flex flex-col items-center gap-2 w-full">
                        <div className="flex flex-row items-center gap-4 justify-center">
                          <Button
                            size="icon-lg"
                            variant="outline"
                            className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMastery(currentCard.id, true);
                            }}
                            aria-label="I knew this"
                          >
                            <Check className="size-7" />
                          </Button>
                          <Button
                            size="icon-lg"
                            variant="outline"
                            className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMastery(currentCard.id, false);
                            }}
                            aria-label="I didn't know this"
                          >
                            <X className="size-7" />
                          </Button>
                        </div>
                        <div className="w-40 mt-2">
                          <Progress value={mastery[currentCard.id] ?? 0} />
                          <div className="text-center text-xs font-mono mt-1 text-muted-foreground">
                            Mastery: {mastery[currentCard.id] ?? 0}%
                          </div>
                        </div>
                      </div>
                    )}
                  </FlipCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right navigation */}
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((prev) =>
                Math.min((set.cards.length || 1) - 1, prev + 1),
              )
            }
            disabled={currentIndex >= set.cards.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 flex items-center justify-center rounded-(--radius) border border-border/50 bg-card/60 text-2xl text-muted-foreground/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next card"
          >
            <ChevronRight className="size-7" />
          </button>
        </div>
      )}

      {/* Empty state */}
      {set && set.cards.length === 0 && !addingCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-20 text-center"
        >
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
            No cards yet — add one above.
          </p>
        </motion.div>
      )}
    </div>
  );
}
