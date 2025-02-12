
import type { Metadata } from 'next';
import './globals.css';
import Providers from './components/Providers';

export const metadata: Metadata = {
  title: "BBF Labs Quiz - Interactive Learning Platform",
  description:
    "Enhance your knowledge with BBF Labs Quiz. Take interactive quizzes, track your progress, and compete with others.",
  openGraph: {
    title: "BBF Labs Quiz - Interactive Learning Platform",
    description:
      "Enhance your knowledge with BBF Labs Quiz. Take interactive quizzes, track your progress, and compete with others.",
    images: [
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?type=home&title=BBF Labs Quiz&description=Interactive Learning Platform`,
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers> 
          {children}
        </Providers>
      </body>
    </html>
  );
}
