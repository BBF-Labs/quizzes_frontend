import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qz — Study Partner",
  description: "Your personal AI study partner, powered by Z.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
