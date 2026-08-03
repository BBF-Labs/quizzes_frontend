"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Check,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSubmitIncidentReport,
  type ReportSeverity,
} from "@/hooks/common/use-status";

/**
 * Collapsible form to submit a public incident report.
 * Anonymous by default; name + email optional for follow-up.
 *
 * Visual language mirrors the contact page + signup "institution type"
 * button grid: native inputs/textareas, rounded-2xl slate-200 borders,
 * focus ring blue-100, blue submit button. Keeps the form visually
 * consistent with the rest of Qz's landed form surfaces.
 */

const COMPONENT_OPTIONS = [
  { value: "mongodb", label: "Database" },
  { value: "redis", label: "Cache & Queue" },
  { value: "openrouter", label: "AI Inference" },
  { value: "api", label: "Public API" },
] as const;

const SEVERITY_OPTIONS: Array<{
  value: ReportSeverity;
  label: string;
  hint: string;
  Icon: typeof AlertTriangle;
}> = [
  {
    value: "slow",
    label: "Slow",
    hint: "Working, but slower than usual",
    Icon: AlertTriangle,
  },
  {
    value: "down",
    label: "Down",
    hint: "Not responding at all",
    Icon: XCircle,
  },
];

const MAX_DESCRIPTION = 500;

interface FormState {
  componentId: (typeof COMPONENT_OPTIONS)[number]["value"];
  severity: ReportSeverity;
  description: string;
  reporterName: string;
  reporterEmail: string;
}

const INITIAL_STATE: FormState = {
  componentId: "mongodb",
  severity: "slow",
  description: "",
  reporterName: "",
  reporterEmail: "",
};

export function IncidentReportForm() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const mutation = useSubmitIncidentReport();

  const descriptionCount = state.description.length;
  const descriptionValid =
    descriptionCount >= 10 && descriptionCount <= MAX_DESCRIPTION;
  const emailValid =
    state.reporterEmail === "" ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.reporterEmail.trim());
  const canSubmit =
    descriptionValid && emailValid && mutation.status !== "pending";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      const payload = {
        componentId: state.componentId,
        severity: state.severity,
        description: state.description.trim(),
        reporterName: state.reporterName.trim() || undefined,
        reporterEmail: state.reporterEmail.trim() || undefined,
      };
      await mutation.mutateAsync(payload);
      toast.success("Thanks for the report — we'll look into it.");
      setState(INITIAL_STATE);
      setOpen(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err as Error)?.message ??
        "Couldn't submit. Try again in a bit.";
      toast.error(message);
    }
  };

  return (
    <div
      className="play-card rounded-[28px] border border-slate-200 bg-white p-5 sm:p-7"
      style={{ borderRadius: "28px" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-slate-500">
            See something we missed?
          </p>
          <h3 className="display mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
            Tell us what&apos;s wrong.
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Quick anonymous report — drop a line, we&apos;ll correlate it with
            our own probes. Optional email if you want a follow-up.
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <div>
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Which service?
            </span>
            <div className="grid grid-cols-2 gap-2">
              {COMPONENT_OPTIONS.map((opt) => {
                const active = state.componentId === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() =>
                      setState((s) => ({ ...s, componentId: opt.value }))
                    }
                    className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                      active
                        ? "border-[#0C60FC] bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {active && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-slate-700">
              How bad is it?
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SEVERITY_OPTIONS.map((opt) => {
                const active = state.severity === opt.value;
                const Icon = opt.Icon;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() =>
                      setState((s) => ({ ...s, severity: opt.value }))
                    }
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                      active
                        ? "border-[#0C60FC] bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? "text-[#0C60FC]" : "text-slate-400"
                      }`}
                      strokeWidth={2.25}
                    />
                    <span className="flex flex-col">
                      <span className="text-sm font-extrabold">
                        {opt.label}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {opt.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                What happened?
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  descriptionCount > MAX_DESCRIPTION
                    ? "text-rose-600"
                    : "text-slate-400"
                }`}
              >
                {descriptionCount}/{MAX_DESCRIPTION}
              </span>
            </span>
            <textarea
              value={state.description}
              onChange={(e) =>
                setState((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="e.g. Asked Z to summarize my notes, got a 500 error twice."
              rows={5}
              maxLength={MAX_DESCRIPTION + 20}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Your name{" "}
                <span className="font-medium text-slate-400">· optional</span>
              </span>
              <input
                type="text"
                value={state.reporterName}
                onChange={(e) =>
                  setState((s) => ({ ...s, reporterName: e.target.value }))
                }
                placeholder="Anonymous"
                maxLength={80}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Email for follow-up{" "}
                <span className="font-medium text-slate-400">· optional</span>
              </span>
              <input
                type="email"
                value={state.reporterEmail}
                onChange={(e) =>
                  setState((s) => ({ ...s, reporterEmail: e.target.value }))
                }
                placeholder="you@example.com"
                maxLength={200}
                className={`w-full rounded-2xl border px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 ${
                  !emailValid
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-200 focus:border-[#0C60FC]"
                }`}
              />
              {!emailValid && (
                <span className="mt-1.5 block text-[11px] font-semibold text-rose-600">
                  That doesn&apos;t look like an email
                </span>
              )}
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-500">
              Anonymous by default. IP is captured only for spam filtering.
            </p>
            <button
              type="submit"
              disabled={!canSubmit}
              className="squishy inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {mutation.status === "pending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send report
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}