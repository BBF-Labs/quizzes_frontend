import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { GlobalState } from "@/hooks/common/use-status";
import { StatusDot } from "./status-dot";

interface StatusBannerProps {
  state: GlobalState;
  label: string;
  generatedAt: string;
}

const STATE_COPY: Record<GlobalState, {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  Icon: typeof CheckCircle2;
}> = {
  operational: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    Icon: CheckCircle2,
  },
  partial_outage: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    Icon: AlertTriangle,
  },
  major_outage: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    Icon: XCircle,
  },
};

/**
 * Hero banner showing the platform's current global state.
 * Lives at the top of the status page, above the component grid.
 */
export function StatusBanner({ state, label, generatedAt }: StatusBannerProps) {
  const copy = STATE_COPY[state];
  const { Icon } = copy;
  const date = new Date(generatedAt);

  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });

  return (
    <div
      className={`mt-8 flex items-center justify-between gap-6 rounded-2xl border ${copy.border} ${copy.bg} px-5 py-4 sm:px-6`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${copy.iconBg}`}
        >
          <Icon className={`h-5 w-5 ${copy.iconColor}`} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <StatusDot state={state === "operational" ? "operational" : state === "partial_outage" ? "degraded" : "down"} />
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {state === "operational" ? "All clear" : state === "partial_outage" ? "Partial outage" : "Major outage"}
            </p>
          </div>
          <p className="mt-1 text-base font-bold text-slate-950 sm:text-lg">
            {label}
          </p>
        </div>
      </div>
      <p className="hidden text-right text-[11px] font-semibold text-slate-500 sm:block">
        Last checked at {time} UTC
        <br />
        auto-refreshes every 30s
      </p>
    </div>
  );
}
