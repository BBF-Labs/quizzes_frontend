"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useVerifyPayment } from "@/hooks";
import { toast } from "sonner";

export default function VerifyPage() {
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
        toast.success("Payment confirmed. Welcome to the grind.");
        setTimeout(() => router.push("/app/billing"), 2000);
      },
      onError: () => {
        toast.error("Payment verification failed. If funds were deducted, contact support.");
      },
    });
  }, [reference]);

  return (
    <div className="min-h-full px-4 py-8 flex items-center justify-center">
      <div className="mx-auto max-w-sm text-center">
        {verifyPayment.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="size-8 animate-spin text-primary" />
            <div>
              <p className="text-sm font-semibold tracking-tight mb-1">Verifying payment</p>
              <p className="text-xs font-mono text-muted-foreground">
                Hang tight — confirming with Paystack...
              </p>
            </div>
          </motion.div>
        )}

        {verifyPayment.isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="border border-primary/30 bg-primary/5 p-4">
              <CheckCircle className="size-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tighter mb-1">You&apos;re locked in.</p>
              <p className="text-xs font-mono text-muted-foreground">
                Redirecting to your billing page...
              </p>
            </div>
          </motion.div>
        )}

        {verifyPayment.isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="border border-destructive/30 bg-destructive/5 p-4">
              <XCircle className="size-8 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tighter mb-1">Verification failed</p>
              <p className="text-xs font-mono text-muted-foreground mb-4">
                If funds were deducted, please contact support with reference:{" "}
                <span className="text-foreground font-semibold">{reference}</span>
              </p>
              <button
                onClick={() => router.push("/app/billing")}
                className="text-xs font-mono text-primary underline underline-offset-2"
              >
                Back to billing
              </button>
            </div>
          </motion.div>
        )}

        {!reference && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
            <XCircle className="size-8 text-muted-foreground" />
            <p className="text-xs font-mono text-muted-foreground">No payment reference found.</p>
            <button
              onClick={() => router.push("/app/billing")}
              className="text-xs font-mono text-primary underline underline-offset-2"
            >
              Back to billing
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
