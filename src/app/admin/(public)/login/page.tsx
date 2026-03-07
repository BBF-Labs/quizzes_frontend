"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
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
      await login(username, password, rememberMe);
      router.replace("/admin");
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* ... existing dot grid and glow ... */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-125 h-75 rounded-full bg-primary/5 blur-[120px]" />
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
              Superadmin Access
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Qz.
          </h1>
          <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
            BetaForge Labs — Internal Dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              Username
            </label>
            <Input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="rounded-none font-mono bg-secondary/40 dark:bg-input/30 border-border focus-visible:ring-ring/50"
              placeholder="superadmin"
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

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              className="rounded-none"
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
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className="w-full rounded-none font-mono text-xs tracking-[0.2em] uppercase h-11 shadow-[0_0_20px_rgba(0,110,255,0.1)] hover:shadow-[0_0_30px_rgba(0,110,255,0.2)] transition-all"
          >
            {loading ? "Authenticating…" : "Login"}
          </Button>
        </form>

        <p className="text-[10px] font-mono text-muted-foreground/40 text-center mt-8 uppercase tracking-widest">
          Restricted Access — Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
}
