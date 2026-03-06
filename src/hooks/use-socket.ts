"use client"
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Use NEXT_PUBLIC_SOCKET_URL if set, otherwise extract the base origin from the API URL.
// This avoids connecting to subpaths like /api/v1 and allows explicit socket URL override.
const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  try {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
    return url.origin;
  } catch (e) {
    return "http://localhost:5000";
  }
};

const SOCKET_URL = getSocketUrl();
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log(`[Socket] Attempting connection to ${SOCKET_URL} (path: ${SOCKET_PATH})...`);
    const s = io(SOCKET_URL, {
      path: SOCKET_PATH,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    setSocket(s);

    s.on("connect", () => {
      console.log(`[Socket] Connected to backend: ${s.id}`);
      setIsConnected(true);
    });

    s.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected from backend. Reason: ${reason}`);
      setIsConnected(false);
    });

    s.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);
    });

    return () => {
      console.log("[Socket] Cleaning up connection...");
      s.disconnect();
    };
  }, []);

  return { socket, isConnected };
}
