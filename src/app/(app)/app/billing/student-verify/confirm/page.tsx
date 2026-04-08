"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useConfirmStudentVerify } from "@/hooks";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const confirm = useConfirmStudentVerify();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("The verification token is missing. Please initiate a new verification request from your settings.");
      return;
    }

    if (status === "idle" && !initialized.current) {
      initialized.current = true;
      setStatus("loading");
      confirm.mutateAsync(token)
        .then(() => {
          setStatus("success");
        })
        .catch((err: any) => {
          setStatus("error");
          setErrorMessage(
            err?.response?.data?.message ?? 
            "This verification link has expired or is invalid. Please request a new one."
          );
        });
    }
  }, [token, confirm, status]);

  return (
    <div className="max-w-md w-full mx-auto relative z-10 my-12">
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
          {status === "loading" && (
            <div className="w-16 h-16 border-2 border-primary/20 border-t-primary animate-spin" />
          )}
          {status === "success" && (
            <div className="w-16 h-16 bg-primary/20 flex items-center justify-center border border-primary/50">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 bg-red-500/20 flex items-center justify-center border border-red-500/50">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>

        <h1 className="text-3xl font-black tracking-tighter mb-4">
          {status === "loading" && "Verifying Student Status"}
          {status === "success" && "Verification Successful"}
          {status === "error" && "Verification Failed"}
        </h1>

        <div className="h-px bg-border/50 w-full mb-8" />

        <p className="text-sm font-mono text-muted-foreground leading-relaxed mb-10">
          {status === "loading" && "Please wait while we verify your institutional email address..."}
          {status === "success" && "Your institutional email has been verified! You now have access to special academic discounts."}
          {status === "error" && errorMessage}
        </p>

        <Link
          href="/app/settings?tab=verification"
          className="inline-flex items-center space-x-3 bg-primary px-8 py-4 text-primary-foreground font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-primary hover:ring-1 hover:ring-inset hover:ring-primary transition-all duration-300 group rounded(--radius) w-full justify-center"
        >
          <span>Return To Settings</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </div>
  );
}

export default function StudentVerifyConfirmPage() {
  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 w-full">
      {/* Background Grid Pattern (matching newsletter) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

      <Suspense
        fallback={
          <div className="max-w-md w-full mx-auto text-center font-mono tracking-widest text-sm animate-pulse">
            Loading...
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
