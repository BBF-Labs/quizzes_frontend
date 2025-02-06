import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BBF Labs Quizzes',
  description: 'Elevate your quiz performance with BBF Labs quizzes',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
