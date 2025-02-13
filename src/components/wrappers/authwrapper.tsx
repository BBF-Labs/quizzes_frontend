"use client";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components";
import { Provider } from "react-redux";
import { store } from "@/lib";
import type React from "react";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
