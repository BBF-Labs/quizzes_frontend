import type { GlobalState } from "@/hooks/common/use-status";
import { QUBI_PEEK_SRC, QUBI_STUDY_SRC, QUBI_RUN_SRC } from "@/lib/constants";

interface StatusBannerProps {
  state: GlobalState;
  label: string;
  generatedAt: string;
}

/**
 * Friendly hero banner — Qubi is the centerpiece, not a lucide icon.
 * Per-state copy is plain English, not "Operational/Degraded/Down".
 */

const STATE_COPY: Record<GlobalState, {
  headline: string;
  handCaption: string;
  qubi: string;
  bg: string;
  accent: string;
  ink: string;
}> = {
  operational: {
    headline: "Everything's humming.",
    handCaption: "all quiet on the Qz front ✦",
    qubi: QUBI_PEEK_SRC,
    bg: "bg-[#E9FFD3]",
    accent: "border-[#D4F5A3]",
    ink: "text-slate-900",
  },
  partial_outage: {
    headline: "A few hiccups, but we’re on it.",
    handCaption: "team is digging in ↘",
    qubi: QUBI_STUDY_SRC,
    bg: "bg-[#FFF4D6]",
    accent: "border-[#FFE2A8]",
    ink: "text-slate-900",
  },
  major_outage: {
    headline: "We’re fixing this right now.",
    handCaption: "full crew on it ↘",
    qubi: QUBI_RUN_SRC,
    bg: "bg-[#FFE0E0]",
    accent: "border-[#FFC4C4]",
    ink: "text-slate-900",
  },
};

export function StatusBanner({ state, label, generatedAt }: StatusBannerProps) {
  const copy = STATE_COPY[state];
  const date = new Date(generatedAt);

  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return (
    <div
      className={`relative mt-8 overflow-hidden rounded-[28px] border ${copy.accent} ${copy.bg} px-6 py-7 sm:px-9 sm:py-9`}
    >
      {/* soft blob accents */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#0C60FC]/10 blur-3xl" />

      <div className="relative grid items-center gap-6 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
            {label}
          </p>
          <h2 className="display mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {copy.headline}
          </h2>
          <p className={`hand mt-2 text-xl ${copy.ink}`}>
            {copy.handCaption}
          </p>
          <p className="mt-4 text-[11px] font-semibold text-slate-600">
            Last checked {time} UTC · auto-refreshes every 30s
          </p>
        </div>

        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={copy.qubi}
            alt="Qubi"
            className="qubi-bob h-32 w-32 object-contain sm:h-40 sm:w-40"
          />
        </div>
      </div>
    </div>
  );
}
