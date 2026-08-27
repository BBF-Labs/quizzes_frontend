"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "@/components/common/loader";

function RedirectToPublicCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    const destination = params ? `/checkout?${params}` : "/checkout";
    router.replace(destination);
  }, [router, searchParams]);

  return <Loader message="Redirecting to checkout..." />;
}

export default function LegacyCheckoutPage() {
  return (
    <Suspense fallback={<Loader message="Redirecting..." />}>
      <RedirectToPublicCheckout />
    </Suspense>
  );
}
