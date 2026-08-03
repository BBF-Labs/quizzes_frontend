"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingHeader, LandingFooter } from "@/components/landing";
import {
  QUBI_PEEK_SRC,
  QUBI_STUDY_SRC,
  QUBI_WAVE_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

const QUBI_STAGES = [
  {
    src: QUBI_PEEK_SRC,
    label: "peeking around...",
    sub: "Finding your study materials.",
  },
  {
    src: QUBI_STUDY_SRC,
    label: "doing the reading...",
    sub: "Reading your recent sessions.",
  },
  {
    src: QUBI_RUN_SRC,
    label: "running the numbers...",
    sub: "Counting your streaks and goals.",
  },
  {
    src: QUBI_WAVE_SRC,
    label: "almost there...",
    sub: "Wrapping things up.",
  },
];

const ROTATE_MS = 1800;

export default function Loading() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStageIndex((i) => (i + 1) % QUBI_STAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const stage = QUBI_STAGES[stageIndex];
  // Each stage gets a different accent color so the loader feels alive
  const accent = ["#0C60FC", "#7C3AED", "#F59E0B", "#10B981"][stageIndex];

  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main className="soft-grid relative overflow-hidden">
        {/* Soft-grid background blobs */}
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-100/70 blur-3xl" />

        <div className="relative mx-auto max-w-2xl px-5 pt-32 pb-24 lg:pt-40">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#0C60FC]" />
              Loading
            </div>

            <h1 className="display text-balance text-5xl font-bold leading-[1.04] tracking-[-.045em] text-slate-950 sm:text-6xl">
              Setting up your <span className="text-[#0C60FC]">study desk.</span>
            </h1>

            <p className="hand mx-auto mt-3 max-w-xl -rotate-1 text-2xl text-[#0C60FC]">
              warming the engines ↘
            </p>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
              Qz is fetching your study materials, recent sessions and goals.
              Hang tight — this usually takes a couple of seconds.
            </p>
          </div>

          {/* Status card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative mx-auto mt-12 max-w-md overflow-visible rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-blue-50/50 sm:p-10"
            style={{ borderRadius: "32px" }}
          >
            {/* Qubi rotating on top-right */}
            <div className="qubi-sticker absolute -right-2 -top-14 hidden sm:block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`label-${stageIndex}`}
                  initial={{ opacity: 0, y: 6, rotate: -8 }}
                  animate={{ opacity: 1, y: 0, rotate: -6 }}
                  exit={{ opacity: 0, y: -6, rotate: -4 }}
                  transition={{ duration: 0.35 }}
                  className="hand absolute -left-28 top-2 w-28 text-xl leading-5"
                  style={{ color: accent }}
                >
                  {stage.label}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.img
                  key={`img-${stageIndex}`}
                  src={stage.src}
                  alt="Qubi working while the page loads"
                  initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.85, rotate: 6 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-24 w-24 object-contain"
                />
              </AnimatePresence>
            </div>

            {/* Big Qubi stage with morphing loader */}
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
              {/* Animated ring */}
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  stroke={accent}
                  strokeDasharray="276"
                  animate={{ strokeDashoffset: [276, 90, 276] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>

              {/* Qubi portrait in the middle */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={`center-${stageIndex}`}
                  src={stage.src}
                  alt=""
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.35 }}
                  className="relative h-16 w-16 object-contain"
                />
              </AnimatePresence>
            </div>

            {/* Stage sub-label */}
            <p className="mt-6 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`sub-${stageIndex}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                  style={{ color: accent }}
                >
                  {stage.sub}
                </motion.span>
              </AnimatePresence>
            </p>

            {/* Stage indicators */}
            <div className="mt-4 flex items-center justify-center gap-1.5">
              {QUBI_STAGES.map((_, i) => (
                <motion.span
                  key={i}
                  className="h-1.5 rounded-full"
                  animate={{
                    width: i === stageIndex ? 24 : 6,
                    backgroundColor: i === stageIndex ? accent : "#E2E8F0",
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            {/* Skeleton pulse rows */}
            <div className="mt-8 space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-3 w-full animate-pulse rounded-full bg-slate-100"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>

            <p className="mt-8 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Don&apos;t refresh — you&apos;ll lose your place.
            </p>
          </motion.div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
