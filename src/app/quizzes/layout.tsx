import type { ReactNode } from "react";
import { constructMetadata } from "@/lib/metadata";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";

export const metadata = constructMetadata({
  title: "Official Quizzes — Qz Public Library",
  description:
    "Curated and reviewed by the Qz team. Test what you know with quizzes built from real university lecture material.",
});

export default function QuizzesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FC] text-slate-900 antialiased">
      <LandingHeader />
      <main className="flex-1 pt-20">{children}</main>
      <LandingFooter />
      <MobileNav />
    </div>
  );
}
