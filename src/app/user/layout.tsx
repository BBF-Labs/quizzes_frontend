import { Metadata } from "next";
import { ProfileWrapper } from "@/components/wrappers";
import type React from "react";

export const metadata: Metadata = {
  title: "BBF Lab Quizzes",
  description:
    "Engage with interactive quizzes at BBF Lab to enhance your learning experience.",
  keywords: ["BBF Lab", "quizzes", "interactive learning", "education"],
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
    url: "https://quizzess.theniitettey.live",
    title: "BBF Lab Quizzes",
    description:
      "Engage with interactive quizzes at BBF Lab to enhance your learning experience.",
    images: [
      {
        url: "/api/og/dynamic?title=BBF%20Lab%20Quizzes&description=Engage%20with%20interactive%20quizzes%20at%20BBF%20Lab%20to%20enhance%20your%20learning%20experience.",
        width: 800,
        height: 600,
        alt: "BBF Lab Quizzes",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProfileWrapper>{children}</ProfileWrapper>;
}
