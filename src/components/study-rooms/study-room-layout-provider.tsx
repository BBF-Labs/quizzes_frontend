"use client";

import { createContext, useContext, useState, type ReactNode, useEffect } from "react";

interface StudyRoomLayoutContextType {
  isImmersive: boolean;
  setIsImmersive: (val: boolean) => void;
}

const StudyRoomLayoutContext = createContext<StudyRoomLayoutContextType | undefined>(undefined);

export function useStudyRoomLayout() {
  const context = useContext(StudyRoomLayoutContext);
  if (!context) throw new Error("useStudyRoomLayout must be used within a StudyRoomLayoutProvider");
  return context;
}

export function StudyRoomLayoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isImmersive, setIsImmersive] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("study_room_immersive") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("study_room_immersive", String(isImmersive));
  }, [isImmersive]);

  return (
    <StudyRoomLayoutContext.Provider value={{ isImmersive, setIsImmersive }}>
      <div className="min-h-screen bg-[#F7F9FC] text-slate-900 flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </StudyRoomLayoutContext.Provider>
  );
}
