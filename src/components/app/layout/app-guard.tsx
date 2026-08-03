"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader } from "@/components/common/loader";

export function AppGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isHydrating, isValidating } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Determine actual loading state
  const isAuthLoading = isLoading || isHydrating || isValidating;
  const canShow = !isAuthLoading && !!user;

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.replace(`/login?redirectUrl=${encodeURIComponent(pathname)}`);
      }
    }
  }, [user, isAuthLoading, pathname, router]);

  if (!canShow) {
    return <Loader />;
  }

  return <>{children}</>;
}
