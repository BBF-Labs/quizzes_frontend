"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";
import { SuccessConfetti } from "@/components/common/success-confetti";

/**
 * Shared renderer for public token-driven confirmation pages
 * (newsletter confirm/unsubscribe, student-verify, future flows).
 *
 * The page owns `useSearchParams` + the mutation hook instance;
 * this component owns the chrome and the per-stage UX so all
 * confirm surfaces share one visual treatment and one bug surface.
 *
 * `LandingHeader` + `LandingFooter` are NOT rendered here — pages
 * wrap this component in their own layout chrome for full control
 * over navigation and footer copy.
 */

export type ConfirmStage = "verifying" | "success" | "error";
export type ConfirmPalette = "blue" | "rose";

export interface ConfirmStageCopy {
  chip: string;
  Icon: LucideIcon;
  statusLabel: string;
  qubi: string;
  qubiLabel: string;
  cta?: { href: string; label: string };
}

export interface ConfirmTokenCopy {
  verifying: ConfirmStageCopy;
  success: ConfirmStageCopy;
  error: ConfirmStageCopy;
  /** Headline per stage. The first word gets the `.scribble` accent. */
  headline: Record<ConfirmStage, string>;
  /** Hand kicker per stage. */
  kicker: Record<ConfirmStage, string>;
  /** Sub-copy per stage. For `error`, falls through to the extracted errorMessage. */
  sub?: Partial<Record<ConfirmStage, string>>;
  /** Shown on the error stage when no backend message is available. */
  fallbackError: string;
}

export interface ConfirmSuccessRedirect {
  href: string;
  /** Default 2500ms — matches the existing chrome across the surface. */
  delayMs?: number;
}

/**
 * All three target hooks share this exact React-Query shape
 * (`mutationFn: (token: string) => Promise<AxiosResponse.data>`).
 */
export type ConfirmMutation = UseMutationResult<
  unknown,
  unknown,
  string,
  unknown
>;

