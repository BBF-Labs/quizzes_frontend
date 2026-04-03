import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import { Providers } from "@/components/common";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ServiceWorkerRegistration } from "@/components/common";

export const viewport: Viewport = {
  themeColor: "#006eff",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

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
        url: "/api/og",
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
    images: ["/api/og"],
    creator: "@bflabs",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
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
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning
      data-ui-customized="true"
    >
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
        <ServiceWorkerRegistration />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
