"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/layout";
import { UserProfileDropdown } from "@/components/common";
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
import { useStreakStatus } from "@/hooks";
import { Search, Bell, Flame } from "lucide-react";

export function AppLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isAppSection = segments[0] === "app";
  const routePart = isAppSection ? (segments[1] || "") : (segments[0] || "");
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
    "profile",
    "courses",
    "timetable",
    "billing",
  ]);
  const sessionId = isAppSection && routePart && !staticRoutes.has(routePart) ? routePart : "";
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
    profile: "Profile",
    courses: "My Courses",
    timetable: "Exam Timetable",
    billing: "Billing",
  };
  const detailLabelMap: Record<string, string> = {
    flashcards: "Set",
    quizzes: "Quiz",
    notes: "Note",
    mindmaps: "Mind Map",
  };
  // Sub-route actions appended after a dynamic detail id (e.g.
  // /app/quizzes/<id>/take → "Take Quiz"). Keeps deep paths readable when
  // older segments have been collapsed away.
  const subRouteLabelMap: Record<string, string> = {
    take: "Take Quiz",
  };
  const breadcrumbOffset = isAppSection ? 1 : 0;

  const { user, logout } = useAuth();
  const dynamicTitle = useBreadcrumbStore((state) => state.dynamicTitle);
  const { data: streak } = useStreakStatus();
  const [searchQuery, setSearchQuery] = useState("");

  useGlobalAppEvents();

  if (isSessionDetail) {
    return <>{children}</>;
  }

  const breadcrumbSegments = segments.slice(breadcrumbOffset);
  const parentSegment = breadcrumbSegments[0] || "";

  // Breadcrumb cap: show at most 2 items total.
  // - On nested paths we drop the fixed "Today" anchor so the 2 slots are
  //   the parent section + the current page (handled like a stack — always
  //   render the last 2 segments; older segments are collapsed away).
  // - On shallow paths (e.g. /app, /app/quizzes) we keep "Today" so the user
  //   still has a way back to the dashboard.
  const showTodayAnchor = breadcrumbSegments.length === 0;
  const visibleSegments = breadcrumbSegments.slice(-2);

  const formatSegment = (segment: string, index: number) => {
    if (routeLabelMap[segment]) return routeLabelMap[segment];
    if (subRouteLabelMap[segment]) return subRouteLabelMap[segment];
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
      <div className="flex min-h-screen bg-[#F7F9FC] text-slate-900 w-full antialiased">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0 bg-[#F7F9FC]">
          {/* Header Bar */}
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl h-18 shrink-0 flex items-center px-4 sm:px-6 lg:px-8">
            <SidebarTrigger className="-ml-1 text-slate-700 hover:bg-slate-100 rounded-xl" />

            {/* Breadcrumb Navigation */}
            <div className="ml-3 min-w-0 flex items-center gap-2">
              <div className="h-4 w-px bg-slate-200" />
              <Breadcrumb>
                <BreadcrumbList>
                  {showTodayAnchor && (
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          href="/app"
                          className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 hover:text-[#0C60FC] transition-colors"
                        >
                          Today
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  )}
                  {visibleSegments.length > 0 && (
                    <>
                      {showTodayAnchor && <BreadcrumbSeparator />}
                      {visibleSegments.map((segment, index) => {
                        // Map visible segment back to its position in the
                        // full breadcrumbSegments array so labels and hrefs
                        // resolve correctly when older segments were dropped.
                        const realIndex =
                          breadcrumbSegments.length -
                          visibleSegments.length +
                          index;
                        const isLast = index === visibleSegments.length - 1;
                        const href = `/${segments
                          .slice(0, realIndex + breadcrumbOffset + 1)
                          .join("/")}`;
                        const label = formatSegment(segment, realIndex);

                        return (
                          <React.Fragment key={`${href}-${segment}`}>
                            <BreadcrumbItem>
                              {isLast ? (
                                <BreadcrumbPage className="text-[10px] font-extrabold tracking-widest uppercase text-slate-950">
                                  {label}
                                </BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink asChild>
                                  <Link
                                    href={href}
                                    className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 hover:text-[#0C60FC] transition-colors"
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

            {/* Middle Search Bar */}
            <div className="hidden md:flex min-w-0 max-w-md flex-1 items-center gap-2 rounded-xl bg-[#F0F3F8] px-3.5 py-2.5 mx-4">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, notes or tools"
                className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              />
              <kbd className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-400 shadow-2xs">
                ⌘K
              </kbd>
            </div>

            {/* Right Controls */}
            <div className="ml-auto flex items-center gap-3 shrink-0">
              <button className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-extrabold text-amber-600 hover:bg-slate-50 transition shadow-2xs">
                <Flame className="h-3.5 w-3.5" />
                {streak?.current ?? 8} day streak
              </button>

              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
              </button>

              <UserProfileDropdown user={user} onLogout={logout} />
            </div>
          </header>

          <main className="flex-1 overflow-auto no-scrollbar w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
