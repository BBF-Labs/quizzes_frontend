"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useConfirmNewsletter } from "@/hooks/use-newsletter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { mutate, isPending, isSuccess, isError } = useConfirmNewsletter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (token && !initialized) {
      mutate(token);
      setInitialized(true);
    }
  }, [token, mutate, initialized]);

  return (
    <div className="max-w-md w-full mx-auto">
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
          {isPending ? (
            <div className="w-16 h-16 border-2 border-primary/20 border-t-primary animate-spin" />
          ) : isSuccess ? (
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
          {isPending ? "VERIFYING..." : isSuccess ? "ACCESS GRANTED." : "ERROR DETECTED."}
        </h1>

        <div className="h-px bg-border/50 w-full mb-8" />

        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed mb-10">
          {isPending
            ? "SYNCHRONIZING ENCRYPTION KEYS AND VALIDATING YOUR SUBSCRIBER STATUS..."
            : isSuccess
            ? "YOUR SUBSCRIPTION HAS BEEN SUCCESSFULLY VETTED. YOU ARE NOW SYNCED WITH THE QZ INTEL STREAM."
            : "THE PROVIDED TOKEN IS INVALID OR HAS EXPIRED. PLEASE INITIATE A NEW REQUEST FROM THE FOOTER."}
        </p>

        <Link
          href="/"
          className="inline-flex items-center space-x-3 bg-primary px-8 py-4 text-primary-foreground font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-primary hover:ring-1 hover:ring-inset hover:ring-primary transition-all duration-300 group"
        >
          <span>RETURN TO BASE</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 relative py-24">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <Suspense fallback={
          <div className="max-w-md w-full mx-auto text-center font-mono animate-pulse">
            LOADING SECURE MODULE...
          </div>
        }>
          <ConfirmContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
