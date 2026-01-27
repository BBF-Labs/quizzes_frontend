import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { AuthWrapper } from "@/components/wrappers";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://quizzes.bflabs.tech"),
  title: "BBF Lab Quizzes",
  description:
    "Engage with interactive quizzes at BBF Lab to enhance your learning experience.",
  keywords: ["BBF Lab", "quizzes", "interactive learning", "education"],
  authors: [
    {
      name: "BBF Labs Team",
      url: "https://quizzes.bflabs.tech",
    },
    {
      name: "Michael Perry Nii Tettey",
      url: "https://okponglozuck.bflabs.tech",
    },
  ],
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://quizzes.bflabs.tech",
    title: "BBF Lab Quizzes",
    description:
      "Engage with interactive quizzes at BBF Lab to enhance your learning experience.",
    images: [
      {
        url: "/api/og",
        width: 800,
        height: 600,
        alt: "BBF Lab Quizzes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@BBFLabs",
    creator: "@MichaelPerry",
    title: "BBF Lab Quizzes",
    description:
      "Engage with interactive quizzes at BBF Lab to enhance your learning experience.",
    images: [
      {
        url: "/api/og",
        alt: "BBF Lab Quizzes",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthWrapper>
          {children}
          <Analytics />
        </AuthWrapper>
      </body>
    </html>
  );
}
