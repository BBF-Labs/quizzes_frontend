"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
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

  const socket = useMemo(() => {
    return io(SOCKET_URL, {
      path: SOCKET_PATH,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      autoConnect: false,
    });
  }, []);

  useEffect(() => {
    const token = getAccessToken();

    if (token) {
      socket.auth = { token: `Bearer ${token}` };
      if (!socket.connected) {
        socket.connect();
      }
    }

    function onConnect() {
      console.log("[Socket] Connected to backend:", socket.id);
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("[Socket] Disconnected from backend");
      setIsConnected(false);
    }

    function onConnectError(err: Error) {
      console.error("[Socket] Connection error:", err.message);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useGlobalSocket() {
  return useContext(SocketContext);
}
