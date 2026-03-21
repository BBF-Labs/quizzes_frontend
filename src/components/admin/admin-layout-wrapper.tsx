"use client";

import { usePathname } from "next/navigation";
// import { AdminGuard } from "@/components/admin";
import { AuthGuard } from "@/components/common";
import { AdminUserActions } from "@/components/admin";
import { AdminSidebar } from "@/components/admin";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import Link from "next/link";
import { SocketProvider } from "@/contexts/socket-context";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <AuthGuard requireSuperAdmin>
      <SocketProvider>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background text-foreground w-full">
            <AdminSidebar />
            <SidebarInset className="flex flex-col flex-1">
              <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50 h-14 shrink-0 flex items-center">
                <div className="flex items-center justify-between w-full px-4">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="h-4 w-px bg-border/50" />
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                          <BreadcrumbLink asChild>
                            <Link
                              href="/admin"
                              className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/50 hover:text-primary transition-colors"
                            >
                              Admin
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {segments.length > 1 && (
                          <>
                            <BreadcrumbSeparator className="hidden md:block" />
                            {segments.slice(1).map((segment, index) => {
                              const isLast = index === segments.slice(1).length - 1;
                              const pathSegments = segments.slice(0, index + 2);
                              const href = `/${pathSegments.join("/")}`;
                              const label = segment.replace(/-/g, " ");

                              return (
                                <React.Fragment key={href || index}>
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
                  <AdminUserActions />
                </div>
              </header>
              <main className="flex-1 overflow-auto p-4 md:p-8 max-w-7xl">
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </SocketProvider>
    </AuthGuard>
  );
}
