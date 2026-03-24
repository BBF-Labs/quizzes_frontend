"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasAdminAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !hasAdminAccess)) {
      router.replace("/login");
    }
  }, [user, isLoading, hasAdminAccess, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase animate-pulse">
          Authenticating...
        </div>
      </div>
    );
  }

  if (!user || !hasAdminAccess) return null;
  return <>{children}</>;
}
