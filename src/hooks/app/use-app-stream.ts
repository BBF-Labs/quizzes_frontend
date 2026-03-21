import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getAccessToken } from "@/lib/session";
import type {
  ZSession,
  ZSessionMessage,
  ZSessionMessageType,
  ConnectionType,
} from "@/types/session";

interface UseSessionStreamOptions {
  onSessionUpdate?: (session: ZSession) => void;
  onConnectionChange?: (connected: boolean, type: ConnectionType) => void;
}

export const useSessionStream = (
  sessionId: string,
  initialMessages: ZSessionMessage[] = [],
  enabled = true,
  options?: UseSessionStreamOptions,
) => {
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [messages, setMessages] = useState<ZSessionMessage[]>(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingBuffer, setThinkingBuffer] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    enabled ? "polling" : "disconnected",
  );

  const lastSyncedRef = useRef<string>("");

  useEffect(() => {
    if (initialMessages.length === 0) return;

    const syncKey = initialMessages
      .map((m) => `${m.id}-${m.content.length}`)
      .join("|");

    if (syncKey === lastSyncedRef.current) return;
    lastSyncedRef.current = syncKey;

    setMessages((prev) => {
      const next = [...prev];
      let changed = false;

      initialMessages.forEach((im) => {
        const existingIdx = next.findIndex(
          (m) =>
            m.id === im.id || (m.messageId && m.messageId === im.messageId),
        );

        if (existingIdx >= 0) {
          const isStreaming =
            !!streamingBufferRef.current[im.id] ||
            (im.messageId && !!streamingBufferRef.current[im.messageId]);

          if (!isStreaming && next[existingIdx].content !== im.content) {
            next[existingIdx] = im;
            changed = true;
          }
        } else {
          next.push(im);
          changed = true;
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
          const signal = JSON.parse(event.data);
          switch (signal.type) {
            case "tool_called":
              if (signal.payload?.tool === "thinking") {
                setIsThinking(true);
              }
              break;

            case "thinking_chunk":
              if (signal.payload?.chunk || signal.payload?.text) {
                setIsThinking(true);
                const chunk = signal.payload?.chunk ?? signal.payload?.text;
                setThinkingBuffer((prev) => prev + chunk);
              }
              break;

            case "thinking_done":
              setIsThinking(false);
              setThinkingBuffer("");
              break;

            case "text_chunk":
              if (
                signal.payload?.text !== undefined ||
                signal.payload?.chunk !== undefined
              ) {
                setIsThinking(false);
                setThinkingBuffer("");
                const text =
                  signal.payload?.text ?? signal.payload?.chunk ?? "";
                const msgId = signal.payload?.messageId;

                setMessages((prev) => {
                  const msgs = [...prev];
                  const existingIdx = msgId
                    ? msgs.findIndex((m) => m.messageId === msgId)
                    : -1;

                  if (existingIdx >= 0) {
                    const currentBuffer =
                      streamingBufferRef.current[msgId] || "";
                    streamingBufferRef.current[msgId] = currentBuffer + text;
                  } else {
                    const stableId = msgId || uuidv4();
                    const newMsg: ZSessionMessage = {
                      id: stableId,
                      messageId: stableId,
                      role: "z",
                      type: "text" as ZSessionMessageType,
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
      connect();
    }
    return () => {
      disconnect();
    };
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
                let releaseCount = 1;
                if (buffer.length > 200) releaseCount = 12;
                else if (buffer.length > 100) releaseCount = 6;
                else if (buffer.length > 50) releaseCount = 3;
                else if (buffer.length > 20) releaseCount = 2;

                const toRelease = buffer.slice(0, releaseCount);
                streamingBufferRef.current[id] = buffer.slice(releaseCount);

                next[idx] = {
                  ...next[idx],
                  content: next[idx].content + toRelease,
                  isStreaming: buffer.length > releaseCount,
                };
                changed = true;

                if (streamingBufferRef.current[id] === "") {
                  delete streamingBufferRef.current[id];
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

  const pushMessage = useCallback((msg: ZSessionMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return {
    messages,
    isThinking,
    thinkingBuffer,
    isConnected,
    connectionType,
    pushMessage,
  };
};
