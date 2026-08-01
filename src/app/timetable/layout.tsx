import type { ReactNode } from "react";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Exam Timetable — Find Your Paper & Venue",
  description: "Search the University of Ghana exam timetable by course code or title. Free, no account needed.",
});

export default function TimetableLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
