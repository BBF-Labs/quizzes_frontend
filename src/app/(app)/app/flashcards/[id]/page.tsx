"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FlashcardSetDetail, LibraryFlashcard } from "@/types/session";

const MAX_CARDS = 50;

// ─── Flip Card ────────────────────────────────────────────────────────────────

function FlipCard({
  card,
  flipped,
  onFlip,
  onEdit,
  onDelete,
}: {
  card: LibraryFlashcard;
  flipped: boolean;
  onFlip: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="relative group cursor-pointer"
      style={{ perspective: 1200 }}
      onClick={onFlip}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-95 sm:h-110 md:h-125 w-full"
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex items-center justify-center border border-border/50 bg-card/70 px-8 py-10"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-lg sm:text-xl md:text-2xl font-mono text-center text-foreground leading-relaxed max-w-3xl">
            {card.front}
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-center border border-primary/30 bg-primary/10 px-8 py-10"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-lg sm:text-xl md:text-2xl font-mono text-center text-foreground leading-relaxed max-w-3xl">
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

  const isFull = (set?.cards.length ?? 0) >= MAX_CARDS;
  const currentCard = set?.cards[currentIndex] ?? null;

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Back link */}
        <Link
          href="/app/flashcards"
          className="inline-block mb-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors"
        >
          ← All Sets
        </Link>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-30 animate-pulse bg-card/40 border border-border/30"
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

        {set && (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tighter">
                    {set.title}
                  </h1>
                  {(set.courseTitle || set.courseCode) && (
                    <p className="mt-1 text-[11px] font-mono text-muted-foreground/60">
                      {[set.courseTitle, set.courseCode]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-muted-foreground/40">
                    {set.cards.length}/{MAX_CARDS} cards
                  </span>
                  {!isFull ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-[10px] font-mono"
                      onClick={() => setAddingCard(true)}
                    >
                      <Plus className="size-3" />
                      Add Card
                    </Button>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground/40 border border-border/30 px-2 py-1">
                      Set is full ({MAX_CARDS}/{MAX_CARDS})
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 h-px w-10 bg-primary/40" />
            </motion.div>

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

            {/* Empty state */}
            {set.cards.length === 0 && !addingCard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-20 text-center"
              >
                <CheckCircle className="size-8 text-muted-foreground/20" />
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
                  No cards yet — add one above.
                </p>
              </motion.div>
            )}

            {set.cards.length > 0 && currentCard && (
              <>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentIndex === 0}
                    className="h-7 px-2 border border-border/50 bg-card/30 text-[10px] font-mono uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="size-3" /> Prev
                  </button>

                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                    Card {currentIndex + 1} of {set.cards.length}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        Math.min((set.cards.length || 1) - 1, prev + 1),
                      )
                    }
                    disabled={currentIndex >= set.cards.length - 1}
                    className="h-7 px-2 border border-border/50 bg-card/30 text-[10px] font-mono uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-colors flex items-center gap-1"
                  >
                    Next <ChevronRight className="size-3" />
                  </button>
                </div>

                {editingCardId === currentCard.id ? (
                  <CardForm
                    initial={{
                      front: currentCard.front,
                      back: currentCard.back,
                    }}
                    onSave={(f, b) => handleEditCard(currentCard.id, f, b)}
                    onCancel={() => setEditingCardId(null)}
                    loading={editLoading}
                  />
                ) : (
                  <div
                    className={cn(
                      "mx-auto max-w-4xl",
                      deletingIds.has(currentCard.id)
                        ? "opacity-40 pointer-events-none"
                        : "",
                    )}
                  >
                    <FlipCard
                      card={currentCard}
                      flipped={flippedIds.has(currentCard.id)}
                      onFlip={() => toggleFlip(currentCard.id)}
                      onEdit={() => setEditingCardId(currentCard.id)}
                      onDelete={() => handleDeleteCard(currentCard.id)}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
