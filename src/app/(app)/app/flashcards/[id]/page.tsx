"use client";

import { useEffect, useState, useRef } from "react";
import { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useUiPreferences } from "@/hooks/common/use-ui-preferences";
import confetti from "canvas-confetti";
import type { FlashcardSetDetail, LibraryFlashcard } from "@/types/session";

const MAX_CARDS = 50;

// ─── Flip Card (Refactored) ────────────────────────────────────────────────
function FlipCard({
  card,
  flipped,
  onFlip,
  onEdit,
  onDelete,
  children,
  style,
  className,
}: {
  card: LibraryFlashcard;
  flipped: boolean;
  onFlip: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative group cursor-pointer flex flex-col items-center justify-center",
        className,
      )}
      style={{ perspective: 1200, ...style }}
      onClick={onFlip}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-85 sm:h-105 md:h-130"
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center border border-border/50 bg-card/80 px-8 py-10 rounded-2xl shadow-xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-2xl sm:text-3xl md:text-4xl font-mono text-center text-foreground leading-relaxed max-w-3xl select-none">
            {card.front}
          </p>
          {children}
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-center border border-primary/30 bg-primary/10 px-8 py-10 rounded-2xl shadow-xl"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-2xl sm:text-3xl md:text-4xl font-mono text-center text-foreground leading-relaxed max-w-3xl select-none">
            {card.back}
          </p>
        </div>
      </motion.div>
      {/* Edit / Delete buttons — only on front face */}
      {!flipped && (
        <div
          className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 border border-border/40 bg-background/70 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Edit card"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 border border-border/40 bg-background/70 text-muted-foreground/50 hover:text-destructive transition-colors"
            aria-label="Delete card"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Inline add / edit form ───────────────────────────────────────────────────

function CardForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial?: { front: string; back: string };
  onSave: (front: string, back: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [front, setFront] = useState(initial?.front ?? "");
  const [back, setBack] = useState(initial?.back ?? "");

  const valid = front.trim() && back.trim();

  return (
    <div className="border border-primary/30 bg-primary/5 p-3 flex flex-col gap-2">
      <Input
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder="Front…"
        className="h-7 text-[11px] font-mono"
        autoFocus
      />
      <Input
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder="Back…"
        className="h-7 text-[11px] font-mono"
        onKeyDown={(e) => {
          if (e.key === "Enter" && valid) onSave(front, back);
        }}
      />
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[9px] font-mono"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-6 text-[9px] font-mono"
          disabled={!valid || loading}
          onClick={() => onSave(front, back)}
        >
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlashcardSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { remoteUiPreferences } = useUiPreferences();

  const [set, setSet] = useState<FlashcardSetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const [addingCard, setAddingCard] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<{ data: FlashcardSetDetail }>(`/app/flashcards/${id}`)
      .then((res) => setSet(res.data?.data ?? null))
      .catch((err) => {
        console.error("[FlashcardSetDetailPage] load failed", err);
        setError("Failed to load flashcard set.");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    const total = set?.cards.length ?? 0;
    if (total === 0) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((prev) => Math.min(prev, total - 1));
  }, [set?.cards.length]);

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

  const handleAddCard = async (front: string, back: string) => {
    if (!set) return;
    setAddLoading(true);
    try {
      const res = await api.post<{ data: LibraryFlashcard }>(
        `/app/flashcards/${id}/cards`,
        { front: front.trim(), back: back.trim() },
      );
      const newCard = res.data?.data;
      if (newCard) {
        setSet((prev) =>
          prev ? { ...prev, cards: [...prev.cards, newCard] } : prev,
        );
      }
      setAddingCard(false);
    } catch (err) {
      console.error("[FlashcardSetDetailPage] add card failed", err);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditCard = async (
    cardId: string,
    front: string,
    back: string,
  ) => {
    if (!set) return;
    setEditLoading(true);
    try {
      await api.patch(`/app/flashcards/${id}/cards/${cardId}`, {
        front: front.trim(),
        back: back.trim(),
      });
      setSet((prev) =>
        prev
          ? {
              ...prev,
              cards: prev.cards.map((c) =>
                c.id === cardId ? { ...c, front, back } : c,
              ),
            }
          : prev,
      );
      setEditingCardId(null);
    } catch (err) {
      console.error("[FlashcardSetDetailPage] edit card failed", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!set || deletingIds.has(cardId)) return;
    setDeletingIds((p) => new Set([...p, cardId]));
    try {
      await api.delete(`/app/flashcards/${id}/cards/${cardId}`);
      setSet((prev) =>
        prev
          ? { ...prev, cards: prev.cards.filter((c) => c.id !== cardId) }
          : prev,
      );
    } catch (err) {
      console.error("[FlashcardSetDetailPage] delete card failed", err);
    } finally {
      setDeletingIds((p) => {
        const next = new Set(p);
        next.delete(cardId);
        return next;
      });
    }
  };

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

  const isFull = (set?.cards.length ?? 0) >= MAX_CARDS;
  const currentCard = set?.cards[currentIndex] ?? null;

  // UI preferences
  const cardStyle = remoteUiPreferences
    ? {
        borderRadius: `${remoteUiPreferences.radiusRem ?? 1}rem`,
        fontFamily: remoteUiPreferences.fontPreset,
        background:
          remoteUiPreferences.palette === "custom"
            ? remoteUiPreferences.customColors.primary
            : undefined,
      }
    : {};

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
          {error}
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
          <div className="flex-1 flex flex-col items-center justify-center">
            {editingCardId === currentCard.id ? (
              <CardForm
                initial={{ front: currentCard.front, back: currentCard.back }}
                onSave={(f, b) => handleEditCard(currentCard.id, f, b)}
                onCancel={() => setEditingCardId(null)}
                loading={editLoading}
              />
            ) : (
              <FlipCard
                card={currentCard}
                flipped={flippedIds.has(currentCard.id)}
                onFlip={() => toggleFlip(currentCard.id)}
                onEdit={() => setEditingCardId(currentCard.id)}
                onDelete={() => handleDeleteCard(currentCard.id)}
                style={cardStyle}
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
            )}
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

      {/* Add card form */}
      <AnimatePresence>
        {addingCard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <CardForm
              onSave={handleAddCard}
              onCancel={() => setAddingCard(false)}
              loading={addLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
