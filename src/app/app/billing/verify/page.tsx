"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useVerifyPayment } from "@/hooks";
import { Loader } from "@/components/common/loader";
import { toast } from "sonner";
import {
  QUBI_WAVE_SRC,
  QUBI_RUN_SRC,
  QUBI_STUDY_SRC,
} from "@/lib/constants";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const verifyPayment = useVerifyPayment();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!reference || hasRun.current) return;
    hasRun.current = true;

    verifyPayment.mutate(reference, {
      onSuccess: () => {
        toast.success("Payment confirmed. Your plan is now active!");
      },
      onError: () => {
        toast.error("Payment verification failed. If funds were deducted, contact support.");
      },
    });
  }, [reference, verifyPayment]);

  return (
    <div className="min-h-[80vh] px-4 py-12 flex items-center justify-center bg-[#F7F9FC] text-slate-900">
      <div className="mx-auto max-w-md w-full">
        {/* Verifying State */}
        {verifyPayment.isPending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/40 text-center"
            style={{ borderRadius: "32px" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={QUBI_STUDY_SRC}
              alt="Qubi"
              className="h-24 w-24 mx-auto object-contain mb-5 animate-pulse"
            />
            <h2 className="display text-2xl font-bold text-slate-950 mb-2">
              Confirming your payment…
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto mb-6">
              Hang tight while we securely verify your transaction with Paystack.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-[#0C60FC] border border-blue-100">
              <span className="h-2 w-2 rounded-full bg-[#0C60FC] animate-ping" />
              Verifying transaction
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {verifyPayment.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[32px] border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/40 text-center"
            style={{ borderRadius: "32px" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={QUBI_WAVE_SRC}
              alt="Qubi"
              className="h-28 w-28 mx-auto object-contain mb-4"
            />

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-200 mb-3">
              <CheckCircle2 className="h-3.5 w-3.5" /> Plan Activated
            </span>

            <h1 className="display text-3xl font-extrabold text-slate-950 tracking-tight">
              You&apos;re all set!
            </h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Your study privileges and bonus credits have been unlocked on your account.
            </p>

            {/* Reference info box */}
            {reference && (
              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-600 space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-400">Status</span>
                  <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-400">Reference</span>
                  <span className="font-mono text-[11px] font-bold text-slate-700 select-all">
                    {reference}
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 space-y-3">
              <Link
                href="/app"
                className="w-full rounded-2xl bg-[#0C60FC] py-4 px-6 text-sm font-extrabold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600 flex items-center justify-center gap-2 block"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/app/billing"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-6 text-xs font-bold text-slate-700 transition hover:bg-slate-50 block"
              >
                View Plans &amp; Perks
              </Link>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {verifyPayment.isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/40 text-center"
            style={{ borderRadius: "32px" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={QUBI_RUN_SRC}
              alt="Qubi"
              className="h-24 w-24 mx-auto object-contain mb-4"
            />

            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-extrabold text-rose-700 border border-rose-200 mb-3">
              <AlertCircle className="h-3.5 w-3.5" /> Verification Issue
            </span>

            <h1 className="display text-2xl sm:text-3xl font-extrabold text-slate-950">
              Verification failed
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              If funds were deducted from your account, don&apos;t worry—your payment reference is safely recorded and our team will resolve it.
            </p>

            {reference && (
              <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-100 p-3.5 text-xs text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Payment Reference
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 break-all select-all">
                  {reference}
                </span>
              </div>
            )}

            <div className="mt-7 space-y-2.5">
              {reference && (
                <button
                  type="button"
                  onClick={() => verifyPayment.mutate(reference)}
                  disabled={verifyPayment.isPending}
                  className="w-full rounded-2xl bg-[#0C60FC] py-3.5 px-6 text-xs font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry Verification
                </button>
              )}
              <Link
                href="/app/billing"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 px-6 text-xs font-bold text-slate-700 transition hover:bg-slate-50 block"
              >
                Back to Billing
              </Link>
            </div>
          </motion.div>
        )}

        {/* No Reference State */}
        {!reference && !verifyPayment.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[32px] border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/40 text-center"
            style={{ borderRadius: "32px" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={QUBI_RUN_SRC}
              alt="Qubi"
              className="h-20 w-20 mx-auto object-contain mb-4"
            />
            <h2 className="display text-xl font-bold text-slate-950 mb-2">
              No payment reference found
            </h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Please check your billing history or choose a plan from the billing dashboard.
            </p>
            <Link
              href="/app/billing"
              className="w-full rounded-2xl bg-[#0C60FC] py-3.5 px-6 text-xs font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 block"
            >
              Go to Plans &amp; Billing
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<Loader message="Confirming your payment..." />}>
      <VerifyContent />
    </Suspense>
  );
}
