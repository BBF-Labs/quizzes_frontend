"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "@/components/common/loader";

function VerifyActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("t") || searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    // Redirect to password reset with token
    router.replace(`/reset-password?t=${encodeURIComponent(token)}`);
  }, [token, router]);

  return <Loader message="Verifying security token..." />;
}

export default function VerifyActionPage() {
  return (
    <Suspense fallback={<Loader message="Verifying..." />}>
      <VerifyActionContent />
    </Suspense>
  );
}
