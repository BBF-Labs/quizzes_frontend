"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  QUBI_PEEK_SRC,
  QUBI_STUDY_SRC,
  QUBI_RUN_SRC,
  QUBI_WAVE_SRC,
} from "@/lib/constants";

const QUBI_STAGES = [
  { src: QUBI_PEEK_SRC, posture: "peeking", line: "Hang on while we check your credentials..." },
  { src: QUBI_STUDY_SRC, posture: "studying", line: "Hang on while we read the rules..." },
  { src: QUBI_RUN_SRC, posture: "running", line: "Hang on while we sync your account..." },
  { src: QUBI_WAVE_SRC, posture: "waving", line: "Almost ready — give us a sec..." },
];

const ROTATE_MS = 1600;

interface LoaderProps {
  /** Optional override for the small kicker label above the title. */
  message?: string;
}

export function Loader({ message = "Loading" }: LoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStageIndex((i) => (i + 1) % QUBI_STAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const stage = QUBI_STAGES[stageIndex];

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-5 text-slate-900">
      {/* pill chip */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#0C60FC]" />
        {message}
      </div>

      {/* big cycling Qubi */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={`qubi-${stageIndex}`}
            src={stage.src}
            alt={`Qubi ${stage.posture}`}
            initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotate: 6 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-28 w-28 object-contain"
          />
        </AnimatePresence>
      </div>

      {/* posture label with green/yellow scribble marker */}
      <div className="mt-5 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={`posture-${stageIndex}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
          >
            <span className="scribble">{stage.posture}</span>
            <span className="text-[#0C60FC]">.</span>
          </motion.span>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`line-${stageIndex}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="mt-3 max-w-md text-sm leading-6 text-slate-600"
          >
            {stage.line}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* step indicators */}
      <div className="mt-7 flex items-center justify-center gap-1.5">
        {QUBI_STAGES.map((_, i) => (
          <motion.span
            key={i}
            className="h-1.5 rounded-full bg-[#0C60FC]"
            animate={{
              width: i === stageIndex ? 24 : 6,
              opacity: i === stageIndex ? 1 : 0.25,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      <p className="mt-10 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
        Don&apos;t refresh — you&apos;ll lose your place.
      </p>
    </div>
  );
}
