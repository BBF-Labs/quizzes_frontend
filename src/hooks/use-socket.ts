"use client";
import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

// Use NEXT_PUBLIC_SOCKET_URL if set, otherwise extract the base origin from the API URL.
// This avoids connecting to subpaths like /api/v1 and allows explicit socket URL override.
const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  try {
    const url = new URL(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    );
    return url.origin;
  } catch (error: Error | unknown) {
    console.warn("[Socket] Invalid URL invalid.", (error as Error).message);
    return "http://localhost:5000";
  }
};

const SOCKET_URL = getSocketUrl();
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

export function useSocket() {
  // Keep a stable socket instance without triggering an extra render in effect.
  const socket = useMemo(
    () =>
      io(SOCKET_URL, {
        path: SOCKET_PATH,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        autoConnect: false,
      }),
    [],
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      console.log(`[Socket] Connected to backend: ${socket.id}`);
      setIsConnected(true);
    };

    const handleDisconnect = (reason: Socket.DisconnectReason) => {
      console.warn(`[Socket] Disconnected from backend: ${reason}`);
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("[Socket] Connection error:", error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.connect();

    return () => {
      console.log("[Socket] Cleaning up connection...");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [socket]);

  return { socket, isConnected };
}
