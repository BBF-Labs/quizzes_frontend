"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  /** Button size */
  buttonSize?: "sm" | "md";
  /** Position of page info (left or right) */
  infoPosition?: "left" | "right";
}

/**
 * Reusable pagination controller component
 * Handles page navigation with prev/next buttons and optional page info display.
 * Styled to match the Qz landing/app dashboard UI (rounded-2xl, bg-white border,
 * Neon Blue accent, no font-mono, uppercase labels).
 */
export function PaginationController({
  page,
  totalPages,
  onPageChange,
  showPageInfo = true,
  className,
  buttonSize = "sm",
  infoPosition = "left",
}: PaginationControllerProps) {
  const buttonSizeClass =
    buttonSize === "sm"
      ? "h-8 px-2 text-[10px]"
      : buttonSize === "md"
        ? "h-9 px-3 text-xs"
        : "h-8 px-2 text-[10px]";

  const buttonClasses =
    buttonSize === "sm"
      ? "rounded-2xl bg-white border border-slate-200 shadow-sm text-[10px] font-bold uppercase hover:bg-[#0C60FC]"
      : buttonSize === "md"
        ? "rounded-2xl bg-white border border-slate-200 shadow-sm text-xs font-bold uppercase hover:bg-[#0C60FC]"
        : "rounded-2xl bg-white border border-slate-200 shadow-sm text-[10px] font-bold uppercase hover:bg-[#0C60FC]";

  const pageInfo = (
    <span className="text-[10px] font-bold uppercase whitespace-nowrap text-slate-500">
      Page {page} of {Math.max(1, totalPages)}
    </span>
  );

  const buttons = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size={buttonSize === "md" ? "default" : "sm"}
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className={cn(
          buttonClasses,
          "rounded-2xl px-4 py-2.5 text-center gap-1.5",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-3" /> Prev
      </Button>
      <Button
        variant="outline"
        size={buttonSize === "md" ? "default" : "sm"}
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className={cn(
          buttonClasses,
          "rounded-2xl px-4 py-2.5 text-center gap-1.5",
        )}
        aria-label="Next page"
      >
        Next <ChevronRight className="size-3" />
      </Button>
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
