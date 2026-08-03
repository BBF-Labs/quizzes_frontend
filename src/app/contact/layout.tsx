import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the BetaForge Labs team behind Qz — support, bug reports, press and partnerships. Real humans, fast replies.",
  openGraph: {
    title: "Contact Qz",
    description:
      "Reach the BetaForge Labs team behind Qz — support, bug reports, press and partnerships.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}