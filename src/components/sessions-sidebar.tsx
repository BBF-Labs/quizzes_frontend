"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  Clock3,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Timer,
} from "lucide-react";
import { useSessions } from "@/hooks/use-sessions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SessionsSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { data: sessions = [] } = useSessions();

  const recentChats = useMemo(() => sessions.slice(0, 6), [sessions]);

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="h-14 flex items-center px-4">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-end space-x-1.5 px-0.5">
            <span className="text-lg font-bold tracking-widest text-foreground leading-none">
              Qz.
            </span>
            {state === "expanded" && (
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground/60 uppercase leading-none mb-px">
                / Sessions
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/sessions"}
                  tooltip="Start Chat"
                  className={cn(
                    "h-9 px-4 rounded-none transition-all duration-200",
                    pathname === "/sessions"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/sessions">
                    <Plus className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Start Chat
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/sessions/all"}
                  tooltip="All Chats"
                  className={cn(
                    "h-9 px-4 rounded-none transition-all duration-200",
                    pathname === "/sessions/all"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/sessions/all">
                    <MessageSquare className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      All Chats
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/sessions/memory"}
                  tooltip="Memory"
                  className={cn(
                    "h-9 px-4 rounded-none transition-all duration-200",
                    pathname === "/sessions/memory"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/sessions/memory">
                    <Brain className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Memory
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/sessions/settings"}
                  tooltip="Settings"
                  className={cn(
                    "h-9 px-4 rounded-none transition-all duration-200",
                    pathname === "/sessions/settings"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/sessions/settings">
                    <Settings className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Settings
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/sessions/usage"}
                  tooltip="Usage"
                  className={cn(
                    "h-9 px-4 rounded-none transition-all duration-200",
                    pathname === "/sessions/usage"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/sessions/usage">
                    <Timer className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Usage
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-2">
            Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentChats.length === 0 ? (
                <SidebarMenuItem>
                  <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                    No chats yet
                  </div>
                </SidebarMenuItem>
              ) : (
                recentChats.map((session) => {
                  const title =
                    session.title || `Chat ${session._id.slice(0, 6)}`;
                  const href = `/sessions/${session._id}`;
                  const isActive = pathname === href;

                  return (
                    <SidebarMenuItem key={session._id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={title}
                        className={cn(
                          "h-8 px-4 rounded-none transition-all duration-200",
                          isActive
                            ? "bg-primary/5 text-primary border-r-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        )}
                      >
                        <Link href={href}>
                          <Clock3 className="size-3.5" />
                          <span className="font-mono text-[10px] tracking-wide truncate">
                            {title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2 bg-secondary/5 border-t border-border/50">
          <Sparkles className="size-3 text-primary" />
          {state === "expanded" && (
            <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
              Z Memory Enabled
            </span>
          )}
        </div>

        <Link
          href="/"
          className="h-10 w-full border-t border-border/50 flex items-center gap-3 px-4 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {state === "expanded" && (
            <span className="text-[10px] font-mono uppercase tracking-widest">
              Back
            </span>
          )}
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
