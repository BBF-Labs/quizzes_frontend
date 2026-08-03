"use client";

import { AlertTriangle, XCircle, MessageSquareWarning, Clock } from "lucide-react";
import {
  useIncidentReports,
  type IncidentReport,
  type ReportSeverity,
} from "@/hooks/common/use-status";

/**
 * "What users are saying" panel — public, newest-first feed of recent
 * community incident reports. Shown under the IncidentFeed on the status
 * page so visitors can see corroborating reports alongside the
 * system-detected state.
 *
 * Pure render — no inputs. The submit form lives in IncidentReportForm.
 */

const SEVERITY_BADGE: Record<
  ReportSeverity,
  { Icon: typeof AlertTriangle; label: string; palette: string; ring: string; bg: string }
> = {
  slow: {
    Icon: AlertTriangle,
    label: "Slow",
    palette: "text-amber-700",
    ring: "border-amber-200",
    bg: "bg-amber-50",
  },
  down: {
    Icon: XCircle,
    label: "Down",
    palette: "text-rose-700",
    ring: "border-rose-200",
    bg: "bg-rose-50",
  },
};

export function CommunityReportsPanel() {
  const { data, isPending, isError } = useIncidentReports();

  return (
    <div
      className="play-card rounded-[28px] border border-slate-200 bg-white p-5 sm:p-7"
      style={{ borderRadius: "28px" }}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-slate-500">
            What users are saying
          </p>
          <h3 className="display mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
            Recent community reports.
          </h3>
        </div>
        {data && (
          <p className="hidden text-[11px] font-semibold text-slate-400 sm:block">
            {data.total} {data.total === 1 ? "report" : "reports"} in the last 7 days
          </p>
        )}
      </div>

      <div className="mt-4">
        {isPending ? (
          <SkeletonList />
        ) : isError || !data ? (
          <ErrorPanel />
        ) : data.reports.length === 0 ? (
          <EmptyPanel />
        ) : (
          <ul className="flex flex-col gap-2">
            {data.reports.map((r) => (
              <li key={r.id}>
                <ReportRow report={r} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ReportRow({ report }: { report: IncidentReport }) {
  const badge = SEVERITY_BADGE[report.severity];
  const Icon = badge.Icon;
  const when = formatRelative(report.createdAt);

  return (
    <div className={`flex gap-3 rounded-xl border ${badge.ring} ${badge.bg} p-3 sm:p-4`}>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
        <Icon className={`h-4 w-4 ${badge.palette}`} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border ${badge.ring} bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${badge.palette}`}
          >
            {badge.label}
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
            {report.componentLabel}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Clock className="h-3 w-3" />
            {when}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-slate-800">{report.description}</p>
        {report.reporterName && (
          <p className="mt-2 text-[11px] font-semibold text-slate-500">
            — {report.reporterName}
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
        />
      ))}
    </ul>
  );
}

function EmptyPanel() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
          <MessageSquareWarning className="h-5 w-5 text-emerald-700" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
            Quiet on the wire
          </p>
          <p className="mt-1 text-base font-bold text-slate-950">
            No reports in the last 7 days.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Either everything&apos;s working, or no one&apos;s vented yet. We
            trust the latter less than the former.
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorPanel() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-[#FFF4D6] p-4">
      <p className="text-sm text-amber-800">
        Couldn&apos;t load community reports right now. They&apos;ll be back
        on the next refresh.
      </p>
    </div>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSec < 60) return "just now";
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}
