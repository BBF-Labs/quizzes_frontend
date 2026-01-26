"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyPayment } from "@/controllers";


type PaymentStatus = "pending" | "success" | "failed";

interface StatusContent {
  icon: React.JSX.Element;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor: string;
  borderColor: string;
}

const STATUS_CONTENTS: Record<PaymentStatus, StatusContent> = {
  success: {
    icon: <CheckCircle className="h-16 w-16 text-green-500" />,
    title: "Payment Successful",
    description: "Your payment has been processed successfully.",
    buttonText: "Go to Quizzes",
    buttonLink: "/quizzes",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500",
  },
  failed: {
    icon: <XCircle className="h-16 w-16 text-red-500" />,
    title: "Payment Failed",
    description:
      "We were unable to process your payment. Please try again or contact support if the problem persists.",
    buttonText: "Try Again",
    buttonLink: "/user/pay",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500",
  },
  pending: {
    icon: <AlertCircle className="h-16 w-16 text-yellow-500" />,
    title: "Payment Pending",
    description:
      "Your payment is being processed. We'll update you once it's confirmed.",
    buttonText: "Check Status",
    buttonLink: "/user/profile",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500",
  },
};

const LoadingCard = () => (
  <div className="min-h-screen bg-background text-foreground flex items-center justify-center mt-24">
    <div className="max-w-md w-full px-4">
      <div className="flex items-center justify-center py-8">
        <Loader className="animate-spin h-8 w-8 text-teal-500" />
        <span className="ml-2 text-lg text-zinc-400">
          Loading payment status...
        </span>
      </div>
    </div>
  </div>
);

import { useAuth } from "@/context";

function PaymentVerificationContent() {
  const { credentials, login } = useAuth(); // We might need to update user context
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async (): Promise<PaymentStatus> => {
      if (!credentials?.accessToken) {
        setError("Authentication required");
        return "pending";
      }

      try {
        let result = await verifyPayment(credentials.accessToken);

        if (result.isValid) {
          setError(null);
           // If we want to refresh user credits immediately in UI:
           // We might need a force refresh of user profile here if the context doesn't auto-refresh.
           // For now, let's assume valid payment means we can show success.
          return (result = "success" as PaymentStatus);
        }
        if (!mounted) return "pending";

        setError(null);
        return result.transaction.status as unknown as PaymentStatus;
      } catch (error: unknown) {
        if (!mounted) return "pending";

        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unknown error occurred during payment verification";

        console.error("Payment verification failed:", errorMessage);
        setError(errorMessage);
        return "pending";
      }
    };

    const updateStatus = async () => {
      const urlStatus = searchParams.get("status");

      if (urlStatus && urlStatus in STATUS_CONTENTS) {
        setStatus(urlStatus as PaymentStatus);
        setIsLoading(false);
        return;
      }

      const fetchedStatus = await fetchStatus();
      if (mounted) {
        setStatus(fetchedStatus);
        setIsLoading(false);
      }
    };

    updateStatus();
    return () => {
      mounted = false;
    };
  }, [searchParams, credentials.accessToken]);

  if (isLoading) {
    return <LoadingCard />;
  }

  const statusContent = STATUS_CONTENTS[status];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center mt-24">
      <div className="max-w-md w-full px-4">
        <Card className={`bg-card border-2 ${statusContent.borderColor}`}>
          <CardHeader>
            <div
              className={`flex justify-center mb-4 p-4 rounded-full ${statusContent.bgColor} w-fit mx-auto`}
            >
              {statusContent.icon}
            </div>
            <CardTitle className="text-center text-foreground">
              {statusContent.title}
            </CardTitle>
            <CardDescription className="text-center text-zinc-400">
              {statusContent.description}
            </CardDescription>
            {error && (
              <CardDescription className="text-center text-red-500 mt-2">
                Error: {error}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent />
          <CardFooter className="flex justify-center">
            <Button
              asChild
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Link href={statusContent.buttonLink}>
                {statusContent.buttonText}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentVerificationPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <PaymentVerificationContent />
    </Suspense>
  );
}
