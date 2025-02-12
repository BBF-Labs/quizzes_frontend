
"use client"; // Ensures this file is a client component

import { Provider } from "react-redux";
import { store } from "@/store";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class">
        <div className="min-h-screen bg-gradient-to-br from-bbf-yellow/10 to-bbf-green/10 dark:from-bbf-purple/10 dark:to-gray-900">
          {children}
          <Toaster />
        </div>
      </ThemeProvider>
    </Provider>
  );
}
