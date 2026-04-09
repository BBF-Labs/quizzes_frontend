"use client";

import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { Navbar } from "@/components/common";
import { Footer } from "@/components/landing";
import { cn } from "@/lib/utils";

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
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {!isImmersive && <Navbar />}
        <main className={cn("flex-1", !isImmersive && "pt-16")}>{children}</main>
        {!isImmersive && <Footer />}
      </div>
    </StudyRoomLayoutContext.Provider>
  );
}
