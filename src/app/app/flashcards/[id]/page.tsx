"use client";

import { use, useEffect, useRef, useState, useCallback } from "react";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Layers,
  Sparkles,
  RotateCw,
  Award,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";
import { FlipCard } from "@/components/flashcards/FlipCard";
import { CardForm } from "@/components/flashcards/CardForm";
import {
  useFlashcardSetDetail,
  useEditFlashcard,
  useDeleteFlashcard,
} from "@/hooks";

export default function FlashcardSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const confettiRef = useRef<HTMLDivElement>(null);

  // TanStack Query hooks
  const { data: set, isLoading, error } = useFlashcardSetDetail(id);
  const editFlashcard = useEditFlashcard(id);
  const deleteFlashcard = useDeleteFlashcard(id);

  // Local UI state
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mastery, setMastery] = useState<Record<string, number>>({});

  const cards = set?.cards ?? [];
  const cardsLength = cards.length;
  const currentCard = cards[currentIndex] ?? null;

  // Keep currentIndex in bounds
  if (currentIndex > 0 && currentIndex >= cardsLength) {
    setCurrentIndex(Math.max(0, cardsLength - 1));
  }

  const toggleFlip = useCallback(
    (cardId: string) => {
      setFlippedIds((prev) => {
        const next = new Set(prev);
        if (next.has(cardId)) {
          next.delete(cardId);
        } else {
          next.add(cardId);
        }
        return next;
      });
    },
    [],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < cardsLength - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFlippedIds(new Set());
    }
  }, [currentIndex, cardsLength]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setFlippedIds(new Set());
    }
  }, [currentIndex]);

  const handleMastery = useCallback(
    (cardId: string, correct: boolean) => {
      setMastery((prev) => {
        const prevVal = prev[cardId] ?? 0;
        const nextVal = Math.max(0, Math.min(100, prevVal + (correct ? 50 : -25)));
        if (correct && confettiRef.current) {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
        return { ...prev, [cardId]: nextVal };
      });

      // Auto advance after rating if not last card
      if (currentIndex < cardsLength - 1) {
        setTimeout(() => {
          handleNext();
        }, 300);
      }
    },
    [currentIndex, cardsLength, handleNext],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingCardId) return; // Don't intercept while editing text
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " " && currentCard) {
        e.preventDefault();
        toggleFlip(currentCard.id);
      }
      if (e.key === "1" && currentCard) handleMastery(currentCard.id, false);
      if (e.key === "2" && currentCard) handleMastery(currentCard.id, true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingCardId, handleNext, handlePrev, toggleFlip, handleMastery, currentCard]);

  useEffect(() => {
    if (set?.title) {
      useBreadcrumbStore.getState().setDynamicTitle(set.title);
    }
    return () => useBreadcrumbStore.getState().setDynamicTitle(null);
  }, [set?.title]);

  const progressPercent = cardsLength > 0 ? Math.round(((currentIndex + 1) / cardsLength) * 100) : 0;
  const currentCardMastery = currentCard ? (mastery[currentCard.id] ?? 0) : 0;

  // Sliding 5-dot carousel window
  const windowSize = Math.min(5, cardsLength);
  const startIndex = Math.max(
    0,
    Math.min(currentIndex - Math.floor(windowSize / 2), cardsLength - windowSize),
  );
  const visibleIndices = Array.from({ length: windowSize }, (_, i) => startIndex + i);

  return (
    <div
      className="min-h-full bg-[#F7F9FC] text-slate-900 py-6 px-4 sm:px-8 flex flex-col items-center"
      ref={confettiRef}
    >
      <div className="w-full max-w-6xl">
        {/* Set Header & Sliding 5-Dot Indicator */}
        {set && cardsLength > 0 && (
          <div className="mb-6 text-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-950 px-4">
              {set.title}
            </h1>

            {/* Sliding 5-Dot Indicator with Card Counter */}
            <div className="mt-3 flex items-center justify-center gap-2.5">
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200/90 px-3 py-1.5 shadow-2xs">
                {visibleIndices.map((idx) => {
                  const isCurrent = idx === currentIndex;
                  const isEdge =
                    (idx === startIndex && startIndex > 0) ||
                    (idx === startIndex + windowSize - 1 && startIndex + windowSize < cardsLength);
                  const isVisited = idx < currentIndex;

                  return (
                    <button
                      key={cards[idx]?.id || idx}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setFlippedIds(new Set());
                      }}
                      className={`h-2 transition-all duration-300 rounded-full ${
                        isCurrent
                          ? "w-6 bg-[#0C60FC] shadow-xs ring-2 ring-[#0C60FC]/20"
                          : isEdge
                            ? "w-1.5 bg-slate-300 opacity-60 scale-75"
                            : isVisited
                              ? "w-2 bg-slate-400 hover:bg-slate-600"
                              : "w-2 bg-slate-200 hover:bg-slate-300"
                      }`}
                      title={`Card ${idx + 1}`}
                      aria-label={`Jump to Card ${idx + 1}`}
                    />
                  );
                })}
              </div>

              <span className="text-[11px] font-extrabold text-slate-500 rounded-full bg-slate-100 px-2.5 py-0.5">
                {currentIndex + 1} / {cardsLength}
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-96 w-full max-w-4xl animate-pulse rounded-[32px] border border-slate-200 bg-white shadow-md" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50/50 p-8 text-center text-sm font-semibold text-rose-700">
            {error instanceof Error ? error.message : "Failed to load flashcard set"}
          </div>
        )}

        {/* Main Flashcard Stage */}
        {!isLoading && !error && set && cardsLength > 0 && currentCard && (
          <div className="flex flex-col items-center gap-6">
            {/* Card Frame with Adjacent Next / Prev Chevrons */}
            <div className="flex items-center justify-center w-full gap-3 sm:gap-6">
              {/* Previous Button */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="hidden sm:flex shrink-0 size-12 items-center justify-center rounded-2xl border border-slate-200/90 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-[#0C60FC] disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                title="Previous card (Left Arrow)"
                aria-label="Previous card"
              >
                <ChevronLeft className="size-6" />
              </button>

              {/* Card or Editor */}
              <div className="flex-1 w-full max-w-4xl flex justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {editingCardId === currentCard.id ? (
                    <motion.div
                      key={"edit-" + currentCard.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="w-full"
                    >
                      <FlipCard
                        card={currentCard}
                        flipped={flippedIds.has(currentCard.id)}
                        onFlip={() => toggleFlip(currentCard.id)}
                        onEdit={() => setEditingCardId(currentCard.id)}
                        onDelete={() => {
                          if (window.confirm("Delete this flashcard?")) {
                            deleteFlashcard.mutate(currentCard.id);
                          }
                        }}
                      >
                        {/* Rating Controls & Mastery Badge right on the card */}
                        <div
                          className="flex flex-col items-center gap-2 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMastery(currentCard.id, false);
                              }}
                              className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-rose-200 bg-rose-50/90 px-3.5 sm:px-6 py-2 sm:py-2.5 text-xs font-extrabold text-rose-700 shadow-2xs hover:bg-rose-100 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              <X className="size-3.5 sm:size-4" />
                              <span>Still Learning</span>
                              <span className="hidden sm:inline text-[11px] font-bold opacity-75">(1)</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMastery(currentCard.id, true);
                              }}
                              className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 sm:px-6 py-2 sm:py-2.5 text-xs font-extrabold text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              <Check className="size-3.5 sm:size-4" />
                              <span>Mastered</span>
                              <span className="hidden sm:inline text-[11px] font-bold opacity-75">(2)</span>
                            </button>
                          </div>

                          {currentCardMastery > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                              <Award className="size-3.5" />
                              <span>Card Mastery: {currentCardMastery}%</span>
                            </div>
                          )}
                        </div>
                      </FlipCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex >= cardsLength - 1}
                className="hidden sm:flex shrink-0 size-12 items-center justify-center rounded-2xl border border-slate-200/90 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-[#0C60FC] disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                title="Next card (Right Arrow)"
                aria-label="Next card"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>

            {/* Mobile Nav Bar */}
            <div className="flex sm:hidden items-center gap-3 w-full max-w-xs justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-30 shadow-xs"
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex >= cardsLength - 1}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-30 shadow-xs"
              >
                Next
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Keyboard Shortcuts Helper — Desktop only */}
            <div className="mt-2 hidden sm:flex flex-wrap items-center justify-center gap-2.5 text-[11px] font-semibold text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 shadow-2xs">
                <kbd className="font-bold text-slate-600">Space</kbd> Flip
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 shadow-2xs">
                <kbd className="font-bold text-slate-600">← / →</kbd> Prev / Next
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 shadow-2xs">
                <kbd className="font-bold text-slate-600">1</kbd> Again
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 shadow-2xs">
                <kbd className="font-bold text-slate-600">2</kbd> Mastered
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && set && cardsLength === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-300 bg-white py-20 px-6 text-center shadow-sm"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0C60FC] ring-1 ring-blue-200">
              <Layers className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No cards in this set</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              This flashcard set currently has no cards.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

