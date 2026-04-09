import type { ReactNode } from "react";
import { StudyRoomLayoutProvider } from "./study-room-layout-provider";

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

