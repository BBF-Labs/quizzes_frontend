"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, PartyPopper, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/common";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const LOGO_SRC = "/images/ba87688d-a946-4230-9f62-be5ec02540cd.png";
const QUBI_SRC = "/images/4457e603-56be-465d-9540-580081d60737.png";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken";

const FEATURE_PILLS = [
  {
    emoji: "🎯",
    tint: "bg-blue-50",
    title: "A clear next step",
    body: "Every time you open Qz",
  },
  {
    emoji: "🧠",
    tint: "bg-[#F5F3FF]",
    title: "Practice that adapts",
    body: "To what you know and forget",
  },
  {
    emoji: "📈",
    tint: "bg-[#F7FEE7]",
    title: "Progress you can trust",
    body: "Mastery, rank and exam readiness",
  },
] as const;

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl") || null;

  // Revamp mockup collects first/last/email/password only. The backend still
  // requires a `username` and a full `name`, so we derive both:
  //  - `name` = `${first} ${last}`.trim()
  //  - `username` = lowercased local-part of the email with `[a-z0-9_]`
  //    characters kept; if that resolves to an empty string we fall back to
  //    "qz" so the request always carries a non-empty username. The backend
  //    will re-check uniqueness and surface a 409 if there's a collision;
  //    this is documented behaviour rather than a guarantee.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [referralCode, setReferralCode] = useState("");
  const [referrerDisplayName, setReferrerDisplayName] = useState("");

  // ?ref= / ?referral= → fetch the referrer's display name for the banner.
  useEffect(() => {
    const code = searchParams.get("ref") || searchParams.get("referral");
    if (!code) return;
    setReferralCode(code);
    api
      .get(`/subscriptions/referral/public-lookup/${code}`)
      .then((res) => {
        setReferrerDisplayName(res.data?.data?.displayName || "");
      })
      .catch(() => {
        setReferralCode("");
        setReferrerDisplayName("");
      });
  }, [searchParams]);

  const debouncedEmail = useDebounce(email.trim().toLowerCase(), 500);
  const isEmailCheckable = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail);

  const { data: emailExists, isFetching: isEmailChecking } = useQuery({
    queryKey: ["checkEmailSignup", debouncedEmail],
    queryFn: async () => {
      const res = await api.post("/users/check", { email: debouncedEmail });
      return res.data?.data?.email?.exists ?? false;
    },
    enabled: isEmailCheckable,
    staleTime: 1000 * 60,
  });

  const emailStatus: AvailabilityStatus = !isEmailCheckable
    ? "idle"
    : isEmailChecking
      ? "checking"
      : emailExists === true
        ? "taken"
        : "available";

  const onboardingRedirect = useMemo(
    () =>
      redirectUrl
        ? `/onboarding?redirectUrl=${encodeURIComponent(redirectUrl)}`
        : "/onboarding",
    [redirectUrl],
  );

  const deriveUsername = (rawEmail: string): string => {
    const local = rawEmail
      .trim()
      .toLowerCase()
      .split("@")[0]
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 24);
    return local.length > 0 ? local : "qz";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Please agree to the Terms and Privacy Policy to continue.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (emailStatus === "taken") {
      setError("That email is already registered. Try logging in instead.");
      return;
    }

    const name = `${firstName} ${lastName}`.trim();
    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (!isEmailCheckable) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await signup(
        name,
        email,
        deriveUsername(email),
        password,
        referralCode || undefined,
      );
      router.replace(onboardingRedirect);
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ??
        (err as Error)?.message ??
        "Signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qz-auth min-h-screen bg-white antialiased">
      {/* Fixed top header */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="Qz" className="h-9 w-9 object-contain" />
            <span className="display text-lg font-bold">Qz</span>
          </Link>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="hidden sm:inline">Already have an account?</span>
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Main two-pane layout */}
      <main className="soft-grid min-h-screen px-5 pb-12 pt-28 sm:pt-32">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          {/* Left — marketing pitch */}
          <section className="pt-5 text-center lg:sticky lg:top-32 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-sm">
              <span aria-hidden="true">✦</span> Free to start · no card needed
            </div>
            <h1 className="text-balance mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Build a study system that knows{" "}
              <span className="text-primary">you.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-600 lg:mx-0">
              Tell us a little about your university life. Qz will shape the
              experience around your program, courses and goals.
            </p>

            <div className="mx-auto mt-9 max-w-md space-y-3 text-left lg:mx-0">
              {FEATURE_PILLS.map((pill) => (
                <div
                  key={pill.title}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${pill.tint}`}
                    aria-hidden="true"
                  >
                    {pill.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-bold">{pill.title}</p>
                    <p className="text-[11px] text-slate-500">{pill.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 lg:mx-0 lg:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QUBI_SRC}
                alt="Qubi, your Qz study companion"
                className="h-24 w-24 object-contain"
              />
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-left shadow-md ring-1 ring-slate-200">
                <p className="hand text-xl leading-none text-primary">
                  Hey, I&apos;m Qubi!
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  I&apos;ll help you find your next move.
                </p>
              </div>
            </div>
          </section>

          {/* Right — form card */}
          <section className="card-shadow rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-8 lg:p-10">
            {/* Step indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Create account</span>
                <span>1 of 2</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 rounded-full bg-primary" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Let&apos;s get you set up
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                It takes less than a minute.
              </p>
            </div>

            {/* Referral banner — preserved from previous signup flow */}
            {referrerDisplayName && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15">
                  <PartyPopper className="size-4 text-primary" />
                </div>
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-primary">Invite applied</p>
                  <p className="mt-0.5 text-muted-foreground">
                    You&apos;re using{" "}
                    <span className="font-semibold text-foreground">
                      {referrerDisplayName}
                    </span>
                    &apos;s referral — a{" "}
                    <span className="font-semibold text-primary">
                      15% discount
                    </span>{" "}
                    is waiting.
                  </p>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: "easeOut", duration: 0.45 }}
            >
              <GoogleSignInButton
                referralCode={referralCode || undefined}
                redirectOnLogin={onboardingRedirect}
                label="Sign up with Google"
                className="mt-7"
              />
            </motion.div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                or
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold">
                    First name
                  </span>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    placeholder="Ama"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold">
                    Last name
                  </span>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    placeholder="Mensah"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 flex items-center justify-between text-xs font-bold">
                  <span>Email address</span>
                  <StatusPill status={emailStatus} />
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  autoComplete="email"
                  placeholder="you@university.edu"
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 ${
                    emailStatus === "taken"
                      ? "border-destructive/60 focus:border-destructive focus:ring-destructive/20"
                      : "border-slate-200 focus:border-[#0C60FC]"
                  }`}
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center justify-between text-xs font-bold">
                  <span>Create password</span>
                  <span className="font-medium text-slate-400">
                    8+ characters
                  </span>
                </span>
                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Make it memorable"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 pr-14 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
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

              <label className="flex items-start gap-2.5 text-[11px] leading-5 text-slate-500">
                <input
                  required
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded accent-[#0C60FC]"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-bold text-slate-700 underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-bold text-slate-700 underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {error && (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  emailStatus === "checking" ||
                  emailStatus === "taken"
                }
                className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating account…" : "Continue →"}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-slate-400">
              We only use your details to personalize Qz. Your study materials
              stay private.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: AvailabilityStatus }) {
  if (status === "idle") return null;
  const map: Record<
    Exclude<AvailabilityStatus, "idle">,
    {
      Icon: typeof Loader2;
      label: string;
      cls: string;
    }
  > = {
    checking: {
      Icon: Loader2,
      label: "Checking…",
      cls: "text-muted-foreground",
    },
    available: {
      Icon: CheckCircle2,
      label: "Available",
      cls: "text-primary",
    },
    taken: {
      Icon: XCircle,
      label: "Taken",
      cls: "text-destructive",
    },
  };
  const { Icon, label, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] ${cls}`}>
      <Icon
        className={`size-3 ${status === "checking" ? "animate-spin" : ""}`}
      />
      {label}
    </span>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="qz-auth min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
