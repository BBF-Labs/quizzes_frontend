"use client";

import { motion } from "framer-motion";

/**
 * A square border with a small gap that continuously travels around the perimeter —
 * like an "almost complete" border snaking clockwise.
 * Uses currentColor so it inherits whatever text-* color is set on the parent.
 */
export function SquareLoader({
  size = 20,
  strokeWidth = 2,
  className = "",
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const half = strokeWidth / 2;
  const inner = size - strokeWidth;
  const perimeter = inner * 4;
  const dashLength = perimeter * 0.82;
  const gapLength = perimeter - dashLength;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`shrink-0 text-primary ${className}`}
      style={{ overflow: "visible" }}
    >
      <motion.rect
        x={half}
        y={half}
        width={inner}
        height={inner}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={`${dashLength} ${gapLength}`}
        strokeLinecap="square"
        animate={{ strokeDashoffset: [0, -perimeter] }}
        transition={{
          repeat: Infinity,
          duration: 1.4,
          ease: "linear",
        }}
      />
    </svg>
  );
}
