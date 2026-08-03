"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, ArrowRight, AlertCircle, MailMinus } from "lucide-react";
import { useUnsubscribeNewsletter } from "@/hooks";
import { LandingHeader, LandingFooter } from "@/components/landing";
import {
  QUBI_PEEK_SRC,
  QUBI_STUDY_SRC,
  QUBI_WAVE_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { mutate, isPending, isSuccess, isError, error } =
    useUnsubscribeNewsletter();
  const initialized = useRef(false);

  useEffect(() => {
    if (token && !initialized.current) {
      initialized.current = true;
      mutate(token);
    }
  }, [token, mutate]);

  const stage = isPending
    ? "verifying"
    : isSuccess
      ? "success"
      : isError
        ? "error"
        : "verifying";

  const errorMessage =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? "The unsubscribe link is invalid or has already been used.";

  return (
    <div className="relative mx-auto max-w-2xl px-5">
      {/* Soft-grid background blobs */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-rose-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-slate-200/60 blur-3xl" />

      <div className="relative pt-32 pb-24 lg:pt-40">
        {/* Header */}
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-700 shadow-sm">
            <MailMinus className="h-3.5 w-3.5" />
            Newsletter unsubscribe
          </div>
          <h1 className="display text-balance text-4xl font-bold leading-[1.04] tracking-[-.045em] text-slate-950 sm:text-5xl">
            {stage === "verifying" && "Removing you from the list."}
            {stage === "success" && (
              <>
                You&apos;re <span className="text-rose-500">off.</span>
              </>
            )}
            {stage === "error" && "Link expired."}
          </h1>
          <p className="hand mx-auto mt-3 max-w-xl -rotate-1 text-2xl text-rose-500">
            {stage === "verifying" && "tearing up the records ↘"}
            {stage === "success" && "see you around ✦"}
            {stage === "error" && "let&apos;s try that again ↘"}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            {stage === "verifying" &&
              "Hold on — we're confirming your unsubscribe request and scrubbing your email from the broadcast list."}
            {stage === "success" &&
              "Your email has been removed from all Qz broadcast lists. No more study tips from us — but you can always resubscribe from the footer."}
            {stage === "error" && errorMessage}
          </p>
        </div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mx-auto mt-12 max-w-md overflow-visible rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-rose-50/50 sm:p-10"
          style={{ borderRadius: "32px" }}
        >
          {/* Qubi sticker */}
          <div className="qubi-sticker absolute -right-2 -top-14 hidden sm:block">
            <span className="hand absolute -left-28 top-2 w-28 -rotate-6 text-xl leading-5 text-rose-500">
              {stage === "success" && "see ya!"}
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
              alt="Qubi reacting to your unsubscribe"
              className="h-24 w-24 object-contain"
            />
          </div>

          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            {stage === "verifying" && (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-rose-500" />
            )}
            {stage === "success" && (
              <LogOut className="h-10 w-10 text-rose-500" strokeWidth={2.25} />
            )}
            {stage === "error" && (
              <AlertCircle className="h-10 w-10 text-rose-500" strokeWidth={2.25} />
            )}
          </div>

          <p className="mt-6 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
            {stage === "verifying" && "Confirming"}
            {stage === "success" && "Status · Unsubscribed"}
            {stage === "error" && "Status · Failed"}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {stage === "success" && (
              <Link
                href="/"
                className="squishy inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
              >
                <span>Back to Qz</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {stage === "error" && (
              <Link
                href="/#newsletter"
                className="squishy inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
              >
                <span>Manage preferences</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Return to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main className="soft-grid relative overflow-hidden">
        <Suspense
          fallback={
            <div className="relative mx-auto max-w-2xl px-5 pt-40">
              <div className="text-center font-mono text-sm uppercase tracking-widest text-slate-400 animate-pulse">
                Loading unsubscribe…
              </div>
            </div>
          }
        >
          <UnsubscribeContent />
        </Suspense>
      </main>

      <LandingFooter />
    </div>
  );
}
