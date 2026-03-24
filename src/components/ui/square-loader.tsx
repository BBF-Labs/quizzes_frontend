"use client";

import { useEffect, useState } from "react";
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
  const [radiusPx, setRadiusPx] = useState(0);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;

    const updateRadius = () => {
      const value = getComputedStyle(root).getPropertyValue("--radius").trim();
      if (!value) {
        setRadiusPx(0);
        return;
      }

      const parsed = Number.parseFloat(value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setRadiusPx(0);
        return;
      }

      if (value.endsWith("rem")) {
        const rootFontSize = Number.parseFloat(
          getComputedStyle(root).fontSize || "16",
        );
        setRadiusPx(
          parsed * (Number.isFinite(rootFontSize) ? rootFontSize : 16),
        );
        return;
      }

      setRadiusPx(parsed);
    };

    updateRadius();

    const observer = new MutationObserver(updateRadius);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["style", "data-ui-customized"],
    });

    return () => observer.disconnect();
  }, []);

  const half = strokeWidth / 2;
  const inner = size - strokeWidth;
  const perimeter = inner * 4;
  const dashLength = perimeter * 0.82;
  const gapLength = perimeter - dashLength;
  const cornerRadius =
    radiusPx > 0 ? Math.min(inner / 4, Math.max(1, radiusPx / 3)) : 0;
  const lineCap = cornerRadius > 0 ? "round" : "square";

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
        rx={cornerRadius}
        ry={cornerRadius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={`${dashLength} ${gapLength}`}
        strokeLinecap={lineCap}
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
