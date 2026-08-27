"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingOrbProps {
  isThinking?: boolean;
  position?: "ai" | "user" | "center";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GlowingOrb({
  isThinking = false,
  position = "ai",
  size = "md",
  className,
}: GlowingOrbProps) {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-11 w-11",
    lg: "h-14 w-14",
  };

  return (
    <motion.div
      layoutId="conversation-glowing-orb"
      layout
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 24,
      }}
      className={cn(
        "relative flex flex-col items-center justify-center my-2 select-none pointer-events-none transition-all",
        position === "ai" && "self-center sm:self-start sm:ml-4",
        position === "user" && "self-end mr-4",
        position === "center" && "self-center",
        className
      )}
    >
      {isThinking && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="hand text-xs sm:text-sm text-slate-400 -rotate-2 mb-1 select-none"
        >
          thinking…
        </motion.span>
      )}

      <motion.div
        animate={
          isThinking
            ? {
                scale: [1, 1.15, 1],
                rotate: [0, 180, 360],
                filter: [
                  "hue-rotate(0deg) blur(0px)",
                  "hue-rotate(60deg) blur(1px)",
                  "hue-rotate(0deg) blur(0px)",
                ],
              }
            : position === "user"
            ? {
                scale: [1, 1.04, 1],
                filter: "hue-rotate(180deg)",
              }
            : {
                scale: [1, 1.05, 1],
                filter: "hue-rotate(0deg)",
              }
        }
        transition={{
          duration: isThinking ? 2.5 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "relative rounded-full shadow-lg shadow-orange-500/25 transition-all",
          sizeClasses[size]
        )}
        style={{
          background:
            position === "user"
              ? "radial-gradient(circle at 35% 35%, #0C60FC 0%, #3B82F6 40%, #8B5CF6 80%, #6366F1 100%)"
              : "radial-gradient(circle at 35% 35%, #FF7A59 0%, #FF5252 35%, #9C27B0 75%, #3F51B5 100%)",
        }}
      >
        {/* Ambient atmospheric halo */}
        <div
          className="absolute -inset-2.5 rounded-full opacity-40 blur-md pointer-events-none"
          style={{
            background:
              position === "user"
                ? "radial-gradient(circle, #3B82F6 0%, #8B5CF6 70%, transparent 100%)"
                : "radial-gradient(circle, #FF7A59 0%, #9C27B0 70%, transparent 100%)",
          }}
        />
        {/* Specular light highlight */}
        <div className="absolute top-1 left-1.5 h-2 w-2 rounded-full bg-white/70 blur-[0.4px]" />
      </motion.div>
    </motion.div>
  );
}
