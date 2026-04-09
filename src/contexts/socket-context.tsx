"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/session";

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  try {
    const url = new URL(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    );
    return url.origin;
  } catch (error) {
    return "http://localhost:5000";
  }
};

const SOCKET_URL = getSocketUrl();
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        path: SOCKET_PATH,
        transports: ["polling", "websocket"],
        reconnectionAttempts: 12,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 8000,
        autoConnect: false,
      });
      setSocket(socketRef.current);
    }

    const s = socketRef.current;
    if (!s) return;

    const token = getAccessToken();

    if (token) {
      // Cast to bypass the compiler's strict immutability check for this external library property
      (s as unknown as { auth: { token: string } }).auth = {
        token: `Bearer ${token}`,
      };
      if (!s.connected) {
        s.connect();
      }
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onConnectError(err: Error) {
      console.error("[Socket] Connection error:", err.message);
    }

    function onReconnectAttempt(attempt: number) {
      console.warn(`[Socket] Reconnect attempt ${attempt}`);
    }

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);
    s.io.on("reconnect_attempt", onReconnectAttempt);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onConnectError);
      s.io.off("reconnect_attempt", onReconnectAttempt);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useGlobalSocket() {
  return useContext(SocketContext);
}
