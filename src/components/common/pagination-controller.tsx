"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControllerProps {
  /** Current page number */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Show page info text */
  showPageInfo?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Position of page info (left or right) */
  infoPosition?: "left" | "right";
}

/**
 * Reusable pagination controller component
 * Handles page navigation with prev/next buttons and optional page info display.
 * Pill-shaped buttons with Neon Blue fill, matching the Qz app/login button style.
 */
export function PaginationController({
  page,
  totalPages,
  onPageChange,
  showPageInfo = true,
  className,
  infoPosition = "left",
}: PaginationControllerProps) {
  const pageInfo = (
    <span className="text-[10px] font-bold uppercase whitespace-nowrap text-slate-500">
      Page {page} of {Math.max(1, totalPages)}
    </span>
  );

  const buttons = (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-4 py-1.5 text-[10px] font-bold uppercase text-slate-600 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-3" /> Prev
      </button>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-[#0C60FC] px-4 py-1.5 text-[10px] font-bold uppercase text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-label="Next page"
      >
        Next <ChevronRight className="size-3" />
      </button>
    </div>
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-3",
        className,
      )}
    >
      {infoPosition === "left" && showPageInfo ? pageInfo : null}
      {buttons}
      {infoPosition === "right" && showPageInfo ? pageInfo : null}
    </div>
  );
}