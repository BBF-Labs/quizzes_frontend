import type { ReactNode } from "react";
import { Navbar } from "@/components/common";
import { Footer } from "@/components/landing";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Public Library - Study Materials & Notes",
  description: "Browse curated lecture notes, past questions, and study materials from universities across Ghana.",
});

export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
