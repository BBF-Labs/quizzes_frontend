"use client";

import { useAuth } from "@/contexts/auth-context";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";

export function AdminUserActions() {
  const { logout } = useAuth();
  const { isConnected } = useSocket();

  return (
    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
      <ThemeToggle />
      
      {/* Superadmin Indicator - Styled like ThemeToggle (h-9, ghost-like) */}
      <div className="hidden sm:flex items-center gap-2 h-9 px-3 border border-border/40 bg-secondary/10 hover:bg-secondary/20 transition-colors select-none rounded-none">
        <div 
          className={cn("size-1.5 rounded-full transition-colors", isConnected ? "bg-blue-500 animate-pulse" : "bg-zinc-400")} 
          title={isConnected ? "Real-time updates active" : "Real-time updates disconnected"}
        />
        <div className="size-1.5 rounded-none bg-primary" />
        <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Superadmin</span>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={logout}
        className="h-9 w-9 rounded-none hover:bg-destructive/10 hover:text-destructive transition-colors group"
        title="Logout"
      >
        <LogOut className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
      </Button>
    </div>
  );
}
