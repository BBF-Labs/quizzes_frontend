"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingOrbProps {
  isThinking?: boolean;
  isTyping?: boolean;
  inputLength?: number;
  position?: "ai" | "user" | "center";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GlowingOrb({
  isThinking = false,
  isTyping = false,
  inputLength = 0,
  position = "ai",
  size = "md",
  className,
}: GlowingOrbProps) {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-10 w-10 sm:h-11 sm:w-11",
    lg: "h-14 w-14",
  };

  // Compute dynamic offset based on typing
  const typingX = isTyping ? ((inputLength * 7) % 36) - 18 : 0;
  const typingY = isTyping ? -Math.min(16, (inputLength % 4) * 4) : 0;
  const typingRotate = isTyping ? (inputLength * 28) % 360 : 0;

  return (
    <motion.div
      animate={{
        x: typingX,
        y: typingY,
      }}
      transition={{
        type: "spring",
        stiffness: 340,
        damping: 18,
      }}
      className={cn(
        "relative flex flex-col my-3 select-none pointer-events-none transition-all",
        position === "ai" && "items-start self-start ml-2 sm:ml-4",
        position === "user" && "items-end self-end mr-2 sm:mr-4",
        position === "center" && "items-center self-center",
        className
      )}
    >
      {isThinking && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="hand text-xs text-slate-400 -rotate-2 mb-1 select-none font-medium ml-1"
        >
          thinking…
        </motion.span>
      )}

      {isTyping && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="hand text-[11px] text-indigo-500 font-bold mb-1 select-none ml-1 animate-pulse"
        >
          listening…
        </motion.span>
      )}

      <motion.div
        animate={
          isThinking
            ? {
                scale: [1, 1.15, 1],
                rotate: [0, 180, 360],
                filter: [
                  "drop-shadow(0 4px 14px rgba(255, 107, 74, 0.5))",
                  "drop-shadow(0 8px 22px rgba(138, 43, 226, 0.6))",
                  "drop-shadow(0 4px 14px rgba(255, 107, 74, 0.5))",
                ],
              }
            : isTyping
            ? {
                scale: [1.05, 1.16, 1.08],
                rotate: typingRotate,
                filter: [
                  "drop-shadow(0 6px 18px rgba(99, 102, 241, 0.6))",
                  "drop-shadow(0 8px 24px rgba(236, 72, 153, 0.6))",
                  "drop-shadow(0 6px 18px rgba(99, 102, 241, 0.6))",
                ],
              }
            : position === "user"
            ? {
                scale: [1, 1.04, 1],
                filter: "drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4))",
              }
            : {
                scale: [1, 1.05, 1],
                filter: "drop-shadow(0 4px 14px rgba(255, 87, 34, 0.45))",
              }
        }
        transition={{
          duration: isTyping ? 0.35 : isThinking ? 2.5 : 4,
          repeat: isTyping ? 0 : Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "relative rounded-full transition-all shrink-0",
          sizeClasses[size]
        )}
        style={{
          background:
            isTyping
              ? "radial-gradient(circle at 35% 30%, #EC4899 0%, #8B5CF6 40%, #3B82F6 80%, #06B6D4 100%)"
              : position === "user"
              ? "radial-gradient(circle at 35% 30%, #60A5FA 0%, #3B82F6 40%, #8B5CF6 75%, #4F46E5 100%)"
              : "radial-gradient(circle at 32% 28%, #FF7A50 0%, #FF4500 35%, #9333EA 75%, #3B4CCA 100%)",
        }}
      >
        {/* Ambient atmospheric halo */}
        <div
          className="absolute -inset-2 rounded-full opacity-40 blur-md pointer-events-none"
          style={{
            background:
              isTyping
                ? "radial-gradient(circle, #EC4899 0%, #8B5CF6 70%, transparent 100%)"
                : position === "user"
                ? "radial-gradient(circle, #3B82F6 0%, #8B5CF6 70%, transparent 100%)"
                : "radial-gradient(circle, #FF5722 0%, #7C3AED 70%, transparent 100%)",
          }}
        />
        {/* Soft specular light dot */}
        <div className="absolute top-1.5 left-2 h-2.5 w-2.5 rounded-full bg-white/70 blur-[0.6px]" />
      </motion.div>
    </motion.div>
  );
}
