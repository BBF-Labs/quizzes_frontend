"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthenticatingLoader } from "@/components/common/authenticating-loader";

interface AuthGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export function AuthGuard({ children, requireSuperAdmin = false }: AuthGuardProps) {
  const { user, isLoading, isHydrating, isValidating, isSuperAdminRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthLoading = isLoading || isHydrating || isValidating;
  const canShow = !isAuthLoading && !!user && (!requireSuperAdmin || isSuperAdminRole);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.replace(`/login?redirectUrl=${encodeURIComponent(pathname)}`);
      } else if (requireSuperAdmin && !isSuperAdminRole) {
        router.replace(`/app`);
      }
    }
  }, [user, isSuperAdminRole, isAuthLoading, requireSuperAdmin, pathname, router]);

  if (!canShow) {
    return <AuthenticatingLoader />;
  }

  return <>{children}</>;
}
