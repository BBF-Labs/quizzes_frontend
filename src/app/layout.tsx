import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qz - Study smarter. Know where you are. Never fall behind.",
  description: "Qz is the AI-powered study platform built around your university, your program, and your pace — powered by Z, your personal AI study partner. Developed by BetaForge Labs (bflabs.tech).",
  metadataBase: new URL("https://qz.bflabs.tech"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Qz - Study smarter. Know where you are. Never fall behind.",
    description: "Qz is the AI-powered study platform built around your university, your program, and your pace — powered by Z, your personal AI study partner.",
    url: "https://qz.bflabs.tech",
    siteName: "Qz Platform",
    images: [
      {
        url: "/students.png",
        width: 1200,
        height: 630,
        alt: "Qz Study Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qz - Study smarter. Know where you are. Never fall behind.",
    description: "AI-powered university study platform powered by Z, your personal study partner.",
    images: ["/students.png"],
    creator: "@bflabs",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
