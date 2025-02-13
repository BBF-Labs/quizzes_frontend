"use client";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/lib";
//import { Metadata } from "next";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "BBF Lab Quizzes",
//   description: "Engage with interactive quizzes at BBF Lab to enhance your learning experience.",
//   keywords: ["BBF Lab", "quizzes", "interactive learning", "education"],
//   authors: [{
//     name: "BBF Labs Team",
//     url: "https://quizzess.theniitettey.live",
//   }, {
//     name: "Michael Perry Nii Tettey",
//     url: "https://theniitettey.live",
//   }],
//   viewport: "width=device-width, initial-scale=1.0",
//   robots: "index, follow"
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
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
      </body>
    </html>
  );
}
