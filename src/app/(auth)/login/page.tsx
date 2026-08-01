"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { MarketingPanel } from "@/components/auth/MarketingPanel";
import Link from "next/link";
import { Suspense } from "react";

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

  // If a user is already authenticated, keep auth pages inaccessible.
  useEffect(() => {
    if (user) {
      router.replace(redirectTarget);
    }
  }, [user, router, redirectTarget]);

  return (
    <AuthSplitLayout
      left={<MarketingPanel variant="login" />}
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
            <span className="text-xs text-muted-foreground">Sign in</span>
          </div>

          {/* Card */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/60 p-8 lg:p-10">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Sign in to continue to your study workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="admin-identifier"
                  className="text-xs font-medium text-foreground/80"
                >
                  Email or username
                </label>
                <Input
                  id="admin-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  className="rounded-lg bg-background/60 border-border/60 focus-visible:ring-primary/40 h-11"
                  placeholder="you@university.edu"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="text-xs font-medium text-foreground/80"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="remember-me"
                  className="rounded-md border-border/50"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(Boolean(checked))
                  }
                />
                <label
                  htmlFor="remember-me"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  Keep me signed in
                </label>
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg text-sm font-medium h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                New to Qz?{" "}
                <Link
                  href="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  Create an account
                </Link>
              </p>
            </form>
          </div>

          <SocialLoginButtons redirectOnLogin={redirectTarget} />
        </motion.div>
      }
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
