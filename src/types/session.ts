export type ZSessionMessageType = "thinking" | "directive" | "message";

export interface ZSessionMessage {
  id: string;
  type: ZSessionMessageType;
  content: string;
  timestamp: string;
}

export type ConnectionType = "sse" | "polling" | "disconnected";

export interface ZSession {
  id: string;
  title: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
  userId?: string;
  subject?: string;
  messages?: ZSessionMessage[];
}
