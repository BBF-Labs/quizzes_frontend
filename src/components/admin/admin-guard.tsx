"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader } from "@/components/common/loader";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasAdminAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !hasAdminAccess)) {
      router.replace("/login");
    }
  }, [user, isLoading, hasAdminAccess, router]);

  if (isLoading) {
    return <Loader message="Verifying admin access" />;
  }

  if (!user || !hasAdminAccess) return null;
  return <>{children}</>;
}
