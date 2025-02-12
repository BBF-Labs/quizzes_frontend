import type React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AuthCard({ children, className, ...props }: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <div
        className={cn(
          "w-full max-w-[400px] space-y-8 rounded-2xl bg-zinc-900/50 p-8 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
