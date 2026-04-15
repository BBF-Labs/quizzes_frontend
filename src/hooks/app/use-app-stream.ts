import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "@/hooks";
import type {
  ZApp,
  ZAppMessage,
  ZAppMessageType,
  ZDirective,
  ConnectionType,
} from "@/types/session";

interface UseAppStreamOptions {
  onAppUpdate?: (app: ZApp) => void;
  onConnectionChange?: (connected: boolean, type: ConnectionType) => void;
  onCitationsUpdate?: (citations: unknown[]) => void;
  onRequestRefetch?: () => void;
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

  const { socket, isConnected: isSocketConnected } = useSocket();
  const streamingMessageIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    setIsConnected(isSocketConnected);
    setConnectionType(isSocketConnected ? "socket" : "disconnected");
    options?.onConnectionChange?.(
      isSocketConnected,
      isSocketConnected ? "socket" : "disconnected",
    );
  }, [isSocketConnected, options]);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!socket || !isSocketConnected || !sessionId || !enabled) return;

    // JOIN the session room to receive broadcasts (directives, etc.)
    socket.emit("join:app_session", sessionId);

    const handleAppSignal = (signal: StreamSignal) => {
      // Handle the signal if it belongs to this session
      if (signal.sessionId !== sessionId) return;

      try {
        switch (signal.type) {
          case "thinking_chunk":
          case "text_chunk":
            if (
              signal.payload?.text !== undefined ||
              signal.payload?.chunk !== undefined
            ) {
              const text = signal.payload?.text ?? signal.payload?.chunk ?? "";
              const msgId = signal.payload?.messageId;

              setMessages((prev) => {
                const msgs = [...prev];
                const existingIdx = msgId
                  ? msgs.findIndex(
                      (m) => m.messageId === msgId || m.id === msgId,
                    )
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

          case "thinking_done":
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
            const freshCitations = (signal.payload as any)?.citations;
            if (Array.isArray(freshCitations) && freshCitations.length > 0) {
              optionsRef.current?.onCitationsUpdate?.(freshCitations);
            }
            break;
          }

          case "directive": {
            const msgId = signal.payload?.messageId as string | undefined;
            const directive = signal.payload?.directive as
              | ZDirective
              | undefined;
            if (directive && msgId) {
              setMessages((prev) => {
                const exists = prev.some(
                  (m) => m.id === msgId || m.messageId === msgId,
                );
                if (exists) return prev;
                const newMsg: ZAppMessage = {
                  id: msgId,
                  messageId: msgId,
                  role: "z",
                  type: "directive" as ZAppMessageType,
                  content: "",
                  directive,
                  timestamp: signal.timestamp || new Date().toISOString(),
                  isStreaming: false,
                };
                return [...prev, newMsg];
              });
            }
            break;
          }

          case "phase_changed":
          case "artifact_saved":
          case "artifact_updated":
          case "app_interrupted":
            // Trigger a refetch of the main session data to sync the UI
            optionsRef.current?.onRequestRefetch?.();
            break;
 
          case "error":
            console.error(
              "Session signal error:",
              signal.payload?.error || signal,
            );
            break;
        }
      } catch (err) {
        console.error("Failed to process socket signal:", err);
      }
    };

    socket.on("app:signal", handleAppSignal);
    return () => {
      socket.off("app:signal", handleAppSignal);
      socket.emit("leave:app_session", sessionId);
    };
  }, [socket, isSocketConnected, sessionId, enabled]);

  const pushMessage = useCallback((msg: ZAppMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateMessage = useCallback(
    (id: string, updates: Partial<ZAppMessage>) => {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === id);
        if (idx < 0) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], ...updates };
        return next;
      });
    },
    [],
  );

  const removeMessagesByReplyTo = useCallback((replyToMessageId: string) => {
    setMessages((prev) =>
      prev.filter(
        (m) =>
          (m as ZAppMessage & { replyToMessageId?: string })
            .replyToMessageId !== replyToMessageId,
      ),
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

  return useMemo(
    () => ({
      messages,
      isConnected,
      connectionType,
      pushMessage,
      updateMessage,
      removeMessagesByReplyTo,
      truncateAfter,
      truncateFrom,
    }),
    [
      messages,
      isConnected,
      connectionType,
      pushMessage,
      updateMessage,
      removeMessagesByReplyTo,
      truncateAfter,
      truncateFrom,
    ],
  );
};
