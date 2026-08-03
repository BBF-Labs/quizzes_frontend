"use client";

import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveAvatarUrl } from "@/lib/utils";

interface UserProfileDropdownProps {
  user:
    | ({
        username?: string;
        email?: string;
        name?: string;
        profilePicture?: string;
        oauthPicture?: string;
        role?: "student" | "creator" | "moderator" | "super_admin";
      } & Record<string, unknown>)
    | null;
  onLogout: () => void;
  align?: "end" | "center" | "start";
}

function initialsOf(user: Record<string, unknown> | null | undefined): string {
  if (!user) return "U";
  const name =
    (typeof user.name === "string" && user.name) ||
    (typeof user.username === "string" && user.username) ||
    (typeof user.email === "string" && user.email) ||
    "";
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function UserProfileDropdown({
  user,
  onLogout,
  align = "end",
}: UserProfileDropdownProps) {
  if (!user) return null;

  const avatarUrl = resolveAvatarUrl(user);
  const displayName =
    (typeof user.name === "string" && user.name) ||
    user.username ||
    user.email ||
    "My Account";
  const email =
    typeof user.email === "string" ? user.email : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0C60FC]/30"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0C60FC] text-xs font-extrabold text-white shadow-sm">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              initialsOf(user)
            )}
          </span>
          <span className="hidden max-w-[100px] truncate text-xs font-bold text-slate-700 sm:block">
            {displayName.split(" ")[0] || displayName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className="w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
      >
        {/* User identity block */}
        <div className="px-3 py-2 border-b border-slate-100 mb-1">
          <p className="text-xs font-bold text-slate-900 truncate">
            {displayName}
          </p>
          {email && (
            <p className="text-[10px] text-slate-400 truncate">{email}</p>
          )}
        </div>

        {/* App Dashboard Link */}
        <DropdownMenuItem asChild>
          <Link
            href="/app"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900 focus:outline-none data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
          >
            <LayoutDashboard className="h-4 w-4 text-[#0C60FC]" />
            Open dashboard
          </Link>
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem asChild>
          <Link
            href="/app/settings"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900 focus:outline-none data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900"
          >
            <Settings className="h-4 w-4 text-slate-500" />
            Settings
          </Link>
        </DropdownMenuItem>

        {(user.role === "super_admin" || user.role === "moderator") && (
          <>
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#0C60FC] transition hover:bg-blue-50 hover:text-[#0C60FC] focus:bg-blue-50 focus:text-[#0C60FC] focus:outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-[#0C60FC]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="my-1 bg-slate-100" />

        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 focus:outline-none data-[highlighted]:bg-red-50 data-[highlighted]:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}