import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status",
  description:
    "Live status of the Qz platform — database, cache, AI inference, and public API. Updated every 30 seconds.",
  openGraph: {
    title: "Qz Status",
    description:
      "Live status of the Qz platform — database, cache, AI inference, and public API.",
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
