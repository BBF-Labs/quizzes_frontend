"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Navbar } from "@/components/common";
import { Footer } from "@/components/landing";
import Link from "next/link";

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
  { success: string; sub: string; redirect: string }
> = {
  plan: {
    success: "YOUR PLAN IS ACTIVE.",
    sub: "SUBSCRIPTION UPGRADED. YOU ARE FULLY SYNCED.",
    redirect: "/app/billing",
  },
  credits: {
    success: "CREDITS ACQUIRED.",
    sub: "YOUR ACCOUNT HAS BEEN TOPPED UP WITH ADDITIONAL AI CREDITS.",
    redirect: "/app/billing",
  },
  donation: {
    success: "TRANSACTION COMPLETE.",
    sub: "THANK YOU FOR SUPPORTING OUR MISSION FOR EDUCATION.",
    redirect: "/pricing",
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
      .then(() => {
        setStage("success");
      })
      .catch(() => {
        setStage("error");
      });
  }, [reference, typeParam]);

  const copy = TYPE_COPY[paymentType];

  return (
    <div className="max-w-md w-full mx-auto">
      {/* No reference */}
      {!reference && stage === "verifying" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 border border-border/50 p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-red-500/20 flex items-center justify-center border border-red-500/50">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-4 italic">
            ERROR DETECTED.
          </h1>
          <div className="h-px bg-border/50 w-full mb-8" />
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed mb-10">
            NO PAYMENT REFERENCE WAS FOUND IN THE REQUEST.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-3 bg-primary px-8 py-4 text-primary-foreground font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-primary hover:ring-1 hover:ring-inset hover:ring-primary transition-all duration-300 group rounded(--radius)"
          >
            <span>RETURN TO BASE</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      )}

      {reference && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 border border-border/50 p-8 md:p-12 text-center relative overflow-hidden"
        >
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
            <div className="absolute top-0 right-0 w-[2px] h-8 bg-primary" />
            <div className="absolute top-0 right-0 w-8 h-[2px] bg-primary" />
          </div>

          <div className="flex justify-center mb-8">
            {stage === "verifying" ? (
              <div className="w-16 h-16 border-2 border-primary/20 border-t-primary animate-spin" />
            ) : stage === "success" ? (
              <div className="w-16 h-16 bg-primary/20 flex items-center justify-center border border-primary/50">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-500/20 flex items-center justify-center border border-red-500/50">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            )}
          </div>

          <h1 className="text-3xl font-black tracking-tighter uppercase mb-4 italic">
            {stage === "verifying"
              ? "VERIFYING..."
              : stage === "success"
                ? copy.success
                : "ERROR DETECTED."}
          </h1>

          <div className="h-px bg-border/50 w-full mb-8" />

          <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed mb-6">
            {stage === "verifying"
              ? "COMMUNICATING WITH PAYSTACK TO VERIFY YOUR TRANSACTION..."
              : stage === "success"
                ? copy.sub
                : "WE COULD NOT VERIFY YOUR PAYMENT. IF FUNDS WERE DEDUCTED, PLEASE CONTACT SUPPORT."}
          </p>

          {stage === "error" && reference && (
            <div className="bg-card/60 border border-border/40 p-3 mb-10">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                REFERENCE KEY
              </p>
              <p className="text-xs font-mono text-foreground break-all">
                {reference}
              </p>
            </div>
          )}

          {stage === "success" && (
            <div className="mb-10">
              <div className="w-full h-[2px] bg-border/30 relative overflow-hidden mt-6">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  onAnimationComplete={() => router.push(copy.redirect)}
                />
              </div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-4">
                SYSTEM REDIRECT IN PROGRESS...
              </p>
            </div>
          )}

          {stage === "error" && (
            <div className="flex flex-col gap-3">
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
                className="w-full inline-flex justify-center items-center space-x-3 bg-primary px-8 py-4 text-primary-foreground font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-primary hover:ring-1 hover:ring-inset hover:ring-primary transition-all duration-300 group"
              >
                <span>RETRY VERIFICATION</span>
              </button>
              <button
                onClick={() => router.back()}
                className="w-full inline-flex justify-center items-center space-x-3 bg-transparent border border-border/50 px-8 py-4 text-muted-foreground font-mono text-xs font-bold uppercase tracking-[0.2em] hover:text-foreground hover:border-primary/40 transition-colors duration-300"
              >
                <span>FALLBACK TO PREVIOUS</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 relative py-24">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

        <Suspense
          fallback={
            <div className="max-w-md w-full mx-auto text-center font-mono animate-pulse uppercase tracking-[0.2em]">
              LOADING VERIFICATION MODULE...
            </div>
          }
        >
          <PaymentCallbackInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
