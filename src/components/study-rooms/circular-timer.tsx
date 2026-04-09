"use client";

import { motion } from "framer-motion";

interface CircularTimerProps {
  percentage: number;
  remainingTime: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function CircularTimer({
  percentage,
  remainingTime,
  size = 280,
  strokeWidth = 12,
  color = "currentColor",
}: CircularTimerProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "linear" }}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span className="text-6xl font-mono font-black italic tracking-tighter text-foreground tabular-nums sm:text-7xl">
          {remainingTime}
        </span>
      </div>
    </div>
  );
}
