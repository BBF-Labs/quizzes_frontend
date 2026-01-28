import { Metadata } from "next";
import type React from "react";

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: "Available Courses at BBF Lab",
  description:
    "Discover a range of interactive courses at BBF Lab designed to enhance your skills and knowledge in various subjects.",
  keywords: [
    "BBF Lab",
    "courses",
    "online courses",
    "interactive learning",
    "education",
    "skill development",
    "learning resources",
  ],
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
    url: "https://quizzes.bflabs.tech/courses",
    title: "Available Courses at BBF Lab",
    description:
      "Discover a range of interactive courses at BBF Lab designed to enhance your skills and knowledge in various subjects.",
    images: [
      {
        url: "/api/og/dynamic?title=Available%20Courses%20at%20BBF%20Lab&description=Discover%20a%20range%20of%20interactive%20courses%20at%20BBF%20Lab%20designed%20to%20enhance%20your%20skills%20and%20knowledge%20in%20various%20subjects.",
        width: 800,
        height: 600,
        alt: "Available Courses at BBF Lab",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
