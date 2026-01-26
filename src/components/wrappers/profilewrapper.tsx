"use client";
import React, { useEffect } from "react";
import { Header, showToast } from "@/components";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context"; // Added this import

const AuthLayout = ({ children }: { children: React.ReactNode }) => {

  const returnUrl = usePathname();
  const router = useRouter();
  const { isAuthenticated, hasMultipleSessions, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
    }

    if (hasMultipleSessions) {
      logout();
      showToast("Multiple sessions detected", "error");
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [
    isAuthenticated,
    router,
    returnUrl,
    hasMultipleSessions,
    logout,
  ]);

  return <>{children}</>;
};

export default function ProfileWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout>
      <div className="min-h-screen text-foreground">
        <Header />
        <main>{children}</main>
      </div>
    </AuthLayout>
  );
}
