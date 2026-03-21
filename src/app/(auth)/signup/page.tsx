"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const isUsernameCheckable = debouncedUsername.length >= 3;
  const isEmailCheckable = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail);

  const { data: usernameExists, isFetching: isUsernameChecking } = useQuery({
    queryKey: ["checkUsername", debouncedUsername],
    queryFn: async () => {
      const res = await api.post("/users/check", { username: debouncedUsername });
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
      await signup(name, email, username, password);
      // Append redirectUrl if it exists so Onboarding page can forward the user along after completion.
      const dest = redirectUrl ? `/onboarding?redirectUrl=${encodeURIComponent(redirectUrl)}` : "/onboarding";
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
        {/* Header */}
        <div className="mb-10">
          <div className="inline-block border border-primary/60 px-2 py-1 mb-4 bg-primary/5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
              <ShieldCheck className="inline size-3 mr-1 align-[-1px]" />
              Portal Access
            </span>
          </div>
          <div className="flex items-end space-x-2 mb-2">
            <Link href="/">
              <span className="text-xl font-bold tracking-widest text-foreground leading-none hover:text-primary transition-colors cursor-pointer">
                Qz.
              </span>
            </Link>
          </div>
          <h1 className="text-3xl font-mono font-bold tracking-[0.2em] text-foreground uppercase">
            Sign Up
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground mt-2 tracking-[0.15em] uppercase opacity-70">
            BetaForge Labs — Quiz Platform
          </p>
          <div className="h-px w-12 bg-primary/40 mt-6" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              Full Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="rounded-none font-mono bg-secondary/40 dark:bg-input/30 border-border focus-visible:ring-ring/50"
              placeholder="Jane Doe"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                Email
              </label>
              <div className="flex items-center gap-1.5 h-4">
                {emailStatus === "checking" && (
                  <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase">
                    <Loader2 className="size-2.5 animate-spin" /> Checking
                  </div>
                )}
                {emailStatus === "available" && (
                  <div className="flex items-center gap-1 text-[9px] font-mono text-primary uppercase">
                    <CheckCircle2 className="size-2.5" /> Available
                  </div>
                )}
                {emailStatus === "taken" && (
                  <div className="flex items-center gap-1 text-[9px] font-mono text-destructive uppercase">
                    <XCircle className="size-2.5" /> Taken
                  </div>
                )}
              </div>
            </div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              required
              autoComplete="email"
              className={`rounded-none font-mono bg-secondary/40 dark:bg-input/30 border-border focus-visible:ring-ring/50 ${
                emailStatus === "taken" ? "border-destructive/50" : ""
              }`}
              placeholder="jane@university.edu"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                Username
              </label>
              <div className="flex items-center gap-1.5 h-4">
                {usernameStatus === "checking" && (
                  <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase">
                    <Loader2 className="size-2.5 animate-spin" /> Checking
                  </div>
                )}
                {usernameStatus === "available" && (
                  <div className="flex items-center gap-1 text-[9px] font-mono text-primary uppercase">
                    <CheckCircle2 className="size-2.5" /> Available
                  </div>
                )}
                {usernameStatus === "taken" && (
                  <div className="flex items-center gap-1 text-[9px] font-mono text-destructive uppercase">
                    <XCircle className="size-2.5" /> Taken
                  </div>
                )}
              </div>
            </div>
            <Input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                )
              }
              required
              autoComplete="username"
              className={`rounded-none font-mono bg-secondary/40 dark:bg-input/30 border-border focus-visible:ring-ring/50 ${
                usernameStatus === "taken" ? "border-destructive/50" : ""
              }`}
              placeholder="janedoe"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="rounded-none font-mono bg-secondary/40 dark:bg-input/30 border-border pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              Confirm Password
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="rounded-none font-mono bg-secondary/40 dark:bg-input/30 border-border"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[11px] font-mono text-destructive tracking-wider">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={
              loading ||
              emailStatus === "checking" ||
              usernameStatus === "checking" ||
              emailStatus === "taken" ||
              usernameStatus === "taken"
            }
            className="w-full rounded-none font-mono text-[10px] tracking-[0.2em] uppercase h-11 bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,110,255,0.15)] hover:shadow-[0_0_30px_rgba(0,110,255,0.25)] transition-all"
          >
            {loading ? "Creating Account…" : "Create Account"}
          </Button>

          <div className="flex justify-center pt-2">
            <span className="text-[10px] font-mono text-muted-foreground/60 tracking-widest uppercase">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
