"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, QuizProvider } from "@/context";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components";
import type React from "react";

const queryClient = new QueryClient();

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <QuizProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            {children}
          </ThemeProvider>
        </QuizProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
