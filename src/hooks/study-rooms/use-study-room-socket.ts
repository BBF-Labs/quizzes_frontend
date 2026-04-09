"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSocket } from "@/hooks/common/use-socket";

type Handlers = {
  onPresence?: (payload: any) => void;
  onMessage?: (payload: any) => void;
  onTimer?: (payload: any) => void;
  onLocked?: (payload: any) => void;
  onEnded?: (payload: any) => void;
  onTyping?: (payload: any) => void;
};

export const useStudyRoomSocket = (roomCode?: string, handlers?: Handlers) => {
  const { socket, isConnected } = useSocket();
  const hasGlobalSocket = Boolean(socket && isConnected);
  const activeSocketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomCode) return;
    const code = roomCode.toUpperCase();
    const guestId =
      typeof window !== "undefined"
        ? localStorage.getItem("study_room_guest_id")
        : null;
    const guestName =
      typeof window !== "undefined"
        ? localStorage.getItem("study_room_guest_name")
        : null;
    const apiUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (() => {
      try {
        const url = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
        return url.origin;
      } catch {
        return "http://localhost:5000";
      }
    })();
    const path = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

    let activeSocket: Socket | null = socket;
    if (!hasGlobalSocket && guestId && guestName) {
      activeSocket = io(apiUrl, {
        path,
        transports: ["websocket", "polling"],
        auth: { guestId, guestName },
      });
    }
    if (!activeSocket) return;
    activeSocketRef.current = activeSocket;

    activeSocket.emit("join:study_room", code);

    const onPresence = (payload: any) => handlers?.onPresence?.(payload);
    const onMessage = (payload: any) => handlers?.onMessage?.(payload);
    const onTimer = (payload: any) => handlers?.onTimer?.(payload);
    const onLocked = (payload: any) => handlers?.onLocked?.(payload);
    const onEnded = (payload: any) => handlers?.onEnded?.(payload);
    const onTyping = (payload: any) => handlers?.onTyping?.(payload);

    activeSocket.on("study_room:presence", onPresence);
    activeSocket.on("study_room:chat:new", onMessage);
    activeSocket.on("study_room:timer:state", onTimer);
    activeSocket.on("study_room:locked", onLocked);
    activeSocket.on("study_room:ended", onEnded);
    activeSocket.on("study_room:typing", onTyping);

    return () => {
      activeSocket?.emit("leave:study_room", code);
      activeSocket?.off("study_room:presence", onPresence);
      activeSocket?.off("study_room:chat:new", onMessage);
      activeSocket?.off("study_room:timer:state", onTimer);
      activeSocket?.off("study_room:locked", onLocked);
      activeSocket?.off("study_room:ended", onEnded);
      activeSocket?.off("study_room:typing", onTyping);
      activeSocketRef.current = null;
      if (!hasGlobalSocket) {
        activeSocket?.disconnect();
      }
    };
  }, [socket, hasGlobalSocket, roomCode, handlers]);

  return {
    socket,
    isConnected,
    sendSocketMessage: (content: string, guestName?: string) => {
      const activeSocket = activeSocketRef.current;
      if (!activeSocket || !roomCode) return;
      activeSocket.emit("study_room:chat:send", {
        roomCode: roomCode.toUpperCase(),
        content,
        guestName,
      });
    },
    sendTimerState: (timer: Record<string, unknown>) => {
      const activeSocket = activeSocketRef.current;
      if (!activeSocket || !roomCode) return;
      activeSocket.emit("study_room:timer:update", {
        roomCode: roomCode.toUpperCase(),
        timer,
      });
    },
    emitTyping: (isTyping: boolean, displayName?: string) => {
      const activeSocket = activeSocketRef.current;
      if (!activeSocket || !roomCode) return;
      activeSocket.emit("study_room:typing", {
        roomCode: roomCode.toUpperCase(),
        isTyping,
        displayName,
      });
    },
  };
};

