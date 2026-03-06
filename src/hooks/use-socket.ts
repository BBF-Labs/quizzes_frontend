"use client"
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Extract the base origin from the API URL to avoid connecting to subpaths like /api/v1
const getBaseUrl = () => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
    return url.origin;
  } catch (e) {
    return "http://localhost:5000";
  }
};

const SOCKET_URL = getBaseUrl();

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log(`[Socket] Attempting connection to ${SOCKET_URL}...`);
    const s = io(SOCKET_URL, {
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
