"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, ArrowRight, CreditCard, Heart } from "lucide-react";
import { api } from "@/lib/api";
import { LandingHeader, LandingFooter } from "@/components/landing";
import {
  QUBI_PEEK_SRC,
  QUBI_STUDY_SRC,
  QUBI_WAVE_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

type PaymentType = "plan" | "credits" | "donation";
type Stage = "verifying" | "success" | "error";

function detectType(reference: string): PaymentType {
  if (reference.startsWith("don_")) return "donation";
  // BBF- prefix = subscription/credits, fall back for anything else
  return "plan";
}

async function verifyReference(reference: string, type: PaymentType) {
  if (type === "donation") {
    const res = await api.get(
      `/donations/verify/${encodeURIComponent(reference)}`,
    );
    return res.data.data;
  }
  const res = await api.get(
    `/subscriptions/payments/verify/${encodeURIComponent(reference)}`,
  );
  return res.data.data;
}

const TYPE_COPY: Record<
  PaymentType,
  {
    chip: string;
    kicker: string;
    headline: string;
    accentWord: string;
    sub: string;
    redirect: string;
    redirectLabel: string;
    icon: typeof CreditCard;
    blobs: "blue" | "rose" | "lime";
  }
> = {
  plan: {
    chip: "Subscription active",
    kicker: "level up the grind ↘",
    headline: "Your plan is",
    accentWord: "live.",
    sub: "Subscription upgraded. You now have full access to every Qz study tool — go break some records.",
    redirect: "/app/billing",
    redirectLabel: "View your billing",
    icon: CreditCard,
    blobs: "blue",
  },
  credits: {
    chip: "Credits topped up",
    kicker: "extra fuel loaded ✦",
    headline: "Credits",
    accentWord: "acquired.",
    sub: "Your account has been topped up with extra AI credits. Generate away.",
    redirect: "/app/billing",
    redirectLabel: "View credits",
    icon: CreditCard,
    blobs: "blue",
  },
  donation: {
    chip: "Donation received",
    kicker: "keep the lights on ✦",
    headline: "Thank",
    accentWord: "you.",
    sub: "Your gift directly funds free access for students who can't afford a subscription. We see you.",
    redirect: "/pricing",
    redirectLabel: "Back to pricing",
    icon: Heart,
    blobs: "lime",
  },
};

function PaymentCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref") ?? "";
  const typeParam = searchParams.get("type") as PaymentType | null;

  const [stage, setStage] = useState<Stage>("verifying");
  const [paymentType, setPaymentType] = useState<PaymentType>("plan");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!reference || hasRun.current) return;
    hasRun.current = true;

    const type = typeParam ?? detectType(reference);
    setPaymentType(type);

    verifyReference(reference, type)
      .then(() => setStage("success"))
      .catch(() => setStage("error"));
  }, [reference, typeParam]);

  const copy = TYPE_COPY[paymentType];
  const Icon = copy.icon;

  const blurA =
    copy.blobs === "blue"
      ? "bg-blue-100/70"
      : copy.blobs === "rose"
        ? "bg-rose-100/70"
        : "bg-[#DFFF61]/40";
  const blurB =
    copy.blobs === "blue"
      ? "bg-violet-100/70"
      : copy.blobs === "rose"
        ? "bg-slate-200/60"
        : "bg-blue-100/70";

  return (
    <div className="relative mx-auto max-w-2xl px-5">
      {/* Soft-grid background blobs */}
      <div className={`pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full ${blurA} blur-3xl`} />
      <div className={`pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full ${blurB} blur-3xl`} />

      <div className="relative pt-32 pb-24 lg:pt-40">
        {/* Header */}
        <div className="text-center">
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold shadow-sm ${
              stage === "error"
                ? "border-rose-200 bg-white text-rose-700"
                : "border-blue-200 bg-white text-blue-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {!reference && "Payment confirmation"}
            {reference && stage === "verifying" && "Payment confirmation"}
            {reference && stage === "success" && copy.chip}
            {reference && stage === "error" && "Payment failed"}
          </div>

          <h1 className="display text-balance text-4xl font-bold leading-[1.04] tracking-[-.045em] text-slate-950 sm:text-5xl">
            {!reference && stage === "verifying" && "Reference missing."}
            {reference && stage === "verifying" && "Verifying your payment."}
            {reference && stage === "success" && (
              <>
                {copy.headline}{" "}
                <span className="text-[#0C60FC]">{copy.accentWord}</span>
              </>
            )}
            {reference && stage === "error" && "Verification failed."}
          </h1>

          <p className="hand mx-auto mt-3 max-w-xl -rotate-1 text-2xl text-[#0C60FC]">
            {!reference && "we need a reference ↘"}
            {reference && stage === "verifying" && "talking to Paystack ↘"}
            {reference && stage === "success" && copy.kicker}
            {reference && stage === "error" && "let&apos;s try again ↘"}
          </p>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            {!reference &&
              "No payment reference was found in the URL. Head back to pricing and try again, or contact support if you were charged."}
            {reference && stage === "verifying" &&
              "Hold tight — we're confirming your transaction with Paystack. This usually takes a couple of seconds."}
            {reference && stage === "success" && copy.sub}
            {reference && stage === "error" &&
              "We could not verify your payment. If funds were deducted, please contact support with the reference key below."}
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
          {/* Qubi sticker */}
          <div className="qubi-sticker absolute -right-2 -top-14 hidden sm:block">
            <span className="hand absolute -left-28 top-2 w-28 -rotate-6 text-xl leading-5 text-[#0C60FC]">
              {!reference && "uh oh!"}
              {reference && stage === "verifying" && "one sec ↘"}
              {reference && stage === "success" && "nice!"}
              {reference && stage === "error" && "oops!"}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                !reference
                  ? QUBI_RUN_SRC
                  : stage === "success"
                    ? QUBI_WAVE_SRC
                    : stage === "verifying"
                      ? QUBI_STUDY_SRC
                      : QUBI_RUN_SRC
              }
              alt="Qubi reacting to your payment"
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
            {!reference && "Status · No reference"}
            {reference && stage === "verifying" && "Verifying"}
            {reference && stage === "success" && "Status · Success"}
            {reference && stage === "error" && "Status · Failed"}
          </p>

          {stage === "error" && reference && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Reference key
              </p>
              <p className="mt-1 break-all font-mono text-xs font-bold text-slate-700">
                {reference}
              </p>
            </div>
          )}

          {/* Auto-redirect progress for success */}
          {stage === "success" && (
            <div className="mt-8">
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#0C60FC]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  onAnimationComplete={() => router.push(copy.redirect)}
                />
              </div>
              <p className="mt-3 text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Auto-redirecting in a moment…
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            {stage === "success" && (
              <Link
                href={copy.redirect}
                className="squishy inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
              >
                <span>{copy.redirectLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {stage === "error" && (
              <button
                onClick={() => {
                  setStage("verifying");
                  hasRun.current = false;
                  const type = typeParam ?? detectType(reference);
                  setPaymentType(type);
                  verifyReference(reference, type)
                    .then(() => setStage("success"))
                    .catch(() => setStage("error"));
                  hasRun.current = true;
                }}
                className="squishy inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
              >
                Retry verification
              </button>
            )}
            {!reference && (
              <Link
                href="/pricing"
                className="squishy inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
              >
                <span>Back to pricing</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {stage !== "success" && (
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Return to home
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main className="soft-grid relative overflow-hidden">
        <Suspense
          fallback={
            <div className="relative mx-auto max-w-2xl px-5 pt-40">
              <div className="text-center font-mono text-sm uppercase tracking-widest text-slate-400 animate-pulse">
                Loading verification…
              </div>
            </div>
          }
        >
          <PaymentCallbackInner />
        </Suspense>
      </main>

      <LandingFooter />
    </div>
  );
}
