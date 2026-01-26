import { Metadata } from "next";
import type React from "react";

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: "Pricing at BBF Labs",
  description:
    "Explore a variety of affordable and curated packages at BBF Lab, designed to cater to everyone's learning needs and enhance your educational journey.",
  keywords: [
    "BBF Lab",
    "packages",
    "affordable learning",
    "curated packages",
    "education",
    "learning resources",
    "skill development",
  ],
  authors: [
    {
      name: "BBF Labs Team",
      url: "https://quizzess.theniitettey.live",
    },
    {
      name: "Michael Perry Nii Tettey",
      url: "https://theniitettey.live",
    },
  ],
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://quizzess.theniitettey.live/packages",
    title: "Pricing at BBF Labs",
    description:
      "Explore a variety of affordable and curated packages at BBF Lab, designed to cater to everyone's learning needs and enhance your educational journey.",
    images: [
      {
        url: "/api/og/dynamic?title=Pricing%20at%20BBF%20Labs&description=Explore%20a%20variety%20of%20affordable%20and%20curated%20packages%20at%20BBF%20Lab%2C%20designed%20to%20cater%20to%20everyone%27s%20learning%20needs%20and%20enhance%20your%20educational%20journey.",
        width: 800,
        height: 600,
        alt: "Pricing at BBF Labs",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
