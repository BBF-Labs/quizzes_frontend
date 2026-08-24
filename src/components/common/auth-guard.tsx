"use client";

import { useEffect, Suspense, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader } from "@/components/common/loader";

export interface AuthGuardProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
  unauthenticatedOnly?: boolean;
}

function AuthGuardContent({
  children,
  requireSuperAdmin = false,
  unauthenticatedOnly = false,
}: AuthGuardProps) {
  const { user, isLoading, isHydrating, isValidating, isSuperAdminRole } =
    useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAuthLoading = isLoading || isHydrating || isValidating;

  const canShow = unauthenticatedOnly
    ? !isAuthLoading && !user
    : !isAuthLoading && !!user && (!requireSuperAdmin || isSuperAdminRole);

  useEffect(() => {
    if (!isAuthLoading) {
      if (unauthenticatedOnly) {
        if (user) {
          const redirectUrl =
            searchParams.get("redirectUrl") || searchParams.get("redirect");
          const target =
            redirectUrl &&
            redirectUrl.startsWith("/") &&
            !redirectUrl.startsWith("//")
              ? redirectUrl
              : "/app";
          router.replace(target);
        }
      } else {
        if (!user) {
          router.replace(`/login?redirectUrl=${encodeURIComponent(pathname)}`);
        } else if (requireSuperAdmin && !isSuperAdminRole) {
          router.replace(`/app`);
        }
      }
    }
  }, [
    user,
    isSuperAdminRole,
    isAuthLoading,
    requireSuperAdmin,
    unauthenticatedOnly,
    pathname,
    router,
    searchParams,
  ]);

  if (!canShow) {
    return <Loader />;
  }

  return <>{children}</>;
}

export function AuthGuard(props: AuthGuardProps) {
  return (
    <Suspense fallback={<Loader />}>
      <AuthGuardContent {...props} />
    </Suspense>
  );
}
