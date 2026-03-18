import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getAccessToken } from "@/lib/session";
import type {
  ZSession,
  ZSessionMessage,
  ConnectionType,
} from "@/types/session";

interface UseSessionStreamOptions {
  onSessionUpdate?: (session: ZSession) => void;
  onConnectionChange?: (connected: boolean, type: ConnectionType) => void;
}

/**
 * Hook to stream study session messages via SSE and maintain real-time state.
 * Manages SSE connection lifecycle, message buffering, and connection recovery.
 *
 * @param sessionId - The ID of the session to stream
 * @param onSessionUpdate - Callback fired when session state updates
 * @param enabled - Whether the stream should be enabled (default: true)
 * @param options - Additional configuration options
 */
export const useSessionStream = (
  sessionId: string,
  onSessionUpdate?: (session: ZSession) => void,
  enabled = true,
  options?: UseSessionStreamOptions,
) => {
  const [messages, setMessages] = useState<ZSessionMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingBuffer, setThinkingBuffer] = useState("");
  const [isConnected, setIsConnected] = useState(enabled);
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    enabled ? "sse" : "disconnected",
  );

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<ZSessionMessage[]>([]);
  const connectRef = useRef<(() => void) | null>(null);
  const retryCountRef = useRef(0);
  const maxRetriesRef = useRef(5);

  // Establish SSE connection
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return;
    }

    try {
      const token = getAccessToken();
      const url = token
        ? `${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/stream?token=${encodeURIComponent(token)}`
        : `${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/stream`;

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("open", () => {
        retryCountRef.current = 0; // Reset retry counter on successful connection
        setIsConnected(true);
        setConnectionType("sse");
        options?.onConnectionChange?.(true, "sse");
      });

      // Handle message events
      // Backend sends SSE signals: { type, payload, timestamp }
      eventSource.addEventListener("message", (event) => {
        try {
          const signal = JSON.parse(event.data);

          switch (signal.type) {
            // Streaming signals from AI response
            case "thinking_chunk":
              if (signal.payload?.text) {
                setIsThinking(true);
                setThinkingBuffer((prev) => prev + signal.payload.text);
              }
              break;

            case "thinking_done":
              setIsThinking(false);
              setThinkingBuffer("");
              break;

            case "text_chunk":
              if (signal.payload?.text) {
                setThinkingBuffer(""); // Clear thinking when text arrives
                const text = signal.payload.text;
                // Append to last message if it's a text chunk continuation
                setMessages((prev) => {
                  const msgs = [...prev];
                  const lastMsg = msgs[msgs.length - 1];
                  if (
                    lastMsg &&
                    lastMsg.type === "text" &&
                    lastMsg.messageId === signal.payload?.messageId
                  ) {
                    // Continue appending to existing message
                    msgs[msgs.length - 1] = {
                      ...lastMsg,
                      content: lastMsg.content + text,
                    };
                  } else if (!lastMsg || lastMsg.type !== "text") {
                    // Start new message
                    const newMsg: ZSessionMessage = {
                      id: uuidv4(),
                      messageId: signal.payload?.messageId || uuidv4(),
                      role: "z",
                      type: "text",
                      content: text,
                      timestamp: signal.timestamp || new Date().toISOString(),
                    };
                    msgs.push(newMsg);
                  }
                  return msgs;
                });
              }
              break;

            case "text_done":
              // Message streaming complete
              break;

            case "error":
              console.error(
                "Session stream error:",
                signal.payload?.error || signal,
              );
              break;
          }
        } catch (err) {
          console.error("Failed to parse stream message:", err);
        }
      });

      eventSource.addEventListener("error", () => {
        eventSource.close();
        eventSourceRef.current = null;
        setIsConnected(false);
        setConnectionType("disconnected");
        options?.onConnectionChange?.(false, "disconnected");

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        if (retryCountRef.current < maxRetriesRef.current) {
          const delayMs = Math.min(
            1000 * Math.pow(2, retryCountRef.current),
            16000,
          );
          retryCountRef.current++;
          console.warn(
            `SSE connection failed. Retrying in ${delayMs}ms (attempt ${retryCountRef.current}/${maxRetriesRef.current})`,
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            if (connectRef.current) connectRef.current();
          }, delayMs);
        } else {
          console.error(
            "SSE connection failed after max retries. Session may be offline.",
          );
        }
      });
    } catch (err) {
      console.error("Failed to establish SSE connection:", err);
      setIsConnected(false);

      if (retryCountRef.current < maxRetriesRef.current) {
        const delayMs = Math.min(
          1000 * Math.pow(2, retryCountRef.current),
          16000,
        );
        retryCountRef.current++;
        reconnectTimeoutRef.current = setTimeout(() => {
          if (connectRef.current) connectRef.current();
        }, delayMs);
      }
    }
  }, [sessionId, onSessionUpdate, options]);

  // Store connect function in ref to avoid circular dependency
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Clean up SSE connection
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    retryCountRef.current = 0; // Reset retry counter on disconnect
    setIsConnected(false);
    setConnectionType("disconnected");
  }, []);

  // Establish connection on mount
  useEffect(() => {
    if (sessionId && enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [sessionId, enabled, connect, disconnect]);

  return {
    messages,
    isThinking,
    thinkingBuffer,
    isConnected,
    connectionType,
  };
};
