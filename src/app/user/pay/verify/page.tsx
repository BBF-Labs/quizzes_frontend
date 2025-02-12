"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components";
import { Suspense } from "react";

let status: string | null;

function Status() {
  const searchParams = useSearchParams();
  status = searchParams.get("status");
  return <div>..finding</div>;
}

export default function PaymentVerificationPage() {
  const getStatusContent = () => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Payment Successful",
          description:
            "Your payment has been processed successfully. Your quiz credits have been added to your account.",
          buttonText: "Go to Dashboard",
          buttonLink: "/dashboard",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500",
        };
      case "failed":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Payment Failed",
          description:
            "We were unable to process your payment. Please try again or contact support if the problem persists.",
          buttonText: "Try Again",
          buttonLink: "/payment",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500",
        };
      case "pending":
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-yellow-500" />,
          title: "Payment Pending",
          description:
            "Your payment is being processed. We'll update you once it's confirmed.",
          buttonText: "Check Status",
          buttonLink: "/profile",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500",
        };
    }
  };

  const {
    icon,
    title,
    description,
    buttonText,
    buttonLink,
    bgColor,
    borderColor,
  } = getStatusContent();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center mt-24">
      <Suspense>
        <Status />
      </Suspense>
      <div className="max-w-md w-full px-4">
        <Card className={`bg-card border-2 ${borderColor}`}>
          <CardHeader>
            <div
              className={`flex justify-center mb-4 p-4 rounded-full ${bgColor} w-fit mx-auto`}
            >
              {icon}
            </div>
            <CardTitle className="text-center text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-center text-zinc-400">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add any additional content here if needed */}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
            >
              <Link href={buttonLink}>{buttonText}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
