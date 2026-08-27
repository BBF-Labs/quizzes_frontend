"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  Loader2,
  Zap,
  Lock,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SuccessConfetti } from "@/components/common/success-confetti";
import { Loader } from "@/components/common/loader";
import {
  LOGO_SRC,
  QUBI_PEEK_SRC,
  QUBI_WAVE_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (targetEmail: string) => {
      const res = await api.post("/auth/forgot-password", { email: targetEmail });
      return res.data;
    },
    onSuccess: () => {
      setError("");
      setSubmitted(true);
      toast.success(
        "If an account exists with that email, a password reset link has been sent.",
      );
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err as Error)?.message ??
        "Failed to send recovery link. Please try again.";
      setError(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    mutation.mutate(email.trim().toLowerCase());
  };

  return (
    <div className="qz-auth min-h-screen bg-[#F7F9FC] antialiased">
      <main className="grid min-h-screen lg:grid-cols-[1.08fr_.92fr]">
        {/* Left Brand Banner - Desktop only */}
        <section className="relative hidden overflow-hidden bg-[#0C60FC] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full border-[70px] border-white/5" />
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-[#DFFF61]/15 blur-3xl" />

          <Link href="/" className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_SRC} alt="Qz" className="h-9 w-9 object-contain" />
            </span>
            <span className="display text-xl font-bold">Qz</span>
            <span className="text-xs font-semibold text-blue-200">
              by BetaForge Labs
            </span>
          </Link>

          <div className="relative max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-xs font-bold">
              <KeyRound className="h-3.5 w-3.5" /> Password reset
            </div>
            <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              Don&apos;t worry, we&apos;ve got your back.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
              Forgot your password? It happens. Enter your email and we&apos;ll send you a secure link to reset your access in seconds.
            </p>

            <div className="mt-7 flex items-end gap-3">
              <div className="qubi-cycle h-24 w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={QUBI_PEEK_SRC}
                  alt="Qubi peeking"
                  className="qubi-bob h-24 w-24 object-contain"
                />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-slate-900 shadow-xl">
                <p className="hand text-xl text-[#0C60FC]">I saved your place!</p>
                <p className="text-xs font-semibold text-slate-500">
                  Your courses, streaks and notes are safe.
                </p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Zap className="h-4 w-4 text-[#DFFF61]" /> Instant
                </div>
                <p className="mt-1 text-xs text-blue-200">Email dispatch</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Lock className="h-4 w-4 text-[#DFFF61]" /> Secure
                </div>
                <p className="mt-1 text-xs text-blue-200">Single-use link</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-2 text-lg font-bold">
                  <ShieldCheck className="h-4 w-4 text-[#DFFF61]" /> Protected
                </div>
                <p className="mt-1 text-xs text-blue-200">Data protected</p>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-blue-200">
            Study smarter. Know your rank. Master it all.
          </p>
        </section>

        {/* Right Form Container */}
        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile Header Row */}
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Link href="/" className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO_SRC} alt="Qz" className="h-10 w-10 object-contain" />
                <span className="display text-lg font-bold">Qz</span>
              </Link>
              <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-slate-700">
                Back to login
              </Link>
            </div>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="forgot-form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-950">
                        Forgot password?
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Enter your registered email and we&apos;ll send a one-time link to reset your password.
                      </p>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={QUBI_PEEK_SRC}
                      alt="Qubi peeking"
                      className="qubi-peek hidden h-24 w-24 shrink-0 object-contain sm:block lg:hidden xl:block"
                    />
                  </div>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-slate-700">
                        Email address
                      </span>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          placeholder="you@university.edu"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                    </label>

                    {error && (
                      <div
                        className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-600"
                        role="alert"
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending recovery link…</span>
                        </>
                      ) : (
                        <span>Send reset link →</span>
                      )}
                    </button>

                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0C60FC] transition-colors py-2"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Return to log in
                    </Link>
                  </form>

                  <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={QUBI_RUN_SRC}
                      alt="Qubi running"
                      className="qubi-run h-14 w-14 shrink-0 object-contain"
                    />
                    <div>
                      <p className="hand text-lg leading-none text-[#0C60FC]">
                        Remembered your password?
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        Jump right back in —{" "}
                        <Link
                          href="/login"
                          className="font-extrabold text-[#0C60FC] hover:underline"
                        >
                          Log in now
                        </Link>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <SuccessConfetti />

                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                      Check your <span className="text-[#0C60FC]">inbox.</span>
                    </h2>
                    <p className="hand mt-2 text-xl text-[#0C60FC]">
                      we&apos;re looking up your account ↘
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={QUBI_WAVE_SRC}
                      alt="Qubi waving"
                      className="h-16 w-16 shrink-0 object-contain"
                    />
                    <div className="text-slate-900">
                      <p className="hand text-lg font-bold text-[#0C60FC]">
                        Check your email!
                      </p>
                      <p className="text-xs text-slate-500">
                        Be sure to check your spam or promotions folder too.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If an account exists for <span className="font-bold text-[#0C60FC] break-all">{email}</span>, a password reset link has been sent.
                    </p>
                    <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-slate-700">
                      <Mail className="h-4 w-4 shrink-0 text-[#0C60FC]" />
                      <span>Click the link in the message to set a new password. The link expires in 24 hours.</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Link
                      href="/login"
                      className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-center text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 block"
                    >
                      Return to log in →
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setEmail("");
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-center text-xs font-bold text-slate-600 transition hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Try a different email
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-10 text-center text-[10px] leading-5 text-slate-400">
              Need help?{" "}
              <Link href="/contact" className="underline hover:text-slate-600">
                Contact support
              </Link>{" "}
              ·{" "}
              <Link href="/terms" className="underline hover:text-slate-600">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-slate-600">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Loader message="Loading..." />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
