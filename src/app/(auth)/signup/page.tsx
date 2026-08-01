"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  XCircle,
  PartyPopper,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { MarketingPanel } from "@/components/auth/MarketingPanel";
import Link from "next/link";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/common";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken";

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl") || null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedUsername = useDebounce(username.trim().toLowerCase(), 500);
  const debouncedEmail = useDebounce(email.trim().toLowerCase(), 500);

  const [referralCode, setReferralCode] = useState("");
  const [referrerDisplayName, setReferrerDisplayName] = useState("");

  useEffect(() => {
    const code = searchParams.get("ref") || searchParams.get("referral");
    if (code) {
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
    }
  }, [searchParams]);

  const isUsernameCheckable = debouncedUsername.length >= 3;
  const isEmailCheckable = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail);

  const { data: usernameExists, isFetching: isUsernameChecking } = useQuery({
    queryKey: ["checkUsername", debouncedUsername],
    queryFn: async () => {
      const res = await api.post("/users/check", {
        username: debouncedUsername,
      });
      return res.data?.data?.username?.exists ?? false;
    },
    enabled: isUsernameCheckable,
    staleTime: 1000 * 60,
  });

  const { data: emailExists, isFetching: isEmailChecking } = useQuery({
    queryKey: ["checkEmail", debouncedEmail],
    queryFn: async () => {
      const res = await api.post("/users/check", { email: debouncedEmail });
      return res.data?.data?.email?.exists ?? false;
    },
    enabled: isEmailCheckable,
    staleTime: 1000 * 60,
  });

  const usernameStatus: AvailabilityStatus = !isUsernameCheckable
    ? "idle"
    : isUsernameChecking
      ? "checking"
      : usernameExists === true
        ? "taken"
        : "available";

  const emailStatus: AvailabilityStatus = !isEmailCheckable
    ? "idle"
    : isEmailChecking
      ? "checking"
      : emailExists === true
        ? "taken"
        : "available";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (emailStatus === "taken") {
      setError("That email is already registered");
      return;
    }

    if (usernameStatus === "taken") {
      setError("That username is already taken");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, username, password, referralCode || undefined);
      const dest = redirectUrl
        ? `/onboarding?redirectUrl=${encodeURIComponent(redirectUrl)}`
        : "/onboarding";
      router.replace(dest);
    } catch (err) {
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
    <AuthSplitLayout
      left={<MarketingPanel variant="signup" />}
      right={
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeOut", duration: 0.45 }}
          className="w-full"
        >
          {/* Mobile-only brand row */}
          <div className="flex md:hidden items-center justify-between mb-8">
            <Link href="/">
              <span className="text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors">
                Qz.
              </span>
            </Link>
            <span className="text-xs text-muted-foreground">
              Create account
            </span>
          </div>

          {/* Card */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/60 p-8 lg:p-10">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                Create your account
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Start studying smarter — it takes about a minute.
              </p>
            </div>

            {referrerDisplayName && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-primary/5 border border-primary/30 flex items-start gap-3"
              >
                <div className="size-8 bg-primary/15 flex items-center justify-center shrink-0 rounded-md">
                  <PartyPopper className="size-4 text-primary" />
                </div>
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-primary">
                    Invite applied
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    You&apos;re using{" "}
                    <span className="text-foreground font-semibold">
                      {referrerDisplayName}
                    </span>
                    &apos;s referral — a{" "}
                    <span className="text-primary font-semibold">
                      15% discount
                    </span>{" "}
                    is waiting.
                  </p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="signup-name"
                  className="text-xs font-medium text-foreground/80"
                >
                  Full name
                </label>
                <Input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="rounded-lg bg-background/60 border-border/60 focus-visible:ring-primary/40 h-11"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="signup-email"
                    className="text-xs font-medium text-foreground/80"
                  >
                    Email
                  </label>
                  <StatusPill status={emailStatus} />
                </div>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  required
                  autoComplete="email"
                  className={`rounded-lg bg-background/60 border-border/60 focus-visible:ring-primary/40 h-11 ${
                    emailStatus === "taken"
                      ? "border-destructive/60"
                      : ""
                  }`}
                  placeholder="you@university.edu"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="signup-username"
                    className="text-xs font-medium text-foreground/80"
                  >
                    Username
                  </label>
                  <StatusPill status={usernameStatus} />
                </div>
                <Input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_]/g, ""),
                    )
                  }
                  required
                  autoComplete="username"
                  className={`rounded-lg bg-background/60 border-border/60 focus-visible:ring-primary/40 h-11 ${
                    usernameStatus === "taken"
                      ? "border-destructive/60"
                      : ""
                  }`}
                  placeholder="janedoe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="signup-password"
                    className="text-xs font-medium text-foreground/80"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="rounded-lg bg-background/60 border-border/60 focus-visible:ring-primary/40 h-11 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="signup-confirm"
                    className="text-xs font-medium text-foreground/80"
                  >
                    Confirm
                  </label>
                  <Input
                    id="signup-confirm"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="rounded-lg bg-background/60 border-border/60 focus-visible:ring-primary/40 h-11"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                By creating an account you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <Button
                type="submit"
                disabled={
                  loading ||
                  emailStatus === "checking" ||
                  usernameStatus === "checking" ||
                  emailStatus === "taken" ||
                  usernameStatus === "taken"
                }
                className="w-full rounded-lg text-sm font-medium h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          <SocialLoginButtons
            referralCode={referralCode || undefined}
            redirectOnLogin={
              redirectUrl
                ? `/onboarding?redirectUrl=${encodeURIComponent(redirectUrl)}`
                : "/onboarding"
            }
          />
        </motion.div>
      }
    />
  );
}

function StatusPill({ status }: { status: AvailabilityStatus }) {
  if (status === "idle") return null;
  const map: Record<Exclude<AvailabilityStatus, "idle">, { Icon: typeof Loader2; label: string; cls: string }> = {
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
      <Icon className={`size-3 ${status === "checking" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
