"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Loader2, Flame } from "lucide-react";

import { useMutation } from "@tanstack/react-query";
import { LOGO_SRC, QUBI_WAVE_SRC, QUBI_PEEK_SRC, QUBI_RUN_SRC } from "@/lib/constants";

function LoginForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl");
  const redirectTarget =
    redirectUrl && redirectUrl.startsWith("/") ? redirectUrl : "/app";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      return await login(identifier, password, rememberMe);
    },
    onSuccess: () => {
      router.replace(redirectTarget);
    },
    onError: (err: unknown) => {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          (err as Error)?.message ??
          "Login failed. Please check your credentials.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };

  useEffect(() => {
    if (user) {
      router.replace(redirectTarget);
    }
  }, [user, router, redirectTarget]);

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
              <Flame className="h-3.5 w-3.5" /> 8 day study streak
            </div>
            <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              Pick up exactly where you left off.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
              Your courses, progress and next best study move are ready when you are.
            </p>

            <div className="mt-7 flex items-end gap-3">
              <div className="qubi-cycle h-24 w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={QUBI_WAVE_SRC}
                  alt="Qubi waving hello"
                  className="qubi-bob h-24 w-24 object-contain"
                />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-slate-900 shadow-xl">
                <p className="hand text-xl text-[#0C60FC]">Welcome back!</p>
                <p className="text-xs font-semibold text-slate-500">
                  I saved your place — Big-O is next.
                </p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">74%</p>
                <p className="mt-1 text-xs text-blue-200">Avg. mastery</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">#12</p>
                <p className="mt-1 text-xs text-blue-200">Course rank</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">18</p>
                <p className="mt-1 text-xs text-blue-200">Days to exam</p>
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
              <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-700">
                Back home
              </Link>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#0C60FC]">
                  Welcome back
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready for your next win?
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Log in to continue your study path.
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QUBI_PEEK_SRC}
                alt="Qubi peeking"
                className="qubi-peek hidden h-24 w-24 shrink-0 object-contain sm:block lg:hidden xl:block"
              />
            </div>

            {/* Google Login Component */}
            <div className="mt-8">
              <GoogleSignInButton redirectOnLogin={redirectTarget} />
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                or use email
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-700">
                  Email address or username
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  placeholder="you@university.edu or username"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Password</span>
                  <Link href="/forgot-password" className="text-[#0C60FC] hover:underline">
                    Forgot password?
                  </Link>
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              <label className="flex cursor-pointer items-center gap-2.5 text-[11px] font-semibold text-slate-600 select-none">
                <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-5 w-5 rounded-md border-2 border-slate-300 bg-white transition-colors peer-checked:border-[#0C60FC] peer-checked:bg-[#0C60FC]" />
                  <svg className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                </span>
                Keep me logged in
              </label>

              {error && (
                <p className="text-xs font-bold text-rose-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-70"
              >
                {loginMutation.isPending ? "Signing in…" : "Log in to Qz →"}
              </button>
            </form>

            <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QUBI_RUN_SRC}
                alt="Qubi running"
                className="qubi-run h-14 w-14 shrink-0 object-contain"
              />
              <div>
                <p className="hand text-lg leading-none text-[#0C60FC]">
                  New here? Race you inside!
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  New to Qz?{" "}
                  <Link href="/signup" className="font-extrabold text-[#0C60FC] hover:underline">
                    Create a free account
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-10 text-center text-[10px] leading-5 text-slate-400">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline">
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="qz-auth min-h-screen bg-[#F7F9FC] flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#0C60FC]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
