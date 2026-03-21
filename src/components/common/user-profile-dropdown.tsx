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
  user: {
    username?: string;
    email?: string;
    profilePicture?: string;
    isSuperAdmin?: boolean;
    [key: string]: any;
  } | null;
  onLogout: () => void;
  align?: "end" | "center" | "start";
}

export function UserProfileDropdown({ user, onLogout, align = "end" }: UserProfileDropdownProps) {
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none size-9 border border-border/40 hover:border-primary/50 text-muted-foreground hover:text-foreground bg-card/60 backdrop-blur-md transition-colors overflow-hidden p-0"
        >
          <Avatar className="size-full rounded-none">
             <AvatarImage
               src={user.profilePicture}
               className="object-cover"
             />
             <AvatarFallback className="rounded-none bg-zinc-800 font-mono text-[10px] font-bold text-zinc-400">
               {user?.username?.[0]?.toUpperCase() || "U"}
             </AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56 rounded-none border border-border/50">
        <DropdownMenuLabel className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/80 py-2">
          {user.username || "My Account"}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* App Dashboard Link */}
        <DropdownMenuItem asChild className="rounded-none cursor-pointer">
          <Link href="/app" className="w-full flex items-center gap-2 group">
            <LayoutDashboard className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-mono text-xs uppercase tracking-widest">
              My Sessions
            </span>
          </Link>
        </DropdownMenuItem>

        {/* Global Settings */}
        <DropdownMenuItem asChild className="rounded-none cursor-pointer">
          <Link href="/app/settings" className="w-full flex items-center gap-2 group">
            <Settings className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-mono text-xs uppercase tracking-widest">
              Settings
            </span>
          </Link>
        </DropdownMenuItem>
        
        {user.isSuperAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="font-mono text-[10px] tracking-widest uppercase text-primary/80 py-2">
              Superadmin
            </DropdownMenuLabel>
            <DropdownMenuItem asChild className="rounded-none cursor-pointer">
              <Link href="/admin" className="w-full flex items-center gap-2 group">
                <LayoutDashboard className="size-4 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="font-mono text-xs uppercase tracking-widest text-primary">
                  Admin Panel
                </span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onLogout} className="rounded-none cursor-pointer focus:bg-red-500/10 focus:text-red-500 group">
          <LogOut className="size-4 mt-0.5" />
          <span className="font-mono text-xs uppercase tracking-widest ml-2">
            Sign Out
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
