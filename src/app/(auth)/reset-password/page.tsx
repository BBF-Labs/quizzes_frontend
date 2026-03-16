"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import axios from "axios";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("t");
  // ... state declarations ...
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");

  const mutation = useMutation({
    mutationFn: async (newPassword: string) => {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/auth/reset-password`, {
        token,
        newPassword,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const [strength, setStrength] = useState({
    score: 0,
    requirements: [
      { id: "length", label: "Min 8 characters", met: false },
      { id: "uppercase", label: "Uppercase letter", met: false },
      { id: "number", label: "A number", met: false },
      { id: "special", label: "Special character", met: false },
    ],
  });

  useEffect(() => {
    const requirements = [
      { id: "length", label: "Min 8 characters", met: password.length >= 8 },
      { id: "uppercase", label: "Uppercase letter", met: /[A-Z]/.test(password) },
      { id: "number", label: "A number", met: /[0-9]/.test(password) },
      { id: "special", label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = requirements.filter((r) => r.met).length;
    setStrength({ score, requirements });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength.score < 4) {
      setErrorStatus("Please meet all password requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorStatus("Passwords do not match.");
      return;
    }
    if (!token) {
      setErrorStatus("Missing or invalid reset token.");
      return;
    }

    setErrorStatus("");
    mutation.mutate(password);
  };

  if (!token && !submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        {/* ... error display ... */}
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="size-16 bg-destructive/10 mx-auto flex items-center justify-center border border-destructive/20 text-destructive">
          <X className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Invalid Link</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
            This reset link is missing or broken.
          </p>
          <Link href="/forgot-password">
             <Button className="rounded-none font-mono text-xs uppercase tracking-widest h-11 px-8">
              Request New Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
              key="reset-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="mb-10">
                <div className="inline-block border border-primary/60 px-2 py-1 mb-4 bg-primary/5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
                    Security Update
                  </span>
                </div>
                <div className="flex items-end space-x-2 mb-2">
                  <span className="text-xl font-bold tracking-widest text-foreground leading-none">Qz.</span>
                </div>
                <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
                  Reset.
                </h1>
                <p className="text-[10px] font-mono text-muted-foreground mt-3 tracking-widest uppercase opacity-70">
                  Choose a strong balance of security.
                </p>
                <div className="h-px w-12 bg-primary/40 mt-6" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="rounded-none font-mono bg-secondary/40 dark:bg-input/30 border-border pr-10 h-11"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength */}
                  <div className="p-3 bg-secondary/40 border border-border space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                        Complexity: {strength.score}/4
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1 w-6 transition-all ${
                              step <= strength.score ? "bg-primary" : "bg-muted/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                      {strength.requirements.map((req) => (
                        <div key={req.id} className="flex items-center gap-1.5">
                          {req.met ? (
                            <Check className="size-2.5 text-primary" />
                          ) : (
                            <div className="size-2.5 border border-muted-foreground/30" />
                          )}
                          <span className={`text-[9px] font-mono uppercase tracking-tighter ${req.met ? "text-foreground" : "text-muted-foreground/60"}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`rounded-none font-mono bg-secondary/40 dark:bg-input/30 border-border pr-10 h-11 ${
                          confirmPassword && password !== confirmPassword ? "border-destructive/50" : ""
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {(errorStatus || mutation.isError) && (
                  <p className="text-[11px] font-mono text-destructive tracking-wider">
                    {errorStatus || (mutation.error instanceof Error ? mutation.error.message : (mutation.error as any)?.response?.data?.message || "Reset failed.")}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full rounded-none font-mono text-[10px] tracking-[0.2em] uppercase h-11 bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,110,255,0.15)] hover:shadow-[0_0_30px_rgba(0,110,255,0.25)] transition-all"
                >
                  {mutation.isPending ? "Updating..." : "Reset Password"}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-reset"
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
                ACCESS GRANTED.
              </h1>

              <div className="h-px bg-border/50 w-full mb-8" />
              
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed mb-10">
                YOUR CREDENTIALS HAVE BEEN SUCCESSFULLY VETTED. YOU ARE NOW SYNCED WITH THE SECURE SYSTEM MODULE.
              </p>

              <Link href="/login" className="block w-full">
                <Button
                  className="w-full rounded-none bg-primary px-8 py-6 text-primary-foreground font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-primary hover:ring-1 hover:ring-inset hover:ring-primary transition-all duration-300 group shadow-[0_0_20px_rgba(0,110,255,0.15)]"
                >
                  <span>RETURN TO BASE</span>
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
