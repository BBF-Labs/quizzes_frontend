import { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Community Quizzes - BBF Lab",
  description:
    "Explore and learn from quizzes shared by the BBF Lab community. Discover a wide range of topics and test your knowledge.",
  keywords: [
    "BBF Lab",
    "community quizzes",
    "shared quizzes",
    "public quizzes",
    "interactive learning",
    "education",
    "online quizzes",
  ],
  authors: [
    {
      name: "BBF Labs Team",
      url: "https://quizzess.theniitettey.live",
    },
  ],
  viewport: "width=device-width, initial-scale=1.0",
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://quizzess.theniitettey.live/community",
    title: "Community Quizzes - BBF Lab",
    description:
      "Explore and learn from quizzes shared by the BBF Lab community.",
    images: [
      {
        url: "/api/og/dynamic?title=Community%20Quizzes%20at%20BBF%20Lab&description=Explore%20and%20learn%20from%20quizzes%20shared%20by%20the%20community",
        width: 800,
        height: 600,
        alt: "Community Quizzes at BBF Lab",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
