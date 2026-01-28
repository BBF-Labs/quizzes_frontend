"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { waitlistService } from "@/lib/services/waitlistService";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button,
  showToast,
} from "@/components";
import { MailX, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email) {
      setStatus("error");
      setMessage("Invalid unsubscribe link. Email is missing.");
      return;
    }

    const performUnsubscribe = async () => {
      try {
        await waitlistService.unsubscribe(email);
        setStatus("success");
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Something went wrong while unsubscribing.");
      }
    };

    performUnsubscribe();
  }, [email]);

  return (
    <Card className="w-full max-w-lg border-teal-500/10 shadow-2xl animate-in fade-in zoom-in duration-500">
      <CardHeader className="text-center pb-2">
        <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 ${
          status === "loading" ? "bg-muted" : 
          status === "success" ? "bg-green-100 text-green-600" : 
          "bg-red-100 text-red-600"
        }`}>
          {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-teal-600" />}
          {status === "success" && <CheckCircle className="h-10 w-10" />}
          {status === "error" && <AlertCircle className="h-10 w-10" />}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {status === "loading" ? "Processing..." : 
           status === "success" ? "Unsubscribed Successfully" : 
           "Unsubscribe Failed"}
        </CardTitle>
        <CardDescription className="text-lg">
          {status === "loading" ? `Sending request for ${email}...` : 
           status === "success" ? `We've removed ${email} from our waitlist.` : 
           message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {status === "success" && (
          <div className="bg-muted/30 p-4 rounded-lg text-sm text-center text-muted-foreground italic border border-border/50">
            "We're sorry to see you go. You will no longer receive AI updates or launch announcements from our team."
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 font-bold">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Homepage
            </Button>
          </Link>
          {status === "error" && (
             <p className="text-center text-sm text-muted-foreground">
               Need help? Contact support at <span className="text-teal-600 font-medium">admin@bflabs.tech</span>
             </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-teal-600" />}>
        <UnsubscribeContent />
      </Suspense>
      <div className="mt-12 opacity-30 pointer-events-none select-none grayscale invert">
         <h2 className="text-6xl font-black text-black tracking-tighter">BBF LABS</h2>
      </div>
    </div>
  );
}
