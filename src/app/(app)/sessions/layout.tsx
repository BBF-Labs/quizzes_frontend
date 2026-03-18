"use client";

import type { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SessionsSidebar } from "@/components/sessions-sidebar";

export default function SessionsLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground w-full">
        <SessionsSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40 h-14 shrink-0 flex items-center px-4">
            <SidebarTrigger className="-ml-1" />
            <span className="ml-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
              Qz Sessions
            </span>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
