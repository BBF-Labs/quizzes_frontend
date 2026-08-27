"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingOrbProps {
  isThinking?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GlowingOrb({
  isThinking = false,
  size = "md",
  className,
}: GlowingOrbProps) {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-11 w-11",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn("relative flex flex-col items-center justify-center my-3", className)}>
      {isThinking && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="hand text-sm sm:text-base text-slate-400 -rotate-2 mb-1.5 select-none"
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
                  "hue-rotate(45deg) blur(1px)",
                  "hue-rotate(0deg) blur(0px)",
                ],
              }
            : {
                scale: [1, 1.05, 1],
              }
        }
        transition={{
          duration: isThinking ? 2.5 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "relative rounded-full shadow-lg shadow-orange-500/20",
          sizeClasses[size]
        )}
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #FF7A59 0%, #FF5252 35%, #9C27B0 75%, #3F51B5 100%)",
        }}
      >
        {/* Soft atmospheric ambient glow */}
        <div
          className="absolute -inset-2 rounded-full opacity-40 blur-md pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, #FF7A59 0%, #9C27B0 60%, transparent 100%)",
          }}
        />
        {/* Inner specular highlight */}
        <div className="absolute top-1 left-1.5 h-2 w-2 rounded-full bg-white/60 blur-[0.5px]" />
      </motion.div>
    </div>
  );
}
