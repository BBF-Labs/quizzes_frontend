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
            !!m.isStreaming;

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

  const streamingMessageIds = useRef<Set<string>>(new Set());

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
          if (signal.sessionId !== sessionId) return;

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
                    ? msgs.findIndex((m) => m.messageId === msgId || m.id === msgId)
                    : -1;

                  if (existingIdx >= 0) {
                    streamingMessageIds.current.add(msgId!);
                    msgs[existingIdx] = {
                      ...msgs[existingIdx],
                      content: msgs[existingIdx].content + text,
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
                      content: text,
                      timestamp: signal.timestamp || new Date().toISOString(),
                      isStreaming: true,
                    };
                    if (isMountedRef.current) {
                      msgs.push(newMsg);
                    }
                  }
                  return msgs;
                });
              }
              break;

            case "text_done": {
              const doneId = signal.payload?.messageId as string | undefined;
              if (doneId) {
                streamingMessageIds.current.delete(doneId);
                setMessages((prev) => {
                  const msgs = [...prev];
                  const idx = msgs.findIndex(
                    (m) => m.id === doneId || m.messageId === doneId,
                  );
                  if (idx >= 0) {
                    msgs[idx] = { ...msgs[idx], isStreaming: false };
                  }
                  return msgs;
                });
              }
              break;
            }

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


  const pushMessage = useCallback((msg: ZAppMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ZAppMessage>) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  }, []);

  const removeMessagesByReplyTo = useCallback((replyToMessageId: string) => {
    setMessages((prev) =>
      prev.filter((m) => (m as ZAppMessage & { replyToMessageId?: string }).replyToMessageId !== replyToMessageId),
    );
  }, []);

  /** Keep the target message, remove everything after it */
  const truncateAfter = useCallback((messageId: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex(
        (m) => m.id === messageId || m.messageId === messageId,
      );
      if (idx < 0) return prev;
      return prev.slice(0, idx + 1);
    });
  }, []);

  /** Remove the target message and everything after it */
  const truncateFrom = useCallback((messageId: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex(
        (m) => m.id === messageId || m.messageId === messageId,
      );
      if (idx < 0) return prev;
      return prev.slice(0, idx);
    });
  }, []);

  return {
    messages,
    isConnected,
    connectionType,
    pushMessage,
    updateMessage,
    removeMessagesByReplyTo,
    truncateAfter,
    truncateFrom,
  };
};
