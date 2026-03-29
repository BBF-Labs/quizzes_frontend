import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getAccessToken } from "@/lib/session";
import type {
  ZApp,
  ZAppMessage,
  ZAppMessageType,
  ConnectionType,
} from "@/types/session";

interface UseAppStreamOptions {
  onAppUpdate?: (app: ZApp) => void;
  onConnectionChange?: (connected: boolean, type: ConnectionType) => void;
}

interface StreamSignal {
  sessionId: string;
  type: "text_chunk" | "error" | string;
  timestamp?: string;
  payload?: {
    messageId?: string;
    text?: string;
    chunk?: string;
    error?: string;
    [key: string]: unknown;
  };
}

export const useAppStream = (
  sessionId: string,
  initialMessages: ZAppMessage[] = [],
  enabled = true,
  options?: UseAppStreamOptions,
) => {
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [messages, setMessages] = useState<ZAppMessage[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    enabled ? "polling" : "disconnected",
  );

  const lastSyncedRef = useRef<string>("");

  useEffect(() => {
    if (initialMessages.length === 0) return;

    const syncKey = initialMessages
      .map((m) => `${m.id}-${m.content?.length || 0}`)
      .join("|");

    if (syncKey === lastSyncedRef.current) return;
    lastSyncedRef.current = syncKey;

    setMessages((prev) => {
      const next = [...prev];
      let changed = false;

      initialMessages.forEach((im) => {
        // More robust matching: try ID, then messageId
        const existingIdx = next.findIndex((m) => {
          if (m.id === im.id) return true;
          if (im.messageId && m.messageId === im.messageId) return true;
          return false;
        });

        if (existingIdx >= 0) {
          const m = next[existingIdx];

          // Guard: don't overwrite if message is currently streaming
          const isStreaming =
            streamingMessageIds.current.has(m.id) ||
            streamingMessageIds.current.has(m.messageId) ||
            !!streamingBufferRef.current[m.id] ||
            (m.messageId && !!streamingBufferRef.current[m.messageId]);

          if (!isStreaming) {
            // Update metadata (like server ID) but keep local content if it matches
            if (m.id !== im.id || m.content !== im.content) {
              next[existingIdx] = { ...m, ...im };
              changed = true;
            }
          }
        } else {
          // New message from server, but check if we already have it by content + role if ID fails
          const contentMatch = next.find(
            (m) => m.role === im.role && m.content === im.content,
          );
          if (!contentMatch) {
            next.push(im);
            changed = true;
          } else if (!contentMatch.messageId && im.messageId) {
            // Update local optimistic message with server's messageId
            const idx = next.indexOf(contentMatch);
            next[idx] = { ...contentMatch, ...im };
            changed = true;
          }
        }
      });

      if (changed) {
        return next.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
      }
      return prev;
    });
  }, [initialMessages]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<(() => void) | null>(null);
  const retryCountRef = useRef(0);
  const maxRetriesRef = useRef(5);

  const streamingBufferRef = useRef<Record<string, string>>({});
  const streamingMessageIds = useRef<Set<string>>(new Set());
  const lastTickRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return;
    }

    try {
      const token = getAccessToken();
      const url = token
        ? `${process.env.NEXT_PUBLIC_API_URL}/app/${sessionId}/stream?token=${encodeURIComponent(token)}`
        : `${process.env.NEXT_PUBLIC_API_URL}/app/${sessionId}/stream`;

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("open", () => {
        retryCountRef.current = 0;
        setIsConnected(true);
        setConnectionType("sse");
        options?.onConnectionChange?.(true, "sse");
      });

      eventSource.addEventListener("message", (event) => {
        try {
          const signal: StreamSignal = JSON.parse(event.data);
          console.log("[useAppStream] Raw Signal:", signal);
          if (signal.sessionId !== sessionId) return;

          console.log(
            "[useAppStream] Signal received:",
            signal.type,
            signal.payload?.messageId,
          );
          switch (signal.type) {
            case "text_chunk":
              if (
                signal.payload?.text !== undefined ||
                signal.payload?.chunk !== undefined
              ) {
                const text =
                  signal.payload?.text ?? signal.payload?.chunk ?? "";
                const msgId = signal.payload?.messageId;

                setMessages((prev) => {
                  const msgs = [...prev];
                  const existingIdx = msgId
                    ? msgs.findIndex((m) => m.messageId === msgId)
                    : -1;

                  if (existingIdx >= 0) {
                    const streamKey =
                      msgId ||
                      msgs[existingIdx].messageId ||
                      msgs[existingIdx].id;
                    const currentBuffer =
                      streamingBufferRef.current[streamKey] || "";
                    streamingBufferRef.current[streamKey] =
                      currentBuffer + text;
                    streamingMessageIds.current.add(streamKey);
                    // Ensure the message is marked as streaming
                    msgs[existingIdx] = {
                      ...msgs[existingIdx],
                      isStreaming: true,
                    };
                  } else {
                     const stableId = msgId || uuidv4();
 
                     streamingMessageIds.current.add(stableId);
                     const newMsg: ZAppMessage = {
                       id: stableId,
                       messageId: stableId,
                       role: "z",
                       type: "text" as ZAppMessageType,
                       content: "",
                       timestamp: signal.timestamp || new Date().toISOString(),
                       isStreaming: true,
                     };
                    if (isMountedRef.current) {
                      msgs.push(newMsg);
                    }
                    streamingBufferRef.current[stableId] = text;
                  }
                  return msgs;
                });
              }
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
      });
    } catch (err) {
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
  }, [sessionId, options]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    retryCountRef.current = 0;
    setIsConnected(false);
    setConnectionType("disconnected");
  }, []);

  useEffect(() => {
    if (sessionId && enabled) {
      // Small deferred execution to ensure state updates don't cascade into renders
      const timer = setTimeout(() => connect(), 0);
      return () => {
        clearTimeout(timer);
        disconnect();
      };
    }
  }, [sessionId, enabled, connect, disconnect]);

  useEffect(() => {
    let animationFrame: number;

    const tick = (time: number) => {
      if (time - lastTickRef.current > 25) {
        lastTickRef.current = time;

        const bufferKeys = Object.keys(streamingBufferRef.current);
        if (bufferKeys.length > 0) {
          setMessages((prev) => {
            let changed = false;
            const next = [...prev];

            for (const id of bufferKeys) {
              const buffer = streamingBufferRef.current[id];
              if (!buffer) continue;

              const idx = next.findIndex((m) => m.id === id);
              if (idx >= 0) {
                let releaseCount = 2; // Increased base release
                if (buffer.length > 200) releaseCount = 15;
                else if (buffer.length > 100) releaseCount = 8;
                else if (buffer.length > 50) releaseCount = 4;
                else if (buffer.length > 20) releaseCount = 3;

                const toRelease = buffer.slice(0, releaseCount);
                const remaining = buffer.slice(releaseCount);
                streamingBufferRef.current[id] = remaining;

                next[idx] = {
                  ...next[idx],
                  content: next[idx].content + toRelease,
                  isStreaming: remaining.length > 0, // Stay true if more is coming
                };
                changed = true;

                if (remaining.length === 0) {
                  delete streamingBufferRef.current[id];
                  streamingMessageIds.current.delete(id);
                }
              }
            }

            return changed ? next : prev;
          });
        }
      }
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const pushMessage = useCallback((msg: ZAppMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return {
    messages,
    isConnected,
    connectionType,
    pushMessage,
  };
};
