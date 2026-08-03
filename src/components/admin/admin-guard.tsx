"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthenticatingLoader } from "@/components/common/authenticating-loader";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasAdminAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !hasAdminAccess)) {
      router.replace("/login");
    }
  }, [user, isLoading, hasAdminAccess, router]);

  if (isLoading) {
    return <AuthenticatingLoader message="Verifying admin access" />;
  }

  if (!user || !hasAdminAccess) return null;
  return <>{children}</>;
}
