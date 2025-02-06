import type { Metadata } from "next"
import { Provider } from "react-redux"
import { store } from "../store"
import { ThemeProvider } from "next-themes"
import Navigation from "@/components/Navigation"
import { Toaster } from "react-hot-toast"
import type { AppProps } from "next/app"

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
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class">
        <div className="min-h-screen bg-gradient-to-br from-bbf-yellow/10 to-bbf-green/10 dark:from-bbf-purple/10 dark:to-gray-900">
          <Navigation />
          <Component {...pageProps} />
          <Toaster />
        </div>
      </ThemeProvider>
    </Provider>
  )
}

