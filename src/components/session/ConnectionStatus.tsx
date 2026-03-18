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
  const effective: ConnectionType =
    isConnected ? connectionType : "disconnected";
  const cfg = config[effective];
  const Icon = cfg.icon;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className={cn("size-1.5 rounded-none", cfg.dot)} />
      <Icon className={cn("size-3", cfg.text)} />
      <span
        className={cn(
          "text-[9px] font-mono font-bold uppercase tracking-widest",
          cfg.text,
        )}
      >
        {cfg.label}
      </span>
    </div>
  );
}
