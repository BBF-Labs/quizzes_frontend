"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { setSession, signalSessionActive, SessionUser } from "@/lib/session";

type Action = "confirm" | "deny";

type MergeResponse = {
  success: boolean;
  message: string;
  data?: {
    user?: SessionUser;
    accessToken?: string;
    refreshToken?: string;
    status?: "logged_in";
  };
};

function MergeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [submitting, setSubmitting] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ action: Action } | null>(null);

  if (!token) {
    return (
      <Card>
        <IconBlock tone="error">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </IconBlock>
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-4">
          Link Missing
        </h1>
        <Divider />
        <p className="text-sm font-mono text-muted-foreground leading-relaxed mb-10">
          The merge link is invalid or incomplete. Please request a new one by
          signing in with Google from the login page.
        </p>
        <PrimaryLink href="/login">Return to Login</PrimaryLink>
      </Card>
    );
  }

  async function handleAction(action: Action) {
    setError(null);
    setSubmitting(action);
    try {
      const res = await api.post<MergeResponse>("/auth/oauth/merge/confirm", {
        token,
        action,
      });

      const body = res.data?.data;
      if (!body?.user || !body.accessToken || !body.refreshToken) {
        throw new Error("Merge confirmation returned an invalid response");
      }

      setSession(body.user, body.accessToken, body.refreshToken);
      signalSessionActive();
      setSuccess({ action });

      // Brief success flash, then bounce into the app.
      setTimeout(() => {
        router.replace("/onboarding?redirectUrl=%2Fapp");
      }, 800);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        (action === "confirm"
          ? "Failed to link Google account"
          : "Failed to create new account");
      setError(msg);
    } finally {
      setSubmitting(null);
    }
  }

  if (success) {
    return (
      <Card>
        <IconBlock tone="success">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </IconBlock>
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-4">
          {success.action === "confirm" ? "Accounts Linked" : "New Account Created"}
        </h1>
        <Divider />
        <p className="text-sm font-mono text-muted-foreground leading-relaxed mb-10">
          {success.action === "confirm"
            ? "Your Google account is now linked to your Qz account. Continuing into the app…"
            : "Your new Qz account has been created. Continuing into the app…"}
        </p>
        <Loader2 className="size-4 animate-spin text-primary mx-auto" />
      </Card>
    );
  }

  return (
    <Card>
      <IconBlock tone="neutral">
        <ArrowRight className="w-8 h-8 text-foreground" />
      </IconBlock>
      <h1 className="text-3xl font-black tracking-tighter uppercase mb-4">
        Link Google Account?
      </h1>
      <Divider />
      <p className="text-sm font-mono text-muted-foreground leading-relaxed mb-10">
        Someone is trying to sign in to Qz with a Google account that shares
        your email. You can either link the Google account to your existing Qz
        account, or create a new Qz account with the Google email.
      </p>

      {error && (
        <div className="mb-6 flex items-start gap-2 border border-destructive/40 bg-destructive/5 p-3">
          <XCircle className="size-3.5 text-destructive shrink-0 mt-0.5" />
          <p className="text-[11px] font-mono text-destructive leading-relaxed">
            {error}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => handleAction("confirm")}
          disabled={submitting !== null}
          className="group flex w-full items-center justify-center gap-3 bg-primary px-4 h-11 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting === "confirm" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          Confirm Link
        </button>

        <button
          type="button"
          onClick={() => handleAction("deny")}
          disabled={submitting !== null}
          className="group flex w-full items-center justify-center gap-3 border border-border/60 bg-background/60 px-4 h-11 font-mono text-[10px] uppercase tracking-[0.2em] transition-all hover:border-destructive/50 hover:bg-destructive/5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting === "deny" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <XCircle className="size-3.5" />
          )}
          Deny and Create New Account
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-border/40">
        <Link
          href="/login"
          className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors"
        >
          Cancel and return to login
        </Link>
      </div>
    </Card>
  );
}

export default function OAuthMergePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 relative py-24">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-125 h-75 bg-primary/5 blur-[120px]" />
        </div>

        <Suspense
          fallback={
            <div className="max-w-md w-full mx-auto text-center font-mono tracking-widest text-sm animate-pulse">
              Loading…
            </div>
          }
        >
          <MergeContent />
        </Suspense>
      </main>
    </div>
  );
}

// --- Local layout primitives ------------------------------------------------

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md w-full mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/40 border border-border/50 p-8 md:p-12 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
          <div className="absolute top-0 right-0 w-0.5 h-8 bg-primary" />
          <div className="absolute top-0 right-0 w-8 h-0.5 bg-primary" />
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function IconBlock({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "error";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "bg-primary/20 border-primary/50"
      : tone === "error"
        ? "bg-red-500/20 border-red-500/50"
        : "bg-primary/10 border-primary/30";
  return (
    <div className="flex justify-center mb-8">
      <div className={`w-16 h-16 flex items-center justify-center border ${toneClass}`}>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-border/50 w-full mb-8" />;
}

function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center space-x-3 bg-primary px-8 py-4 text-primary-foreground font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-primary hover:ring-1 hover:ring-inset hover:ring-primary transition-all duration-300 group rounded(--radius) w-full justify-center"
    >
      <span>{children}</span>
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
