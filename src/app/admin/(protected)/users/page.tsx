"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Search, Download, Shield, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationController } from "@/components/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useUsers } from "@/hooks";
import { useUpdateUser } from "@/hooks/admin/use-admin";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MoreHorizontal, Ban, RotateCcw, User as UserIcon, X } from "lucide-react";

// ─── Ban Dialog ───────────────────────────────────────────────────────────────

function BanDialog({
  userName,
  onConfirm,
  onCancel,
  isPending,
}: {
  userName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md border border-destructive/40 bg-card p-6 shadow-xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-destructive mb-1">
              Ban Account
            </p>
            <p className="font-mono font-bold text-sm">{userName}</p>
          </div>
          <button onClick={onCancel} className="text-muted-foreground/40 hover:text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1.5">
            Reason <span className="text-muted-foreground/30">(sent to user in the ban email)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Violation of platform policies, inappropriate content…"
            rows={3}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-destructive/50 resize-none transition-colors"
          />
          <p className="text-[9px] font-mono text-muted-foreground/40 mt-1">
            Leave blank to use the default reason.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending}
            className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending ? "Banning…" : "Confirm Ban"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const search = searchParams.get("search") ?? "";
  const roleFilter = searchParams.get("role") ?? "";
  const banFilter = searchParams.get("isBanned") ?? "";

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const { data: usersData, isLoading } = useUsers({
    page,
    limit: 20,
    search: search || undefined,
    role: roleFilter || undefined,
    isBanned: banFilter ? banFilter === "true" : undefined,
  });

  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const [banTarget, setBanTarget] = useState<{ id: string; name: string } | null>(null);

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUser(
      { id: userId, data: { role: newRole } },
      {
        onSuccess: () => toast.success("User role updated"),
        onError: (err: any) => toast.error(err.message || "Failed to update role"),
      }
    );
  };

  const handleBanConfirm = (reason: string) => {
    if (!banTarget) return;
    updateUser(
      { id: banTarget.id, data: { isBanned: true, banReason: reason || undefined } },
      {
        onSuccess: () => { toast.success("User banned"); setBanTarget(null); },
        onError: (err: any) => toast.error(err.message || "Failed to ban account"),
      }
    );
  };

  const handleUnban = (userId: string) => {
    updateUser(
      { id: userId, data: { isBanned: false } },
      {
        onSuccess: () => toast.success("User unbanned"),
        onError: (err: any) => toast.error(err.message || "Failed to unban account"),
      }
    );
  };

  const users = usersData?.data || [];
  const totalPages =
    usersData?.page && usersData?.limit
      ? Math.ceil(usersData.total / usersData.limit)
      : 1;

  return (
    <div className="space-y-8">
      {banTarget && (
        <BanDialog
          userName={banTarget.name}
          onConfirm={handleBanConfirm}
          onCancel={() => setBanTarget(null)}
          isPending={isUpdating}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            Platform Management
          </span>
        </div>
        <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
          Platform Users
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
          Student Registrations & Access
        </p>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            className="pl-9 rounded-(--radius) bg-background/50 font-mono text-xs uppercase tracking-widest"
            value={search}
            onChange={(e) => {
              updateQueryParams({ search: e.target.value || null, page: "1" });
            }}
          />
        </div>
        <Select
          value={roleFilter || "all"}
          onValueChange={(value) => {
            updateQueryParams({
              role: value === "all" ? null : value,
              page: "1",
            });
          }}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[120px] rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
            <SelectItem
              value="all"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              All Roles
            </SelectItem>
            <SelectItem
              value="student"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Student
            </SelectItem>
            <SelectItem
              value="creator"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Creator
            </SelectItem>
            <SelectItem
              value="moderator"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Moderator
            </SelectItem>
            <SelectItem
              value="super_admin"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Admin
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={banFilter || "all"}
          onValueChange={(value) => {
            updateQueryParams({
              isBanned: value === "all" ? null : value,
              page: "1",
            });
          }}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[120px] rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
            <SelectItem
              value="all"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              All Status
            </SelectItem>
            <SelectItem
              value="false"
              className="rounded-(--radius) font-mono text-xs uppercase text-green-500"
            >
              Active
            </SelectItem>
            <SelectItem
              value="true"
              className="rounded-(--radius) font-mono text-xs uppercase text-destructive"
            >
              Banned
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="rounded-(--radius) font-mono text-[10px] tracking-widest uppercase gap-2"
        >
          <Download className="size-3.5" /> Export
        </Button>
      </div>

      {/* List */}
      <Card className="rounded-(--radius) border-border/50 bg-card/40 overflow-hidden">
        <CardHeader className="border-b border-border/10">
          <CardTitle className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            Registered Users {usersData?.total ? `(${usersData.total})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px] uppercase tracking-wider">
              <thead>
                <tr className="border-b border-border/5 bg-secondary/5">
                  <th className="px-6 py-4 font-bold text-muted-foreground">
                    User
                  </th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">
                    Role
                  </th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 font-bold text-muted-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground animate-pulse"
                    >
                      Retrieving platform user records…
                    </td>
                  </tr>
                ) : !users || users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center space-y-3"
                    >
                      <Users className="size-8 text-muted-foreground/30 mx-auto" />
                      <p className="text-xs font-bold">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-primary/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-zinc-800 border border-border/50 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-zinc-400">
                              {user.name?.[0]?.toUpperCase() ||
                                user.email?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-foreground font-bold">
                              {user.name || user.email}
                            </span>
                            <span className="text-[9px] text-muted-foreground lowercase tracking-normal">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          disabled={isUpdating}
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user._id, value)}
                        >
                          <SelectTrigger className="h-7 w-[110px] bg-transparent border-primary/20 text-[10px] font-bold uppercase transition-all hover:bg-primary/5">
                            <div className="flex items-center gap-1.5 truncate">
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 backdrop-blur-md border-primary/20">
                            <SelectItem value="student" className="text-[10px] font-bold uppercase">Student</SelectItem>
                            <SelectItem value="creator" className="text-[10px] font-bold uppercase">Creator</SelectItem>
                            <SelectItem value="moderator" className="text-[10px] font-bold uppercase">Moderator</SelectItem>
                            <SelectItem value="super_admin" className="text-[10px] font-bold uppercase">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="space-y-1">
                            <p className="text-[8px] text-muted-foreground">
                              Subscription
                            </p>
                            <span
                              className={cn(
                                "text-[9px] font-bold",
                                user.isSubscribed
                                  ? "text-green-500"
                                  : "text-zinc-500",
                              )}
                            >
                              {user.isSubscribed ? "PREMIUM" : "FREE"}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] text-muted-foreground">
                              Account
                            </p>
                            <span
                              className={cn(
                                "text-[9px] font-bold",
                                user.isBanned
                                  ? "text-destructive"
                                  : "text-green-500",
                              )}
                            >
                              {user.isBanned ? "BANNED" : "ACTIVE"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-(--radius) group-hover:bg-primary/10 group-hover:text-primary transition-all"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border-primary/20 p-1.5">
                            <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-muted-foreground px-2 py-1.5">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="gap-2 text-[10px] font-bold uppercase cursor-pointer rounded-(--radius) mb-0.5">
                              <UserIcon className="size-3" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-[10px] font-bold uppercase cursor-pointer rounded-(--radius) mb-0.5">
                              <ExternalLink className="size-3" /> External Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-primary/10 my-1.5" />
                            <DropdownMenuItem
                              onClick={() =>
                                user.isBanned
                                  ? handleUnban(user._id)
                                  : setBanTarget({ id: user._id, name: user.name ?? user.email })
                              }
                              className={cn(
                                "gap-2 text-[10px] font-bold uppercase cursor-pointer rounded-(--radius)",
                                user.isBanned ? "text-green-500 focus:text-green-500" : "text-destructive focus:text-destructive"
                              )}
                            >
                              {user.isBanned ? (
                                <><RotateCcw className="size-3" /> Unban Account</>
                              ) : (
                                <><Ban className="size-3" /> Ban Account</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <PaginationController
            page={page}
            totalPages={totalPages}
            onPageChange={(nextPage) =>
              updateQueryParams({ page: String(nextPage) })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ExternalLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}
