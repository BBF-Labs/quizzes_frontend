import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LibraryFlashcard } from "@/types/session";
import React from "react";
import { MarkdownContent } from "@/components/common/MarkdownContent";

export function FlipCard({
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
        className="relative w-full h-80 sm:h-88 md:h-104 max-w-4xl min-w-150"
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center border border-border/50 bg-card/80 px-8 py-10 rounded-2xl shadow-xl min-w-0"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-full max-w-4xl">
            <div className="text-lg sm:text-xl md:text-2xl font-mono text-center text-foreground leading-relaxed wrap-break-word select-none prose prose-invert max-w-none">
              <MarkdownContent>{card.front}</MarkdownContent>
            </div>
            {children}
          </div>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-center border border-primary/30 bg-primary/10 px-8 py-10 rounded-2xl shadow-xl min-w-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-full max-w-4xl">
            <div className="text-lg sm:text-xl md:text-2xl font-mono text-center text-foreground leading-relaxed wrap-break-word select-none prose prose-invert max-w-none">
              <MarkdownContent>{card.back}</MarkdownContent>
            </div>
          </div>
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
