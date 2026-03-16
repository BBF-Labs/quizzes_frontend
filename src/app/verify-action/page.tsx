"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function VerifyActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("t");
  
  useEffect(() => {
    if (!token) {
      // If no token, just redirect to login
      router.replace("/login");
      return;
    }

    // Since we now have general pages for auth actions, we can redirect directly
    // based on the intended action. However, the token itself is needed on the page.
    // For password reset, we redirect to /reset-password?t=...
    // In the future, we might have /verify-email, /confirm-attendance, etc.
    
    // For now, the only action is reset-password
    router.replace(`/reset-password?t=${token}`);
  }, [token, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        <Loader2 className="size-10 text-primary animate-spin relative z-10" />
      </div>
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
        Verifying security token...
      </p>
    </div>
  );
}

export default function VerifyActionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyActionContent />
    </Suspense>
  );
}
