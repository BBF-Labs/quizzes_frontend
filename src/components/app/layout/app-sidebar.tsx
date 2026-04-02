"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  BookOpen,
  Clock3,
  FileText,
  GraduationCap,
  LogOut,
  MessageSquare,
  Network,
  Plus,
  Settings,
  Sparkles,
  Timer,
  Calendar,
} from "lucide-react";
import { useSessions } from "@/hooks";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { data: sessions = [] } = useSessions();
  const { user, logout } = useAuth();

  const recentSessions = useMemo(() => sessions.slice(0, 6), [sessions]);

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
                / App
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4 no-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-2">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app"}
                  tooltip="New Session"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/app">
                    <Plus className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      New Session
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/all"}
                  tooltip="All Sessions"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/all"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/app/all">
                    <MessageSquare className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Screens
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/library"}
                  tooltip="Library"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/library"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/app/library">
                    <BookOpen className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Library
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-2">
            Academics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/courses"}
                  tooltip="My Courses"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/courses"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/app/courses">
                    <GraduationCap className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      My Courses
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/timetable"}
                  tooltip="Exam Timetable"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/timetable"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/app/timetable">
                    <Calendar className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Timetable
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-2">
            Academics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/courses"}
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/courses" ? "bg-primary/5 text-primary border-r-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Link href="/app/courses">
                    <GraduationCap className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">My Courses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/timetable"}
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/timetable" ? "bg-primary/5 text-primary border-r-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Link href="/app/timetable">
                    <Calendar className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">Timetable</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-2">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/flashcards"}
                  tooltip="Flashcards"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/flashcards"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/app/flashcards">
                    <Brain className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Flashcards
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/quizzes"}
                  tooltip="Quizzes"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/quizzes"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/app/quizzes">
                    <FileText className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Quizzes
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/quizzes")}
                  tooltip="Qz Quizzes"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname.startsWith("/quizzes")
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/quizzes">
                    <GraduationCap className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Qz Quizzes
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/mindmaps"}
                  tooltip="Mind Maps"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/mindmaps"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/app/mindmaps">
                    <Network className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Mind Maps
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-2">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/settings"}
                  tooltip="Account"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/settings"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/app/settings">
                    <Settings className="size-4" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">
                      Account
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/app/usage"}
                  tooltip="Usage"
                  className={cn(
                    "h-9 px-4 rounded-(--radius) transition-all duration-200",
                    pathname === "/app/usage"
                      ? "bg-primary/5 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Link href="/app/usage">
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
            Recent Sessions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentSessions.length === 0 ? (
                <SidebarMenuItem>
                  <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                    No sessions yet
                  </div>
                </SidebarMenuItem>
              ) : (
                recentSessions.map((session) => {
                  const title =
                    session.title || `Session ${session.id.slice(0, 6)}`;
                  const href = `/app/${session.id}`;
                  const isActive = pathname === href;

                  return (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={title}
                        className={cn(
                          "h-8 px-4 rounded-(--radius) transition-all duration-200",
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
        {/* Z Memory indicator */}
        <div className="flex items-center gap-3 px-4 py-2 bg-secondary/5 border-t border-border/50">
          <Sparkles className="size-3 text-primary" />
          {state === "expanded" && (
            <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
              Z Memory Enabled
            </span>
          )}
        </div>

        {/* Profile section */}
        <div
          className={cn(
            "flex items-stretch gap-0 border-t border-border/50",
            state === "expanded" ? "h-12" : "h-10",
          )}
        >
          <Link
            href="/app/profile"
            className={cn(
              "flex-1 flex items-center gap-3 p-2 hover:bg-secondary/10 transition-colors overflow-hidden",
              pathname === "/app/profile" && "bg-primary/5 border-l-2 border-primary",
            )}
          >
            <Avatar className="size-8 rounded-(--radius) border border-border/50 bg-secondary/20 shrink-0">
              <AvatarImage src={user?.profilePicture} className="object-cover" />
              <AvatarFallback className="rounded-(--radius) bg-zinc-800 font-mono text-[10px] font-bold text-zinc-400">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {state === "expanded" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-[10px] font-mono font-bold text-foreground uppercase truncate">
                  {user?.username || "User"}
                </span>
                <span className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase truncate">
                  {user?.role ? user.role.replace("_", " ") : "Student"}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={logout}
            className={cn(
              "flex items-center justify-center hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all group/logout border-l border-border/50",
              state === "expanded" ? "w-10" : "w-full",
            )}
            title="Logout"
          >
            <LogOut className="size-3.5 group-hover/logout:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Back to home */}
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
