"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/layout";
import { ThemeToggle, UserProfileDropdown } from "@/components/common";
import { useAuth } from "@/contexts/auth-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useBreadcrumbStore } from "@/store/breadcrumb";
import { useGlobalAppEvents } from "@/hooks/app/use-global-app-events";

export function AppLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const routePart = segments[1] || "";
  const staticRoutes = new Set([
    "all",
    "memory",
    "settings",
    "usage",
    "flashcards",
    "quizzes",
    "notes",
    "mindmaps",
    "library",
  ]);
  const sessionId = routePart && !staticRoutes.has(routePart) ? routePart : "";
  const isSessionDetail = !!sessionId;
  const routeLabelMap: Record<string, string> = {
    all: "All Sessions",
    memory: "Memory",
    settings: "Settings",
    usage: "Usage",
    flashcards: "Flashcards",
    quizzes: "Quizzes",
    notes: "Notes",
    mindmaps: "Mind Maps",
  };
  const detailLabelMap: Record<string, string> = {
    flashcards: "Set",
    quizzes: "Quiz",
    notes: "Note",
    mindmaps: "Mind Map",
  };

  // Always call hooks unconditionally (Rules of Hooks)
  const { user, logout } = useAuth();
  const dynamicTitle = useBreadcrumbStore((state) => state.dynamicTitle);
  
  // Attach global socket listener to automatically refresh TanStack caches
  useGlobalAppEvents();

  // For session detail pages the [id]/layout.tsx handles everything
  if (isSessionDetail) {
    return <>{children}</>;
  }

  const breadcrumbSegments = segments.slice(1);
  const parentSegment = breadcrumbSegments[0] || "";

  const formatSegment = (segment: string, index: number) => {
    if (routeLabelMap[segment]) return routeLabelMap[segment];
    const isNestedDetail = index > 0 && detailLabelMap[parentSegment];
    if (isNestedDetail && dynamicTitle) return dynamicTitle;
    if (isNestedDetail) return detailLabelMap[parentSegment];
    const isLikelyId = index > 0 && /^[a-f0-9-]{8,}$/i.test(segment);
    if (isLikelyId && dynamicTitle) return dynamicTitle;
    if (isLikelyId) return "Details";
    return segment.replace(/-/g, " ");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40 h-14 shrink-0 flex items-center px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-3 min-w-0 flex items-center gap-2">
              <div className="h-4 w-px bg-border/50" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        href="/app"
                        className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/50 hover:text-primary transition-colors"
                      >
                        App
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbSegments.length > 0 && (
                    <>
                      <BreadcrumbSeparator />
                      {breadcrumbSegments.map((segment, index) => {
                        const isLast = index === breadcrumbSegments.length - 1;
                        const href = `/${segments.slice(0, index + 2).join("/")}`;
                        const label = formatSegment(segment, index);

                        return (
                          <React.Fragment key={`${href}-${segment}`}>
                            <BreadcrumbItem>
                              {isLast ? (
                                <BreadcrumbPage className="text-[10px] font-mono tracking-widest uppercase text-foreground">
                                  {label}
                                </BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink asChild>
                                  <Link
                                    href={href}
                                    className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/50 hover:text-primary transition-colors"
                                  >
                                    {label}
                                  </Link>
                                </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                          </React.Fragment>
                        );
                      })}
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto flex items-center gap-2">
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
