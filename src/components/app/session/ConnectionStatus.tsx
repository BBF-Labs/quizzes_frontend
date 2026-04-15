"use client";

import { cn } from "@/lib/utils";
import type { ConnectionType } from "@/types/session";
import { Radio, Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  connectionType: ConnectionType;
  isConnected: boolean;
  className?: string;
}

const config: Record<
  ConnectionType,
  { label: string; icon: typeof Wifi; dot: string; text: string }
> = {
  socket: {
    label: "Socket",
    icon: Wifi,
    dot: "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]",
    text: "text-primary",
  },
  sse: {
    label: "Live",
    icon: Radio,
    dot: "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]",
    text: "text-green-500",
  },
  polling: {
    label: "Polling",
    icon: Wifi,
    dot: "bg-amber-500 animate-pulse",
    text: "text-amber-500",
  },
  disconnected: {
    label: "Offline",
    icon: WifiOff,
    dot: "bg-destructive animate-pulse",
    text: "text-destructive",
  },
};

export function ConnectionStatus({
  connectionType,
  isConnected,
  className,
}: ConnectionStatusProps) {
  const effective: ConnectionType = isConnected
    ? connectionType
    : "disconnected";
  const cfg = config[effective];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-center w-9 h-9 border border-border bg-transparent transition-colors rounded-(--radius)",
        className,
      )}
      title={`${cfg.label} Connection`}
    >
      <div className="relative">
        <Icon className={cn("size-4", cfg.text)} />
        <span
          className={cn(
            "absolute -top-1 -right-1 size-1.5 rounded-(--radius)",
            cfg.dot,
          )}
        />
      </div>
    </div>
  );
}
