"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { LayoutDashboard, Rocket } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSuper, setIsSuper] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password, rememberMe);
      // We don't have the user object directly here easily unless we check useAuth().user
      // or the login function returns it. The login function in auth-context.tsx does NOT return the user in its public interface.
      // But we can check it via a side effect or just trust the next useAuth() call.
      // Actually, let's just use window.location or router.refresh to get the latest state.
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();
  
  // Logic: When successful login happens, if superadmin, show choice. Else redirect.
  if (isSuccess && user) {
    if (!user.isSuperAdmin) {
      router.replace("/");
      return null;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 border border-border/50 p-8 md:p-12 text-center relative overflow-hidden w-full max-w-md"
        >
          {/* Decorative corners */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
            <div className="absolute top-0 right-0 w-[2px] h-8 bg-primary" />
            <div className="absolute top-0 right-0 w-8 h-[2px] bg-primary" />
          </div>
          <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-primary" />
            <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-primary" />
          </div>

          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary/20 flex items-center justify-center border border-primary/50">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tighter uppercase mb-4 italic">
            ACCESS GRANTED.
          </h1>

          <div className="h-px bg-border/50 w-full mb-8" />

          <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed mb-10">
            AUTHORIZED PERSONNEL DETECTED. SELECT YOUR DESTINATION MODULE TO INITIATE SESSION.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <Button
              onClick={() => router.push("/admin")}
              className="h-16 rounded-none bg-primary px-8 text-primary-foreground font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-primary hover:ring-1 hover:ring-inset hover:ring-primary transition-all duration-300 group shadow-[0_0_20px_rgba(0,110,255,0.15)] flex items-center justify-center gap-3"
            >
              <LayoutDashboard className="size-4" />
              <span>ADMIN PANEL</span>
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="h-16 rounded-none border border-primary/40 bg-transparent px-8 text-primary font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <Rocket className="size-4 group-hover:animate-pulse" />
              <span>STUDENT PORTAL</span>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

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
            <span className="text-xl font-bold tracking-widest text-foreground leading-none">Qz.</span>
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
              className="rounded-none border-border/50"
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
            className="w-full rounded-none font-mono text-[10px] tracking-[0.2em] uppercase h-11 bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,110,255,0.15)] hover:shadow-[0_0_30px_rgba(0,110,255,0.25)] transition-all"
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
        </form>
      </motion.div>
    </div>
  );
}
