import { Database, Zap, BrainCircuit, Globe, type LucideIcon } from "lucide-react";
import type { ComponentStatus } from "@/hooks/common/use-status";

type ComponentId = ComponentStatus["id"];

interface ComponentStatusCardProps {
  component: ComponentStatus;
}

/**
 * Friendly component card — leading icon tile + verdict pill + latency sub-line.
 * Pure server-renderable markup — no interactivity, no `"use client"`.
 *
 * Restyled to match the Qz marketing surface: rounded-[26px] landing card,
 * lucide icon tile tinted per state, no body-tint background.
 */

const ICON_MAP: Record<ComponentId, LucideIcon> = {
  mongodb: Database,
  redis: Zap,
  openrouter: BrainCircuit,
  api: Globe,
};

const VERDICT = {
  operational: {
    text: "Healthy",
    palette: "text-emerald-700",
    ring: "border-emerald-200",
    tileBg: "bg-emerald-50",
    tileInk: "text-emerald-700",
    pillBg: "bg-emerald-50",
  },
  degraded: {
    text: "A bit slow",
    palette: "text-amber-700",
    ring: "border-amber-200",
    tileBg: "bg-amber-50",
    tileInk: "text-amber-700",
    pillBg: "bg-amber-50",
  },
  down: {
    text: "Not responding",
    palette: "text-rose-700",
    ring: "border-rose-200",
    tileBg: "bg-rose-50",
    tileInk: "text-rose-700",
    pillBg: "bg-rose-50",
  },
} as const;

export function ComponentStatusCard({ component }: ComponentStatusCardProps) {
  const { id, state, label, latencyMs, message } = component;
  const v = VERDICT[state];
  const Icon = ICON_MAP[id];

  return (
    <div
      className={`play-card rounded-[26px] border ${v.ring} bg-white p-6`}
      style={{ borderRadius: "26px" }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${v.tileBg}`}
        >
          <Icon className={`h-5 w-5 ${v.tileInk}`} strokeWidth={2.25} />
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border ${v.ring} ${v.pillBg} px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${v.palette}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${v.tileInk.replace("text-", "bg-")} ${state === "down" ? "animate-pulse" : ""}`}
          />
          {v.text}
        </span>
      </div>

      <p className="mt-5 text-base font-extrabold text-slate-950">{label}</p>

      {message && (
        <p className="mt-1 text-sm leading-5 text-slate-700">{message}</p>
      )}

      {latencyMs !== null && (
        <p className="mt-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Responded in{" "}
          <span className="text-slate-700">
            {latencyMs >= 1000
              ? `${(latencyMs / 1000).toFixed(1)}s`
              : `${latencyMs}ms`}
          </span>
        </p>
      )}
    </div>
  );
}