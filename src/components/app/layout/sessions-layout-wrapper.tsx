"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Activity } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SessionsSidebar } from "@/components/app/layout";
import { ThemeToggle, UserProfileDropdown } from "@/components/common";
import { useAuth } from "@/contexts/auth-context";
import { useSession, useSessionStream } from "@/hooks";
import { useSocket } from "@/hooks";
import { cn } from "@/lib/utils";

export function SessionsLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const routePart = pathname.split("/")[2] || "";
  const staticRoutes = new Set(["all", "memory", "settings", "usage"]);
  const sessionId = routePart && !staticRoutes.has(routePart) ? routePart : "";
  const isSessionDetail = !!sessionId;

  // Always call hooks unconditionally (Rules of Hooks)
  const { user, logout } = useAuth();
  const { data: session } = useSession(sessionId, isSessionDetail);
  const stream = useSessionStream(sessionId, undefined, isSessionDetail);
  const { isConnected: isSocketConnected } = useSocket();

  // For session detail pages the [id]/layout.tsx handles everything
  if (isSessionDetail) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground w-full">
        <SessionsSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40 h-14 shrink-0 flex items-center px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-3 flex min-w-0 items-center gap-2">
              {isSessionDetail && (
                <Link
                  href="/app"
                  className="flex size-7 items-center justify-center rounded border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Back to app"
                >
                  <ArrowLeft className="size-3.5" />
                </Link>
              )}
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 truncate max-w-[45vw]">
                {isSessionDetail ? session?.title || "New Chat" : "Qz App"}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isSessionDetail && (
                <>
                  <div className="rounded-none border border-border/50 bg-card/40 h-6 px-2 flex items-center gap-1.5">
                    <div
                      className={cn(
                        "size-1.5 rounded-none",
                        isSocketConnected
                          ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                          : "bg-destructive animate-pulse",
                      )}
                    />
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                      Socket {isSocketConnected ? "Live" : "Offline"}
                    </p>
                  </div>
                  <div className="rounded-none border border-border/50 bg-card/40 h-6 px-2 flex items-center gap-1.5">
                    <Activity
                      className={cn(
                        "size-3 text-muted-foreground",
                        stream.isConnected && "text-primary animate-pulse",
                      )}
                    />
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                      SSE {stream.isConnected ? "Live" : "Offline"}
                    </p>
                  </div>
                </>
              )}
              <ThemeToggle />
              <UserProfileDropdown user={user} onLogout={logout} />
            </div>
          </header>
          <main className="flex-1 overflow-auto no-scrollbar p-4 md:p-8 w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
