"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/auth/forgot-password`, { email });
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-125 h-75 bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="forgot-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="mb-10">
                <div className="inline-block border border-primary/60 px-2 py-1 mb-4 bg-primary/5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
                    Account Recovery
                  </span>
                </div>
                <div className="flex items-end space-x-2 mb-2">
                  <Link href="/">
                    <span className="text-xl font-bold tracking-widest text-foreground leading-none hover:text-primary transition-colors cursor-pointer">Qz.</span>
                  </Link>
                </div>
                <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
                  Forgot?
                </h1>
                <p className="text-[10px] font-mono text-muted-foreground mt-3 tracking-widest uppercase opacity-70">
                  Enter your email to receive a recovery link.
                </p>
                <div className="h-px w-12 bg-primary/40 mt-6" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground flex items-center gap-2">
                    <Mail className="size-3" /> Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-none font-mono bg-secondary/40 dark:bg-input/30 border-border focus-visible:ring-ring/50 h-11"
                    placeholder="name@example.com"
                  />
                </div>

                {mutation.isError && (
                  <p className="text-[11px] font-mono text-destructive tracking-wider">
                    {mutation.error instanceof Error ? mutation.error.message : (mutation.error as any)?.response?.data?.message || "Something went wrong."}
                  </p>
                )}

                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full rounded-none font-mono text-xs tracking-[0.2em] uppercase h-11 shadow-[0_0_20px_rgba(0,110,255,0.1)] hover:shadow-[0_0_30px_rgba(0,110,255,0.2)] transition-all"
                  >
                    {mutation.isPending ? "Processing…" : "Send Reset Link"}
                  </Button>
                  
                  <Link 
                    href="/login"
                    className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest py-2"
                  >
                    <ArrowLeft className="size-3" /> Back to Login
                  </Link>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-card/40 border border-border/50 p-8 md:p-12 text-center relative overflow-hidden"
            >
              {/* Decorative corners - mirroring newsletter pattern */}
              <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none">
                <div className="absolute top-0 right-0 w-[2px] h-6 bg-primary" />
                <div className="absolute top-0 right-0 w-6 h-[2px] bg-primary" />
              </div>
              <div className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-[2px] h-6 bg-primary" />
                <div className="absolute bottom-0 left-0 w-6 h-[2px] bg-primary" />
              </div>

              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-primary/20 flex items-center justify-center border border-primary/50">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <h1 className="text-3xl font-black tracking-tighter uppercase mb-4 italic">
                LINK DISPATCHED.
              </h1>

              <div className="h-px bg-border/50 w-full mb-8" />
              
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed mb-10">
                IF <span className="text-foreground font-bold">{email}</span> IS REGISTERED, AN ENCRYPTED RECOVERY LINK HAS BEEN SENT TO YOUR INBOX.
              </p>

              <div className="space-y-4">
                <Link href="/login" className="block w-full">
                  <Button
                    className="w-full rounded-none bg-primary px-8 py-6 text-primary-foreground font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-primary hover:ring-1 hover:ring-inset hover:ring-primary transition-all duration-300 group shadow-[0_0_20px_rgba(0,110,255,0.15)]"
                  >
                    <span>RETURN TO BASE</span>
                  </Button>
                </Link>
                
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="size-3" /> TRY ANOTHER EMAIL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
