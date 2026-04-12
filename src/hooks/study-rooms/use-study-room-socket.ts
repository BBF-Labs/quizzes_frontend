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
  onTask?: (payload: any) => void;
  onCheckIn?: (payload: any) => void;
  onMilestone?: (payload: any) => void;
  onMedia?: (payload: any) => void;
  onGame?: (payload: any) => void;
  onModeration?: (payload: any) => void;
  onXp?: (payload: any) => void;
  onReady?: (payload: any) => void;
  onSharedMedia?: (payload: any) => void;
  onGameState?: (payload: any) => void;
  onMediaSync?: (payload: any) => void;
};

export const useStudyRoomSocket = (roomCode?: string, handlers?: Handlers) => {
  const { socket, isConnected } = useSocket();
  const hasGlobalSocket = Boolean(socket && isConnected);
  const activeSocketRef = useRef<Socket | null>(null);

  // Keep handlers in a ref so the socket effect never needs to re-subscribe
  // when only the callback implementations change between renders.
  const handlersRef = useRef<Handlers | undefined>(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

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
        transports: ["polling", "websocket"],
        reconnectionAttempts: 8,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 6000,
        auth: { guestId, guestName },
      });
    }
    if (!activeSocket) return;
    activeSocketRef.current = activeSocket;

    activeSocket.emit("join:study_room", code);

    // Stable wrapper functions — each delegates to the current handlersRef so
    // the socket never needs to re-register listeners when handlers change.
    const onPresence    = (p: any) => handlersRef.current?.onPresence?.(p);
    const onMessage     = (p: any) => handlersRef.current?.onMessage?.(p);
    const onTimer       = (p: any) => handlersRef.current?.onTimer?.(p);
    const onLocked      = (p: any) => handlersRef.current?.onLocked?.(p);
    const onEnded       = (p: any) => handlersRef.current?.onEnded?.(p);
    const onTyping      = (p: any) => handlersRef.current?.onTyping?.(p);
    const onTask        = (p: any) => handlersRef.current?.onTask?.(p);
    const onCheckIn     = (p: any) => handlersRef.current?.onCheckIn?.(p);
    const onMilestone   = (p: any) => handlersRef.current?.onMilestone?.(p);
    const onMedia       = (p: any) => handlersRef.current?.onMedia?.(p);
    const onGame        = (p: any) => handlersRef.current?.onGame?.(p);
    const onModeration  = (p: any) => handlersRef.current?.onModeration?.(p);
    const onXp          = (p: any) => handlersRef.current?.onXp?.(p);
    const onReady       = (p: any) => handlersRef.current?.onReady?.(p);
    const onSharedMedia = (p: any) => handlersRef.current?.onSharedMedia?.(p);
    const onGameState   = (p: any) => handlersRef.current?.onGameState?.(p);
    const onMediaSync   = (p: any) => handlersRef.current?.onMediaSync?.(p);

    activeSocket.on("study_room:presence",          onPresence);
    activeSocket.on("study_room:chat:new",           onMessage);
    activeSocket.on("study_room:timer:state",        onTimer);
    activeSocket.on("study_room:locked",             onLocked);
    activeSocket.on("study_room:ended",              onEnded);
    activeSocket.on("study_room:typing",             onTyping);
    activeSocket.on("study_room:task:new",           onTask);
    activeSocket.on("study_room:task:completed",     onTask);
    activeSocket.on("study_room:checkin:new",        onCheckIn);
    activeSocket.on("study_room:milestone",          onMilestone);
    activeSocket.on("study_room:media:new",          onMedia);
    activeSocket.on("study_room:game:started",       onGame);
    activeSocket.on("study_room:game:winner",        onGame);
    activeSocket.on("study_room:moderation",         onModeration);
    activeSocket.on("study_room:xp:changed",         onXp);
    activeSocket.on("study_room:game:ready_opened",  onReady);
    activeSocket.on("study_room:game:ready_updated", onReady);
    activeSocket.on("study_room:game:ready_closed",  onReady);
    activeSocket.on("study_room:media:shared_updated", onSharedMedia);
    activeSocket.on("study_room:game:state_updated", onGameState);
    activeSocket.on("study_room:game:reveal",        onGameState);
    activeSocket.on("study_room:media:sync",         onMediaSync);

    return () => {
      activeSocket?.emit("leave:study_room", code);
      activeSocket?.off("study_room:presence",          onPresence);
      activeSocket?.off("study_room:chat:new",           onMessage);
      activeSocket?.off("study_room:timer:state",        onTimer);
      activeSocket?.off("study_room:locked",             onLocked);
      activeSocket?.off("study_room:ended",              onEnded);
      activeSocket?.off("study_room:typing",             onTyping);
      activeSocket?.off("study_room:task:new",           onTask);
      activeSocket?.off("study_room:task:completed",     onTask);
      activeSocket?.off("study_room:checkin:new",        onCheckIn);
      activeSocket?.off("study_room:milestone",          onMilestone);
      activeSocket?.off("study_room:media:new",          onMedia);
      activeSocket?.off("study_room:game:started",       onGame);
      activeSocket?.off("study_room:game:winner",        onGame);
      activeSocket?.off("study_room:moderation",         onModeration);
      activeSocket?.off("study_room:xp:changed",         onXp);
      activeSocket?.off("study_room:game:ready_opened",  onReady);
      activeSocket?.off("study_room:game:ready_updated", onReady);
      activeSocket?.off("study_room:game:ready_closed",  onReady);
      activeSocket?.off("study_room:media:shared_updated", onSharedMedia);
      activeSocket?.off("study_room:game:state_updated", onGameState);
      activeSocket?.off("study_room:game:reveal",        onGameState);
      activeSocket?.off("study_room:media:sync",         onMediaSync);
      activeSocketRef.current = null;
      if (!hasGlobalSocket) {
        activeSocket?.disconnect();
      }
    };
  // Intentionally excludes `handlers` — handler updates go through handlersRef.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, hasGlobalSocket, roomCode]);

  return {
    socket,
    isConnected,
    // Relay a message that has already been persisted via HTTP POST.
    // The backend socket handler re-broadcasts it to all room members.
    relayMessage: (message: Record<string, unknown>) => {
      const activeSocket = activeSocketRef.current;
      if (!activeSocket || !roomCode) return;
      activeSocket.emit("study_room:chat:relay", {
        roomCode: roomCode.toUpperCase(),
        message,
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
