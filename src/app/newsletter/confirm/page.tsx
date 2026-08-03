"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Compass } from "lucide-react";
import { useConfirmNewsletter } from "@/hooks";
import { LandingHeader, LandingFooter } from "@/components/landing";
import { SuccessConfetti } from "@/components/common/success-confetti";
import {
  QUBI_PEEK_SRC,
  QUBI_STUDY_SRC,
  QUBI_WAVE_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

const STAGE_COPY = {
  verifying: {
    chip: "Newsletter verification",
    qubi: QUBI_STUDY_SRC,
    qubiLabel: "one sec ↘",
    Icon: Compass,
    statusLabel: "Verifying token",
    cta: null,
  },
  success: {
    chip: "Newsletter verified",
    qubi: QUBI_WAVE_SRC,
    qubiLabel: "welcome!",
    Icon: CheckCircle2,
    statusLabel: "Status · Active",
    cta: { href: "/#newsletter", label: "Discover more from Qz" },
  },
  error: {
    chip: "Newsletter link expired",
    qubi: QUBI_RUN_SRC,
    qubiLabel: "oops!",
    Icon: AlertCircle,
    statusLabel: "Status · Failed",
    cta: { href: "/#newsletter", label: "Request a new link" },
  },
} as const;

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { mutate, isPending, isSuccess, isError, error } =
    useConfirmNewsletter();
  const initialized = useRef(false);

  useEffect(() => {
    if (token && !initialized.current) {
      initialized.current = true;
      mutate(token);
    }
  }, [token, mutate]);

  const stage = isPending ? "verifying" : isSuccess ? "success" : isError ? "error" : "verifying";
  const copy = STAGE_COPY[stage];

  const errorMessage =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? "The link is invalid or has expired. Try requesting a new one.";

  const headline = {
    verifying: "Confirming your spot.",
    success: "You're in.",
    error: "Link expired.",
  }[stage];

  const kicker = {
    verifying: "syncing the inbox ↘",
    success: "good notes, headed your way ✦",
    error: "let's try that again ↘",
  }[stage];

  const sub = {
    verifying:
      "Hold tight — we're confirming your newsletter token with the Qz servers.",
    success:
      "Your subscription is now active. From the next mailing, you'll get fresh study tips, useful resources and product updates — never spammy.",
    error: errorMessage,
  }[stage];

  return (
    <div className="relative mx-auto max-w-2xl px-5">
      {/* Soft-grid background blobs */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-100/70 blur-3xl" />

      {stage === "success" && <SuccessConfetti />}

      <div className="relative pt-32 pb-24 lg:pt-40">
        {/* Header + floating Qubi */}
        <div className="relative flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -8, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 0.5 }}
            className="qubi-sticker absolute -right-2 -top-10 hidden sm:block"
          >
            <span className="hand absolute -left-28 top-2 hidden w-28 -rotate-6 text-xl leading-5 text-[#0C60FC] sm:block">
              {copy.qubiLabel}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={copy.qubi}
              alt="Qubi reacting to your confirmation"
              className="h-24 w-24 object-contain"
            />
          </motion.div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm">
            <Mail className="h-3.5 w-3.5" />
            {copy.chip}
          </div>

          <h1 className="display text-balance text-5xl font-bold leading-[1.04] tracking-[-.045em] text-slate-950 sm:text-6xl">
            {stage === "success" ? (
              <>
                You&apos;re <span className="scribble">in.</span>
              </>
            ) : (
              <>
                <span className="scribble">{headline.split(" ")[0]}</span>{" "}
                {headline.split(" ").slice(1).join(" ")}
              </>
            )}
          </h1>

          <p className="hand mx-auto mt-3 max-w-xl -rotate-1 text-2xl text-[#0C60FC]">
            {kicker}
          </p>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            {sub}
          </p>
        </div>

        {/* Inline status pills + CTAs (no card) */}
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            {stage === "verifying" ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0C60FC]" />
            ) : (
              <copy.Icon
                className={`h-10 w-10 ${stage === "error" ? "text-rose-500" : "text-[#0C60FC]"}`}
                strokeWidth={2.25}
              />
            )}
          </div>

          <p className="text-center text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
            {copy.statusLabel}
          </p>

          {copy.cta && (
            <Link
              href={copy.cta.href}
              className="squishy inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
            >
              <span>{copy.cta.label}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main className="soft-grid relative overflow-hidden">
        <Suspense
          fallback={
            <div className="relative mx-auto max-w-2xl px-5 pt-40">
              <div className="text-center font-mono text-sm uppercase tracking-widest text-slate-400 animate-pulse">
                Loading confirmation…
              </div>
            </div>
          }
        >
          <ConfirmContent />
        </Suspense>
      </main>

      <LandingFooter />
    </div>
  );
}