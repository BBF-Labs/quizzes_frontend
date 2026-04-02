"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface UserProfileDropdownProps {
  user:
    | ({
        username?: string;
        email?: string;
        profilePicture?: string;
        role?: "student" | "creator" | "moderator" | "super_admin";
      } & Record<string, unknown>)
    | null;
  onLogout: () => void;
  align?: "end" | "center" | "start";
}

export function UserProfileDropdown({
  user,
  onLogout,
  align = "end",
}: UserProfileDropdownProps) {
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-(--radius) size-9 border border-border/40 hover:border-primary/50 text-muted-foreground hover:text-foreground bg-card/60 backdrop-blur-md transition-colors overflow-hidden p-0"
        >
          <Avatar className="size-full rounded-(--radius)">
            <AvatarImage src={user.profilePicture} className="object-cover" />
            <AvatarFallback className="rounded-(--radius) bg-zinc-800 font-mono text-[10px] font-bold text-zinc-400">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-56 rounded-(--radius) border border-border/50"
      >
        <DropdownMenuLabel className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/80 py-2">
          {user.username || "My Account"}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* App Dashboard Link */}

        <DropdownMenuItem
          asChild
          className="rounded-(--radius) cursor-pointer group hover:bg-primary/80"
        >
          <Link href="/app" className="w-full flex items-center gap-2">
            <LayoutDashboard className="size-4 text-muted-foreground group-hover:text-white transition-colors" />
            <span className="font-mono text-xs uppercase tracking-widest group-hover:text-white transition-colors">
              App
            </span>
          </Link>
        </DropdownMenuItem>

        {/* Global Settings */}
        <DropdownMenuItem
          asChild
          className="rounded-(--radius) cursor-pointer group hover:bg-primary/80"
        >
          <Link href="/app/settings" className="w-full flex items-center gap-2">
            <Settings className="size-4 text-muted-foreground group-hover:text-white transition-colors" />
            <span className="font-mono text-xs uppercase tracking-widest group-hover:text-white transition-colors">
              Settings
            </span>
          </Link>
        </DropdownMenuItem>

        {(user.role === "super_admin" || user.role === "moderator") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="font-mono text-[10px] tracking-widest uppercase text-primary/80 py-2">
              Admin
            </DropdownMenuLabel>
            <DropdownMenuItem
              asChild
              className="rounded-(--radius) cursor-pointer group hover:bg-primary/80"
            >
              <Link href="/admin" className="w-full flex items-center gap-2">
                <LayoutDashboard className="size-4 text-primary opacity-80 group-hover:opacity-100 group-hover:text-white transition-colors" />
                <span className="font-mono text-xs uppercase tracking-widest text-primary group-hover:text-white transition-colors">
                  Admin Panel
                </span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="rounded-(--radius) cursor-pointer group hover:bg-red-500/10 focus:bg-red-500/10 hover:text-red-500 focus:text-red-500"
        >
          <LogOut className="size-4 mt-0.5 text-muted-foreground group-hover:text-red-500 group-focus:text-red-500 transition-colors" />
          <span className="font-mono text-xs uppercase tracking-widest ml-2 group-hover:text-red-500 group-focus:text-red-500 transition-colors">
            Sign Out
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
