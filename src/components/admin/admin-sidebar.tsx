"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  UserPlus,
  Radio,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
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
import { useGlobalSocket } from "@/contexts/socket-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigation = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Communications",
    items: [
      {
        title: "Campaigns",
        url: "/admin/campaigns",
        icon: Mail,
      },
      {
        title: "Events",
        url: "/admin/events",
        icon: Radio,
      },
    ],
  },
  {
    title: "Users & List",
    items: [
      {
        title: "Platform Users",
        url: "/admin/users",
        icon: GraduationCap,
      },
      {
        title: "Subscribers",
        url: "/admin/subscribers",
        icon: Mail,
      },
      {
        title: "Waitlist",
        url: "/admin/waitlist",
        icon: UserPlus,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Admin Profile",
        url: "/admin/profile",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isConnected } = useGlobalSocket();
  const { logout, user } = useAuth();
  const isSuperAdminRole = user?.role === "super_admin";
  const { state } = useSidebar();

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
                / Admin
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.url === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.url ||
                        pathname.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "h-9 px-4 rounded-(--radius) transition-all duration-200",
                          isActive
                            ? "bg-primary/5 text-primary border-r-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        )}
                      >
                        <Link href={item.url}>
                          <item.icon
                            className={cn("size-4", isActive && "text-primary")}
                          />
                          <span className="font-mono text-[11px] uppercase tracking-widest">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-0  overflow-hidden">
        {/* User Profile & Actions */}
        <div
          className={cn(
            "flex items-stretch gap-0 border-t border-border/50",
            state === "expanded" ? "h-12" : "h-10",
          )}
        >
          <Link
            href="/admin/profile"
            className={cn(
              "flex-1 flex items-center gap-3 p-2 hover:bg-secondary/10 transition-colors overflow-hidden",
              pathname === "/admin/profile" &&
                "bg-primary/5 border-l-2 border-primary",
            )}
          >
            <Avatar className="size-8 rounded-(--radius) border border-border/50 bg-secondary/20 shrink-0">
              <AvatarImage
                src={user?.profilePicture}
                className="object-cover"
              />
              <AvatarFallback className="rounded-(--radius) bg-zinc-800 font-mono text-[10px] font-bold text-zinc-400">
                {user?.username?.[0]?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            {state === "expanded" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-[10px] font-mono font-bold text-foreground uppercase truncate">
                  {user?.username || "Admin"}
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={cn(
                      "size-1 shrink-0",
                      isSuperAdminRole ? "bg-blue-500" : "bg-zinc-500",
                    )}
                  />
                  <span className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase truncate">
                    {user?.role ? user.role.replace("_", " ") : "Staff"}
                  </span>
                </div>
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

        {/* Engine Status */}
        <div className="flex items-center gap-3 px-4 py-2 bg-secondary/5 border-t border-border/50">
          <div
            className={cn(
              "size-1.5 rounded-(--radius) transition-colors duration-500",
              isConnected
                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                : "bg-destructive animate-pulse",
            )}
          />
          {state === "expanded" && (
            <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">
              {isConnected ? "Engine: Connected" : "Engine: Offline"}
            </span>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
