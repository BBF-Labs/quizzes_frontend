"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Heart, CreditCard } from "lucide-react";
import { api } from "@/lib/api";

type PaymentType = "plan" | "credits" | "donation";
type Stage = "verifying" | "success" | "error";

function detectType(reference: string): PaymentType {
  if (reference.startsWith("don_")) return "donation";
  // BBF- prefix = subscription/credits, fall back for anything else
  return "plan";
}

async function verifyReference(reference: string, type: PaymentType) {
  if (type === "donation") {
    const res = await api.get(`/donations/verify/${encodeURIComponent(reference)}`);
    return res.data.data;
  }
  const res = await api.get(`/subscriptions/payments/verify/${encodeURIComponent(reference)}`);
  return res.data.data;
}

const TYPE_COPY: Record<PaymentType, { success: string; sub: string; icon: React.ElementType; redirect: string }> = {
  plan: {
    success: "You're locked in.",
    sub: "Your plan is active. Redirecting to billing...",
    icon: CreditCard,
    redirect: "/app/billing",
  },
  credits: {
    success: "Credits added.",
    sub: "Your credit balance has been topped up. Redirecting to billing...",
    icon: CreditCard,
    redirect: "/app/billing",
  },
  donation: {
    success: "Thank you.",
    sub: "Your donation has been received. Redirecting...",
    icon: Heart,
    redirect: "/pricing",
  },
};

function PaymentCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref") ?? "";
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
        const copy = TYPE_COPY[type];
        setTimeout(() => router.push(copy.redirect), 2500);
      })
      .catch(() => {
        setStage("error");
      });
  }, [reference, typeParam]);

  const copy = TYPE_COPY[paymentType];
  const Icon = copy.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-sm w-full text-center">

        {/* Verifying */}
        {stage === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex size-14 items-center justify-center border border-primary/30 bg-primary/5">
              <Loader2 className="size-6 text-primary animate-spin" />
            </div>
            <div>
              <p className="text-base font-black tracking-tighter mb-1">Verifying payment</p>
              <p className="text-xs font-mono text-muted-foreground">
                Confirming with Paystack — this takes a moment...
              </p>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {stage === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex size-14 items-center justify-center border border-primary/30 bg-primary/5">
              <CheckCircle className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-black tracking-tighter mb-1">{copy.success}</p>
              <p className="text-xs font-mono text-muted-foreground">{copy.sub}</p>
            </div>
            <div className="w-full h-px bg-border/30 relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}

        {/* Error */}
        {stage === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex size-14 items-center justify-center border border-destructive/30 bg-destructive/5">
              <XCircle className="size-6 text-destructive" />
            </div>
            <div>
              <p className="text-base font-black tracking-tighter mb-1">Verification failed</p>
              <p className="text-xs font-mono text-muted-foreground mb-1">
                We couldn&apos;t confirm your payment. If funds were deducted, contact support with:
              </p>
              {reference && (
                <p className="text-xs font-mono text-foreground bg-card/60 border border-border/40 px-3 py-1.5 mt-2 break-all">
                  {reference}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
              >
                Go back
              </button>
              <button
                onClick={() => {
                  setStage("verifying");
                  hasRun.current = false;
                  const type = typeParam ?? detectType(reference);
                  setPaymentType(type);
                  verifyReference(reference, type)
                    .then(() => {
                      setStage("success");
                      setTimeout(() => router.push(TYPE_COPY[type].redirect), 2500);
                    })
                    .catch(() => setStage("error"));
                  hasRun.current = true;
                }}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* No reference */}
        {!reference && stage === "verifying" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <XCircle className="size-8 text-muted-foreground" />
            <p className="text-xs font-mono text-muted-foreground">No payment reference found in URL.</p>
            <button
              onClick={() => router.push("/")}
              className="text-xs font-mono text-primary underline underline-offset-2"
            >
              Go home
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="size-6 text-primary animate-spin" />
        </div>
      }
    >
      <PaymentCallbackInner />
    </Suspense>
  );
}
