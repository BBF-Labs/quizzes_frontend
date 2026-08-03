import {
  Database,
  Zap,
  BrainCircuit,
  Globe,
  type LucideIcon,
} from "lucide-react";

/**
 * Donate-style "what your gift does" lime box for the status page.
 * Static copy explaining probe mechanics — no live data, just the rules.
 *
 * Lime palette matches the donate page "what your gift does" section
 * (`bg-[#E9FFD3]` at donate/page.tsx:108–141) for cross-page cohesion.
 *
 * Each row gets a distinct lucide icon so the four probes are visually
 * distinguishable — the lucide icons mirror the icons used on the live
 * component cards (Database / Zap / BrainCircuit / Globe). Icon tiles use
 * the brand "live indicator" style: black bg with the lime `#DFFF61` glyph
 * — keeps the four rows visually unified as one system while the icon
 * shape still tells them apart.
 */

interface Probe {
  label: string;
  detail: string;
  Icon: LucideIcon;
}

const PROBES: Probe[] = [
  {
    label: "Database",
    detail: "checked every 30 seconds, end-to-end",
    Icon: Database,
  },
  {
    label: "Cache & Queue",
    detail: "checked every 30 seconds, end-to-end",
    Icon: Zap,
  },
  {
    label: "AI Inference",
    detail: "checked every 30 seconds, end-to-end",
    Icon: BrainCircuit,
  },
  {
    label: "Public API",
    detail: "checked every 30 seconds, end-to-end",
    Icon: Globe,
  },
];

export function HowWeCheckCard() {
  return (
    <div
      className="overflow-hidden rounded-[28px] border border-slate-200 p-7 sm:p-9"
      style={{ borderRadius: "28px", backgroundColor: "#E9FFD3" }}
    >
      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            How we check
          </p>
          <h3 className="display mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
            We poke it, we measure it,{" "}
            <span className="scribble">we tell you.</span>
          </h3>
          <p className="hand mt-3 text-2xl text-[#0C60FC]">
            four probes a minute ✦
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-700 sm:text-base">
            Every 30 seconds, our backend quietly asks each piece of Qz{" "}
            <b>“are you still there?”</b>. A fast, friendly reply is green. A
            slow reply is amber. No reply at all is red — and that&apos;s when
            we drop everything.
          </p>
        </div>

        <ul className="space-y-3">
          {PROBES.map((p) => (
            <li
              key={p.label}
              className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/60 p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950">
                <p.Icon
                  className="h-5 w-5 text-[#DFFF61]"
                  strokeWidth={2.25}
                />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-slate-950">
                  {p.label}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-600">
                  {p.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}