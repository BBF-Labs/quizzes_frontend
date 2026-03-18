"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type {
  ConnectionType,
  ZSession,
  ZSessionMessage,
  ZSessionMessageType,
} from "@/types/session";

const MAX_ERRORS_BEFORE_POLLING = 3;
const POLLING_INTERVAL_MS = 3000;

function makeId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);
}

function makeMessage(
  type: ZSessionMessageType,
  content: string,
): ZSessionMessage {
  return { id: makeId(), type, content, timestamp: new Date().toISOString() };
}

export function useSessionStream(
  sessionId: string,
  onSessionUpdate?: (data: ZSession) => void,
) {
  const [messages, setMessages] = useState<ZSessionMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingBuffer, setThinkingBuffer] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] =
    useState<ConnectionType>("disconnected");

  // Use refs so event-handlers always see latest values without re-registration
  const thinkingBufferRef = useRef("");
  const errorCountRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const onSessionUpdateRef = useRef(onSessionUpdate);
  useEffect(() => {
    onSessionUpdateRef.current = onSessionUpdate;
  });

  const appendMessage = useCallback((msg: ZSessionMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    setConnectionType("polling");
    setIsConnected(true);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await api.get<{ data: ZSession } | ZSession>(
          `/sessions/${sessionId}`,
        );
        const sessionData =
          res.data && "data" in res.data
            ? (res.data as { data: ZSession }).data
            : (res.data as ZSession);
        onSessionUpdateRef.current?.(sessionData);
        errorCountRef.current = 0;
      } catch {
        // polling errors are silent — keep retrying
      }
    }, POLLING_INTERVAL_MS);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

    const url = `${apiBase}/sessions/${sessionId}/stream`;
    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      setConnectionType("sse");
      errorCountRef.current = 0;
    };

    // --- thinking_chunk ---
    es.addEventListener("thinking_chunk", (e: MessageEvent) => {
      const chunk: string =
        typeof e.data === "string" ? e.data : JSON.stringify(e.data);
      thinkingBufferRef.current += chunk;
      setThinkingBuffer(thinkingBufferRef.current);
      setIsThinking(true);
    });

    // --- thinking_done ---
    es.addEventListener("thinking_done", () => {
      appendMessage(makeMessage("thinking", thinkingBufferRef.current));
      thinkingBufferRef.current = "";
      setThinkingBuffer("");
      setIsThinking(false);
    });

    // --- directive ---
    es.addEventListener("directive", (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        appendMessage(
          makeMessage("directive", parsed.content ?? JSON.stringify(parsed)),
        );
      } catch {
        appendMessage(makeMessage("directive", e.data));
      }
    });

    // --- message ---
    es.addEventListener("message", (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        appendMessage(
          makeMessage("message", parsed.content ?? JSON.stringify(parsed)),
        );
      } catch {
        appendMessage(makeMessage("message", e.data));
      }
    });

    // --- session_update ---
    es.addEventListener("session_update", (e: MessageEvent) => {
      try {
        const parsed: ZSession = JSON.parse(e.data);
        onSessionUpdateRef.current?.(parsed);
      } catch {
        // ignore malformed session_update payloads
      }
    });

    // --- error ---
    es.onerror = () => {
      errorCountRef.current += 1;
      setIsConnected(false);

      if (errorCountRef.current >= MAX_ERRORS_BEFORE_POLLING) {
        es.close();
        eventSourceRef.current = null;
        startPolling();
      }
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setIsConnected(false);
      setConnectionType("disconnected");
    };
  }, [sessionId, appendMessage, startPolling]);

  return { messages, isThinking, thinkingBuffer, isConnected, connectionType };
}