export interface ConfirmTokenPageProps {
  mutation: ConfirmMutation;
  /** Token read from the URL by the page; null when `?token=` is missing. */
  token: string | null;
  copy: ConfirmTokenCopy;
  /** Default "blue". Drives blob colors, chip tint, spinner tint, CTA hover. */
  palette?: ConfirmPalette;
  /** Chip icon — same across stages (Mail / MailMinus / GraduationCap). */
  ChipIcon: LucideIcon;
  /** Present → 2.5s progress bar + `router.push(href)` on success. */
  successRedirect?: ConfirmSuccessRedirect;
  /** Outlined "return home" link target. Default "/". */
  homeHref?: string;
  ariaLabel?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (error as { response?: unknown }).response;
    if (typeof response === "object" && response !== null && "data" in response) {
      const data = (response as { data?: unknown }).data;
      if (typeof data === "object" && data !== null && "message" in data) {
        const message = (data as { message?: unknown }).message;
        if (typeof message === "string" && message.length > 0) return message;
      }
    }
  }
  return fallback;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ConfirmTokenPage({
  mutation,
  token,
  copy,
  palette = "blue",
  ChipIcon,
  successRedirect,
  homeHref = "/",
  ariaLabel,
}: ConfirmTokenPageProps) {
  const router = useRouter();
  const { mutate, isPending, isSuccess, isError, error } = mutation;
  const initialized = useRef(false);

  // Fire the mutation exactly once per mount, even under StrictMode / HMR.
  useEffect(() => {
    if (token && !initialized.current) {
      initialized.current = true;
      mutate(token);
    }
  }, [token, mutate]);

  // Auto-redirect on success when configured.
  useEffect(() => {
    if (!isSuccess || !successRedirect) return;
    const delay = successRedirect.delayMs ?? 2500;
    const t = setTimeout(
      () => router.push(successRedirect.href),
      delay,
    );
    return () => clearTimeout(t);
  }, [isSuccess, successRedirect, router]);

  // Stage derivation. !token short-circuits to "error" so we don't spin
  // forever when the URL is missing the token — every existing page
  // silently hung in that case.
  const stage: ConfirmStage = !token
    ? "error"
    : isError
      ? "error"
      : isPending
        ? "verifying"
        : isSuccess
          ? "success"
          : "verifying";

  const stageCopy = copy[stage];
  const Icon = stageCopy.Icon;

  const errorMessage = extractErrorMessage(error, copy.fallbackError);
  const sub =
    copy.sub?.[stage] ?? (stage === "error" ? errorMessage : undefined);

  const isBlue = palette === "blue";
  const accentText = isBlue ? "text-[#0C60FC]" : "text-rose-500";
  const focusText = isBlue ? "text-[#0C60FC]" : "text-rose-500";
  const spinnerTint = isBlue ? "border-t-[#0C60FC]" : "border-t-rose-500";
  const statusTextClass =
    stage === "error" ? "text-rose-500" : focusText;

  return (
    <div
      className="relative mx-auto max-w-2xl px-5"
      aria-label={ariaLabel}
      role="region"
    >
      {/* Soft-grid background blobs */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
      <div
        className={`pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full ${
          isBlue ? "bg-violet-100/70" : "bg-slate-200/60"
        } blur-3xl`}
      />

      {stage === "success" && isBlue && <SuccessConfetti />}

      <div className="relative pt-32 pb-24 lg:pt-40">
        {/* Header + floating Qubi */}
        <div className="relative flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -8, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 0.5 }}
            className="qubi-sticker absolute -right-2 -top-10 hidden sm:block"
          >
            <span
              className={`hand absolute -left-28 top-2 hidden w-28 -rotate-6 text-xl leading-5 sm:block ${accentText}`}
            >
              {stageCopy.qubiLabel}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stageCopy.qubi}
              alt="Qubi reacting to your confirmation"
              className="h-24 w-24 object-contain"
            />
          </motion.div>

          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold shadow-sm ${
              stage === "error"
                ? "border-rose-200 bg-white text-rose-700"
                : isBlue
                  ? "border-blue-200 bg-white text-blue-700"
                  : "border-rose-200 bg-white text-rose-700"
            }`}
          >
            <ChipIcon className="h-3.5 w-3.5" />
            {stageCopy.chip}
          </div>

          <h1 className="display text-balance text-5xl font-bold leading-[1.04] tracking-[-.045em] text-slate-950 sm:text-6xl">
            {stage === "success" ? (
              <>
                <span className="scribble">{copy.headline.success.split(" ")[0]}</span>{" "}
                {copy.headline.success.split(" ").slice(1).join(" ")}
              </>
            ) : (
              <>
                <span className="scribble">{copy.headline[stage].split(" ")[0]}</span>{" "}
                {copy.headline[stage].split(" ").slice(1).join(" ")}
              </>
            )}
          </h1>

          <p className={`hand mx-auto mt-3 max-w-xl -rotate-1 text-2xl ${accentText}`}>
            {copy.kicker[stage]}
          </p>

          {sub && (
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
              {sub}
            </p>
          )}
        </div>

        {/* Inline status pills + CTAs (no card) */}
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            {stage === "verifying" ? (
              <div
                className={`h-8 w-8 animate-spin rounded-full border-2 border-slate-200 ${spinnerTint}`}
              />
            ) : (
              <Icon
                className={`h-10 w-10 ${statusTextClass}`}
                strokeWidth={2.25}
              />
            )}
          </div>

          <p
            className="text-center text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400"
            role="status"
            aria-live="polite"
          >
            {stageCopy.statusLabel}
          </p>

          {/* Auto-redirect progress bar on success */}
          {stage === "success" && successRedirect && (
            <div className="w-full">
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    isBlue ? "bg-[#0C60FC]" : "bg-rose-500"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: (successRedirect.delayMs ?? 2500) / 1000,
                    ease: "linear",
                  }}
                />
              </div>
              <p className="mt-3 text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Auto-redirecting in a moment…
              </p>
            </div>
          )}

          <div className="flex w-full flex-col gap-3">
            {stageCopy.cta && (
              <Link
                href={stageCopy.cta.href}
                className="squishy inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
              >
                <span>{stageCopy.cta.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {stage !== "success" && (
              <Link
                href={homeHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Return to home
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
