"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/common";
import { Footer } from "@/components/landing";

export default function StudentDashboardPlaceholderPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 relative py-24">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]" />

        <div className="max-w-md w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 border border-border/50 p-8 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
              <div className="absolute top-0 right-0 w-0.5 h-8 bg-primary" />
              <div className="absolute top-0 right-0 w-8 h-0.5 bg-primary" />
            </div>

            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-primary/20 flex items-center justify-center border border-primary/50">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tighter uppercase mb-4 italic">
              ONBOARDING COMPLETE.
            </h1>

            <div className="h-px bg-border/50 w-full mb-8" />

            <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed mb-4">
              YOUR PROFILE IS NOW CONFIGURED.
            </p>
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed mb-10 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              STUDENT DASHBOARD MODULE IS STILL UNDER CONSTRUCTION.
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
      </main>
      <Footer />
    </div>
  );
}
