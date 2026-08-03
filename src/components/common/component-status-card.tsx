import type { ComponentStatus } from "@/hooks/common/use-status";
import {
  QUBI_WAVE_SRC,
  QUBI_STUDY_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

interface ComponentStatusCardProps {
  component: ComponentStatus;
}

/**
 * Friendly component card — Qubi mood in the corner + plain verdict.
 * Pure server-renderable markup — no interactivity, no `"use client"`.
 */

const QUBI_SRC = {
  operational: QUBI_WAVE_SRC,
  degraded: QUBI_STUDY_SRC,
  down: QUBI_RUN_SRC,
} as const;

const VERDICT = {
  operational: { text: "Healthy", palette: "text-emerald-700" },
  degraded: { text: "A bit slow", palette: "text-amber-700" },
  down: { text: "Not responding", palette: "text-rose-700" },
} as const;

const RING = {
  operational: "border-emerald-200",
  degraded: "border-amber-200",
  down: "border-rose-200",
} as const;

const BG = {
  operational: "bg-emerald-50/50",
  degraded: "bg-amber-50/50",
  down: "bg-rose-50/50",
} as const;

export function ComponentStatusCard({ component }: ComponentStatusCardProps) {
  const { state, label, latencyMs, message } = component;
  const verdict = VERDICT[state];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${RING[state]} ${BG[state]} p-5 pr-16`}
    >
      {/* mini Qubi in the corner — mood matches the component state */}
      <div className="pointer-events-none absolute -right-3 -top-3 opacity-90">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={QUBI_SRC[state]}
          alt=""
          className="h-16 w-16 object-contain"
        />
      </div>

      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-950">
        {verdict.text}
      </p>
      {message && (
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
          {message}
        </p>
      )}
      {latencyMs !== null && (
        <p className="mt-2 text-[10px] font-semibold text-slate-400">
          Responded in {latencyMs >= 1000 ? `${(latencyMs / 1000).toFixed(1)}s` : `${latencyMs}ms`}
        </p>
      )}
    </div>
  );
}
