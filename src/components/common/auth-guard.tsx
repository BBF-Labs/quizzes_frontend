"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export function AuthGuard({ children, requireSuperAdmin = false }: AuthGuardProps) {
  const { user, isLoading, isHydrating, isValidating, isSuperAdminRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthLoading = isLoading || isHydrating || isValidating;
  const [showChildren, setShowChildren] = useState(false);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.replace(`/login?redirectUrl=${encodeURIComponent(pathname)}`);
      } else if (requireSuperAdmin && !isSuperAdminRole) {
        router.replace(`/app`);
      } else {
        setShowChildren(true);
      }
    }
  }, [user, isSuperAdminRole, isAuthLoading, requireSuperAdmin, pathname, router]);

  if (!showChildren) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground animate-pulse">
          Authenticating…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
