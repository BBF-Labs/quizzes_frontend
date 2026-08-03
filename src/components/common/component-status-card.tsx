import type { ComponentStatus } from "@/hooks/common/use-status";

interface ComponentStatusCardProps {
  component: ComponentStatus;
}

/**
 * Friendly component card — plain verdict + latency sub-line.
 * Pure server-renderable markup — no interactivity, no `"use client"`.
 */

const VERDICT = {
  operational: {
    text: "Healthy",
    palette: "text-emerald-700",
    ring: "border-emerald-200",
    bg: "bg-emerald-50/50",
  },
  degraded: {
    text: "A bit slow",
    palette: "text-amber-700",
    ring: "border-amber-200",
    bg: "bg-amber-50/50",
  },
  down: {
    text: "Not responding",
    palette: "text-rose-700",
    ring: "border-rose-200",
    bg: "bg-rose-50/50",
  },
} as const;

export function ComponentStatusCard({ component }: ComponentStatusCardProps) {
  const { state, label, latencyMs, message } = component;
  const v = VERDICT[state];

  return (
    <div className={`rounded-2xl border ${v.ring} ${v.bg} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${v.palette}`}>
          {v.text}
        </span>
      </div>
      {message && (
        <p className="mt-1 text-sm leading-5 text-slate-700">{message}</p>
      )}
      {latencyMs !== null && (
        <p className="mt-2 text-[10px] font-semibold text-slate-400">
          Responded in {latencyMs >= 1000 ? `${(latencyMs / 1000).toFixed(1)}s` : `${latencyMs}ms`}
        </p>
      )}
    </div>
  );
}
