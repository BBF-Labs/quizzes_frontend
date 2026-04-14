"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { SocketProvider } from "@/contexts/socket-context";
import { UiCustomizationFab } from "@/components/app/layout";
import { applyUiPreferences, loadUiPreferences } from "@/lib/ui-preferences";
import { CookieConsent } from "@/components/common/cookie-consent";
import { PwaThemeColor } from "@/components/common/pwa-theme-color";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    const preferences = loadUiPreferences();
    applyUiPreferences(preferences);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <PwaThemeColor />
        <AuthProvider>
          <SocketProvider>
            {children}
            <UiCustomizationFab />
            <Toaster />
            <CookieConsent />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
