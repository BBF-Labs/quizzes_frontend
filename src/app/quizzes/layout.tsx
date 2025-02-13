import { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Available Quizzes at BBF Lab",
  description:
    "Explore a variety of interactive quizzes at BBF Lab designed to enhance your learning experience and test your knowledge.",
  keywords: [
    "BBF Lab",
    "quizzes",
    "interactive learning",
    "education",
    "test your knowledge",
    "learning tools",
    "online quizzes",
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
  viewport: "width=device-width, initial-scale=1.0",
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://quizzess.theniitettey.live/quizzes",
    title: "Available Quizzes at BBF Lab",
    description:
      "Explore a variety of interactive quizzes at BBF Lab designed to enhance your learning experience and test your knowledge.",
    images: [
      {
        url: "/api/og/dynamic?title=Available%20Quizzes%20at%20BBF%20Lab&description=Explore%20a%20variety%20of%20interactive%20quizzes%20at%20BBF%20Lab%20designed%20to%20enhance%20your%20learning%20experience%20and%20test%20your%20knowledge",
        width: 800,
        height: 600,
        alt: "Available Quizzes at BBF Lab",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
