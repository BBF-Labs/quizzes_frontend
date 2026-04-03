"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
            Login
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
              Email or Username
            </label>
            <Input
              id="admin-identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              className="rounded-(--radius) font-mono bg-secondary/40 dark:bg-input/30 border-border focus-visible:ring-ring/50"
              placeholder="email@example.com or username"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-(--radius) font-mono bg-secondary/40 dark:bg-input/30 border-border pr-10"
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

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              className="rounded-(--radius) border-border/50"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
            />
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              Remember me
            </span>
          </div>

          {error && (
            <p className="text-[11px] font-mono text-destructive tracking-wider">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-(--radius) font-mono text-[10px] tracking-[0.2em] uppercase h-11 bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,110,255,0.15)] hover:shadow-[0_0_30px_rgba(0,110,255,0.25)] transition-all"
          >
            {loading ? "Authenticating…" : "Login"}
          </Button>

          <div className="flex justify-center pt-2">
            <Link
              href="/forgot-password"
              className="text-[10px] font-mono text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-widest"
            >
              Forgot password?
            </Link>
          </div>
          <div className="flex justify-center">
            <span className="text-[10px] font-mono text-muted-foreground/60 tracking-widest uppercase">
              No account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </span>
          </div>
        </form>
      </motion.div>
    </div>
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
