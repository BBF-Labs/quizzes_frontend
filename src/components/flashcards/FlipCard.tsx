import { motion } from "framer-motion";
import { Pencil, Trash2, RotateCw } from "lucide-react";
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
        "relative group cursor-pointer flex flex-col items-center justify-center w-full select-none",
        className,
      )}
      style={{ perspective: 1200, ...style }}
      onClick={onFlip}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] max-w-4xl"
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-[28px] sm:rounded-[36px] border border-slate-200/90 bg-white p-7 sm:p-10 md:p-12 shadow-lg hover:shadow-xl transition-all"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Top meta */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              Question
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <RotateCw className="size-3.5" />
              <span className="hidden sm:inline">Click to flip</span>
              <span className="sm:hidden">Tap to flip</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="my-auto text-center px-4 sm:px-8 overflow-y-auto max-h-[220px] sm:max-h-[280px]">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-relaxed wrap-break-word select-none prose max-w-none">
              <MarkdownContent>{card.front}</MarkdownContent>
            </div>
          </div>

          {/* Children / Mastery Controls */}
          {children && (
            <div
              className="mt-auto w-full flex flex-col items-center justify-center pt-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          )}
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-[28px] sm:rounded-[36px] border-2 border-[#0C60FC]/30 bg-gradient-to-b from-blue-50/50 via-white to-white p-7 sm:p-10 md:p-12 shadow-lg hover:shadow-xl transition-all"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Top meta */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0C60FC] ring-1 ring-blue-200">
              Answer
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C60FC]">
              <RotateCw className="size-3.5" />
              <span className="hidden sm:inline">Click to flip back</span>
              <span className="sm:hidden">Tap to flip back</span>
            </div>
          </div>

          {/* Answer Text */}
          <div className="my-auto text-center px-4 sm:px-8 overflow-y-auto max-h-[200px] sm:max-h-[240px]">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-relaxed wrap-break-word select-none prose max-w-none">
              <MarkdownContent>{card.back}</MarkdownContent>
            </div>
          </div>

          {/* Children / Mastery Controls */}
          {children ? (
            <div
              className="mt-auto w-full flex flex-col items-center justify-center pt-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      </motion.div>

      {/* Edit / Delete buttons — only visible on hover */}
      {!flipped && (
        <div
          className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 shadow-sm transition-all"
            title="Edit card"
            aria-label="Edit card"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 shadow-sm transition-all"
            title="Delete card"
            aria-label="Delete card"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

