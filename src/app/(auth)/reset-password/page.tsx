"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { SuccessConfetti } from "@/components/common/success-confetti";
import { Loader } from "@/components/common/loader";
import {
  LOGO_SRC,
  QUBI_PEEK_SRC,
  QUBI_STUDY_SRC,
  QUBI_WAVE_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t") || searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");

  const mutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      setErrorStatus("");
      setSubmitted(true);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err as Error)?.message ??
        "Failed to reset password. The link may have expired.";
      setErrorStatus(message);
    },
  });

  const strengthRequirements = [
    { id: "length", label: "At least 8 characters", met: password.length >= 8 },
    { id: "uppercase", label: "An uppercase letter", met: /[A-Z]/.test(password) },
    { id: "number", label: "A number (0-9)", met: /[0-9]/.test(password) },
    {
      id: "special",
      label: "A special symbol (@, $, !, etc.)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const score = strengthRequirements.filter((r) => r.met).length;

  const getStrengthMeta = () => {
    if (score === 0) return { label: "Empty", color: "bg-slate-200", text: "text-slate-400" };
    if (score === 1) return { label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
    if (score === 2) return { label: "Fair", color: "bg-amber-500", text: "text-amber-600" };
    if (score === 3) return { label: "Good", color: "bg-blue-500", text: "text-blue-600" };
    return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
  };

  const strengthMeta = getStrengthMeta();

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorStatus("Missing or invalid reset token. Please request a new link.");
      return;
    }
    if (score < 4) {
      setErrorStatus("Please meet all password requirements before continuing.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorStatus("Passwords do not match.");
      return;
    }

    setErrorStatus("");
    mutation.mutate(password);
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
              <KeyRound className="h-3.5 w-3.5" /> Account protection
            </div>
            <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              Create a new, strong password.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
              Pick something memorable and secure. Once saved, you can immediately log back into Qz and continue your study streak.
            </p>

            <div className="mt-7 flex items-end gap-3">
              <div className="qubi-cycle h-24 w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={QUBI_STUDY_SRC}
                  alt="Qubi studying"
                  className="qubi-study h-24 w-24 object-contain"
                />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-slate-900 shadow-xl">
                <p className="hand text-xl text-[#0C60FC]">Almost there!</p>
                <p className="text-xs font-semibold text-slate-500">
                  Lock it in and let&apos;s get back to learning.
                </p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">8+ Chars</p>
                <p className="mt-1 text-xs text-blue-200">Minimum length</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">🔤 Mixed</p>
                <p className="mt-1 text-xs text-blue-200">Upper &amp; numbers</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">✨ Unique</p>
                <p className="mt-1 text-xs text-blue-200">Keep it safe</p>
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
            <div className="mb-8 flex items-center justify-between lg:hidden">
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
              {/* CASE 1: Missing or Broken Token */}
              {!token && !submitted ? (
                <motion.div
                  key="invalid-token"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-sm">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Invalid reset link
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                      Link expired or broken.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      This password reset link is invalid, expired, or has already been used. Please request a fresh link.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={QUBI_RUN_SRC}
                      alt="Qubi"
                      className="h-16 w-16 shrink-0 object-contain"
                    />
                    <div>
                      <p className="hand text-lg font-bold text-rose-600">
                        Link not found!
                      </p>
                      <p className="text-xs text-slate-500">
                        Links expire after 24 hours for your security.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Link
                      href="/forgot-password"
                      className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-center text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 block"
                    >
                      Request a new reset link →
                    </Link>

                    <Link
                      href="/login"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-center text-xs font-bold text-slate-600 transition hover:bg-slate-50 flex items-center justify-center gap-2 block"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Return to log in
                    </Link>
                  </div>
                </motion.div>
              ) : !submitted ? (
                /* CASE 2: Active Reset Form */
                <motion.div
                  key="reset-form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                        Security Update
                      </p>
                      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-slate-950">
                        Reset password
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Choose a secure new password for your account.
                      </p>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={QUBI_PEEK_SRC}
                      alt="Qubi"
                      className="qubi-peek hidden h-24 w-24 shrink-0 object-contain sm:block lg:hidden xl:block"
                    />
                  </div>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    {/* New Password */}
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-slate-700">
                        New password
                      </span>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-14 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 hover:text-slate-700"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </label>

                    {/* Password Strength Meter */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">
                          Password Strength
                        </span>
                        <span className={`text-[11px] font-extrabold ${strengthMeta.text}`}>
                          {strengthMeta.label}
                        </span>
                      </div>

                      {/* 4 Segmented Progress Bar */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              step <= score ? strengthMeta.color : "bg-slate-100"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Criteria Checklist */}
                      <div className="pt-1 grid grid-cols-1 gap-2 text-xs">
                        {strengthRequirements.map((req) => (
                          <div
                            key={req.id}
                            className={`flex items-center gap-2 transition-colors ${
                              req.met ? "text-emerald-700 font-semibold" : "text-slate-400"
                            }`}
                          >
                            {req.met ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                            )}
                            <span className="text-[11px]">{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <label className="block">
                      <span className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Confirm new password</span>
                        {passwordsMatch && (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Matches
                          </span>
                        )}
                      </span>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className={`w-full rounded-2xl border bg-white px-4 py-3.5 pr-14 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                            passwordsMismatch
                              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                              : "border-slate-200 focus:border-[#0C60FC] focus:ring-blue-100"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 hover:text-slate-700"
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      {passwordsMismatch && (
                        <p className="mt-1.5 text-[11px] font-bold text-rose-600">
                          Passwords do not match.
                        </p>
                      )}
                    </label>

                    {errorStatus && (
                      <div
                        className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-600"
                        role="alert"
                      >
                        {errorStatus}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={mutation.isPending || score < 4 || !passwordsMatch}
                      className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Updating password…</span>
                        </>
                      ) : (
                        <span>Set new password →</span>
                      )}
                    </button>

                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0C60FC] transition-colors py-2"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Return to log in
                    </Link>
                  </form>
                </motion.div>
              ) : (
                /* CASE 3: Success State */
                <motion.div
                  key="success-reset"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <SuccessConfetti />

                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Password updated
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                      All set! <span className="text-[#0C60FC]">Password updated.</span>
                    </h2>
                    <p className="hand mt-2 text-xl text-[#0C60FC]">
                      ready when you are ↘
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={QUBI_WAVE_SRC}
                      alt="Qubi celebrating"
                      className="h-16 w-16 shrink-0 object-contain"
                    />
                    <div className="text-slate-900">
                      <p className="hand text-lg font-bold text-[#0C60FC]">
                        You&apos;re back in!
                      </p>
                      <p className="text-xs text-slate-500">
                        Your credentials have been securely updated.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
                    <p className="text-xs font-bold text-slate-700">
                      Your new password is now active
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You can now log into your account using your new credentials. All your streaks, study sets, and progress are ready for you.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-center text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 block"
                    >
                      Log in to Qz →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-10 text-center text-[10px] leading-5 text-slate-400">
              Need assistance?{" "}
              <Link href="/contact" className="underline hover:text-slate-600">
                Contact support
              </Link>{" "}
              ·{" "}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader message="Loading..." />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
