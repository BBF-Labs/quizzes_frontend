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
 * Handles page navigation with prev/next buttons and optional page info display
 * 
 * Usage:
 * ```tsx
 * <PaginationController
 *   page={page}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 * />
 * ```
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
  // Don't render if only one page
  if (totalPages <= 1) return null;

  const buttonClasses =
    buttonSize === "sm"
      ? "h-8 px-2 text-[10px]"
      : "h-9 px-3 text-xs";

  const pageInfo = (
    <span className="text-[10px] font-mono uppercase text-muted-foreground whitespace-nowrap">
      Page {page} of {totalPages}
    </span>
  );

  const buttons = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className={cn(
          "rounded-none font-mono tracking-widest uppercase gap-2",
          buttonClasses,
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-3" /> Prev
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className={cn(
          "rounded-none font-mono tracking-widest uppercase gap-2",
          buttonClasses,
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
        "flex items-center justify-between px-6 py-4 border-t border-border/10 bg-secondary/5",
        className,
      )}
    >
      {infoPosition === "left" && showPageInfo ? pageInfo : null}
      {buttons}
      {infoPosition === "right" && showPageInfo ? pageInfo : null}
    </div>
  );
}
