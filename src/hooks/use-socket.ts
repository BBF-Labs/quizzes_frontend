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

import { useGlobalSocket } from "@/contexts/socket-context";

export function useSocket() {
  return useGlobalSocket();
}
