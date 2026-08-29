"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/hooks/common/use-socket";

interface TimetableSocketHandlers {
  onSynced?: (payload: { studentId: string; count?: number }) => void;
}

export function useTimetableSocket(
  studentId?: string,
  handlers?: TimetableSocketHandlers,
) {
  const { socket, isConnected } = useSocket();
  const handlersRef = useRef<TimetableSocketHandlers | undefined>(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  const cleanStudentId = studentId?.trim().replace(/\D/g, "");

  useEffect(() => {
    if (!socket || !cleanStudentId) return;

    const joinRoom = () => {
      socket.emit("join:timetable_sync", cleanStudentId);
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    const handleSynced = (payload: any) => {
      const incomingId = String(payload?.studentId || "")
        .trim()
        .replace(/\D/g, "");
      if (!incomingId || incomingId === cleanStudentId) {
        handlersRef.current?.onSynced?.(payload);
      }
    };

    socket.on("timetable:synced", handleSynced);

    return () => {
      socket.emit("leave:timetable_sync", cleanStudentId);
      socket.off("connect", joinRoom);
      socket.off("timetable:synced", handleSynced);
    };
  }, [socket, isConnected, cleanStudentId]);

  return {
    socket,
    isConnected,
  };
}
