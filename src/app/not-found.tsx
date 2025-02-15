"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { LandingHeader } from "@/components";

export default function NotFound() {
  return (
    <>
      <LandingHeader />
      <div className="flex min-h-[100vh] pt-24 flex-col items-center justify-center bg-background text-center">
        <div className="container px-4 md:px-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Brain className="mx-auto h-12 w-12 animate-pulse bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent" />
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                404: Page Not Found
              </h1>
              <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl">
                Oops! The page you&apos;re looking for seems to have gone on a
                learning adventure. Let&apos;s get you back on track.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                asChild
                className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600"
              >
                <Link href="/">Return Home</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-gray-700 hover:bg-gray-800"
              >
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
