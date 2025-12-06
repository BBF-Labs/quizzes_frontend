import type React from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import Image from "next/image";
import { logo } from "@/assets";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
}

export function AuthCard({ children, className, ...props }: AuthCardProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-500 overflow-hidden">
        {/* Back button - Desktop */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-8 left-8 z-20"
        >
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </motion.div>

        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-4 h-4 bg-white/30 rounded-full" />
        <div className="absolute top-32 right-32 w-2 h-2 bg-white/20 rounded-full" />
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-white/25 rounded-full" />
        <div className="absolute bottom-20 left-40 w-2 h-2 bg-white/15 rounded-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link href="/">
              <Image
                src={logo}
                alt="BBF Labs"
                width={120}
                height={120}
                className="mx-auto mb-8"
              />
            </Link>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Master Your Learning Journey
            </h2>
            <p className="text-white/80 text-lg max-w-md mx-auto mb-8">
              Join thousands of students improving their grades with our
              lecture-specific quizzes and assessments.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50k+</div>
                <div className="text-white/70 text-sm">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1000+</div>
                <div className="text-white/70 text-sm">Quizzes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-white/70 text-sm">Success Rate</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Wave decoration at bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="rgba(255,255,255,0.1)"
          />
        </svg>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-background p-4 md:p-8 relative">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid pointer-events-none" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

        {/* Mobile header with logo and back button */}
        <div className="lg:hidden mb-8 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          <Link href="/">
            <Image src={logo} alt="BBF Labs" width={80} height={80} />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "w-full max-w-[420px] space-y-6 rounded-2xl bg-card border border-border p-8 shadow-xl dark:shadow-none relative z-10",
            className
          )}
          {...props}
        >
          {children}
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-sm text-muted-foreground text-center relative z-10">
          © 2025 BBF Labs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
