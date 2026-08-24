import type { ReactNode } from "react";
import { StudyRoomLayoutProvider } from "@/components/study-rooms";

export default function StudyRoomsPublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <StudyRoomLayoutProvider>
      {children}
    </StudyRoomLayoutProvider>
  );
}
