import type { ReactNode } from "react";
import { LandingHeader, Footer } from "@/components/landing";

export default function StudyRoomsJoinLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LandingHeader />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

