"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Loader2 } from "lucide-react";

const LOGO_SRC = "/images/ba87688d-a946-4230-9f62-be5ec02540cd.png";
const QUBI_SRC = "/images/4457e603-56be-465d-9540-580081d60737.png";

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password, rememberMe);
      router.replace(redirectTarget);
    } catch (err: unknown) {
      setError(
        (err instanceof Error ? err.message : undefined) ??
          (err as unknown as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ??
          "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  // Authenticated users skip the auth surface entirely.
  useEffect(() => {
    if (user) {
      router.replace(redirectTarget);
    }
  }, [user, router, redirectTarget]);

  return (
    <div className="qz-auth min-h-screen bg-[#F7F9FC] antialiased">
      <main className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        {/* Left brand panel — hidden below lg */}
        <aside className="relative hidden overflow-hidden bg-[#0C60FC] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          {/* Decorative circles */}
          <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full border-[70px] border-white/5" />
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-[#DFFF61]/15 blur-3xl" />

          {/* Brand block */}
          <Link
            href="/"
            className="relative flex items-center gap-3"
            aria-label="Qz home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_SRC}
                alt="Qz"
                className="h-9 w-9 object-contain"
              />
            </span>
            <span className="display text-xl font-bold">Qz</span>
            <span className="text-xs font-semibold text-blue-200">
              by BetaForge Labs
            </span>
          </Link>

          {/* Hero copy */}
          <div className="relative max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-xs font-bold">
              <span aria-hidden="true">🔥</span> 8 day study streak
            </div>
            <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              Pick up exactly where you left off.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
              Your courses, progress and next best study move are ready when
              you are.
            </p>

            {/* Qubi chat row */}
            <div className="mt-7 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QUBI_SRC}
                alt="Qubi, your Qz study companion"
                className="h-24 w-24 object-contain"
              />
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-slate-900 shadow-xl">
                <p className="hand text-xl text-[#0C60FC]">Welcome back!</p>
                <p className="text-xs font-semibold text-slate-500">
                  I saved your place.
                </p>
              </div>
            </div>

            {/* Stats grid */}
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

          {/* Footer line */}
          <p className="relative text-xs text-blue-200">
            Study smarter. Know your rank. Master it all.
          </p>
        </aside>

        {/* Right form panel */}
        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile-only brand row */}
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Link href="/" className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_SRC}
                  alt="Qz"
                  className="h-10 w-10 object-contain"
                />
                <span className="display text-lg font-bold">Qz</span>
              </Link>
              <Link
                href="/"
                className="text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Back home
              </Link>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                Welcome back
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready for your next win?
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Log in to continue your study path.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: "easeOut", duration: 0.45 }}
            >
              <GoogleSignInButton
                redirectOnLogin={redirectTarget}
                className="mt-8"
              />
            </motion.div>

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
                  Email address
                </span>
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="email"
                  placeholder="you@university.edu"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Password</span>
                  <Link
                    href="/forgot-password"
                    className="text-[#0C60FC] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-14 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 hover:text-slate-700"
                    tabIndex={-1}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[#0C60FC]"
                />
                Keep me logged in
              </label>

              {error && (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in…" : "Log in to Qz →"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              New to Qz?{" "}
              <Link
                href="/signup"
                className="font-extrabold text-[#0C60FC] hover:underline"
              >
                Create a free account
              </Link>
            </p>
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
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
