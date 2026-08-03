"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useConfirmNewsletter } from "@/hooks";
import { LandingHeader, LandingFooter } from "@/components/landing";
import {
  QUBI_PEEK_SRC,
  QUBI_STUDY_SRC,
  QUBI_WAVE_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

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

  const errorMessage =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? "The link is invalid or has expired. Try requesting a new one.";

  return (
    <div className="relative mx-auto max-w-2xl px-5">
      {/* Soft-grid background blobs */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-100/70 blur-3xl" />

      <div className="relative pt-32 pb-24 lg:pt-40">
        {/* Header */}
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm">
            <Mail className="h-3.5 w-3.5" />
            Newsletter verification
          </div>
          <h1 className="display text-balance text-4xl font-bold leading-[1.04] tracking-[-.045em] text-slate-950 sm:text-5xl">
            {stage === "verifying" && "Confirming your spot."}
            {stage === "success" && (
              <>
                You&apos;re <span className="text-[#0C60FC]">in.</span>
              </>
            )}
            {stage === "error" && "Link expired."}
          </h1>
          <p className="hand mx-auto mt-3 max-w-xl -rotate-1 text-2xl text-[#0C60FC]">
            {stage === "verifying" && "syncing the inbox →"}
            {stage === "success" && "good notes, headed your way ✦"}
            {stage === "error" && "let&apos;s try that again ↘"}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            {stage === "verifying" &&
              "Hold tight — we're confirming your newsletter token with the Qz servers."}
            {stage === "success" &&
              "Your subscription is now active. From the next mailing, you'll get fresh study tips, useful resources and product updates — never spammy."}
            {stage === "error" && errorMessage}
          </p>
        </div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mx-auto mt-12 max-w-md overflow-visible rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-blue-50/50 sm:p-10"
          style={{ borderRadius: "32px" }}
        >
          {/* Qubi sticker resting on top-right */}
          <div className="qubi-sticker absolute -right-2 -top-14 hidden sm:block">
            <span className="hand absolute -left-28 top-2 w-28 -rotate-6 text-xl leading-5 text-[#0C60FC]">
              {stage === "success" && "welcome!"}
              {stage === "verifying" && "one sec ↘"}
              {stage === "error" && "oops!"}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                stage === "success"
                  ? QUBI_WAVE_SRC
                  : stage === "verifying"
                    ? QUBI_STUDY_SRC
                    : QUBI_RUN_SRC
              }
              alt="Qubi reacting to your confirmation"
              className="h-24 w-24 object-contain"
            />
          </div>

          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            {stage === "verifying" && (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0C60FC]" />
            )}
            {stage === "success" && (
              <CheckCircle2 className="h-10 w-10 text-[#0C60FC]" strokeWidth={2.25} />
            )}
            {stage === "error" && (
              <AlertCircle className="h-10 w-10 text-rose-500" strokeWidth={2.25} />
            )}
          </div>

          <p className="mt-6 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
            {stage === "verifying" && "Verifying token"}
            {stage === "success" && "Status · Active"}
            {stage === "error" && "Status · Failed"}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {stage === "success" && (
              <Link
                href="/#newsletter"
                className="squishy inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
              >
                <span>Discover more from Qz</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            {stage === "error" && (
              <Link
                href="/#newsletter"
                className="squishy inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
              >
                <span>Request a new link</span>
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
        </motion.div>
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
