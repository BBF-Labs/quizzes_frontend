"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, Download, UserCheck, Shield, GraduationCap, Calendar, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useUsers({ search });

  return (
    <div className="space-y-8">
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or username..." 
            className="pl-9 rounded-none bg-background/50 font-mono text-xs uppercase tracking-widest"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 flex-1 sm:flex-none">
            <Filter className="size-3.5" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 flex-1 sm:flex-none">
            <Download className="size-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* List */}
      <Card className="rounded-none border-border/50 bg-card/40 overflow-hidden">
        <CardHeader className="border-b border-border/10">
          <CardTitle className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            Registered Users {users?.total ? `(${users.total})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px] uppercase tracking-wider">
              <thead>
                <tr className="border-b border-border/5 bg-secondary/5">
                  <th className="px-6 py-4 font-bold text-muted-foreground">User</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">Role</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground animate-pulse">
                      Retrieving platform user records…
                    </td>
                  </tr>
                ) : !users?.data || users.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center space-y-3">
                      <Users className="size-8 text-muted-foreground/30 mx-auto" />
                      <p className="text-xs font-bold">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users?.data.map((user: any) => (
                    <tr key={user._id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-zinc-800 border border-border/50 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-zinc-400">{user.username?.[0]?.toUpperCase()}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-foreground font-bold">{user.name || user.username}</span>
                            <span className="text-[9px] text-muted-foreground lowercase tracking-normal">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {user.role === 'admin' || user.role === 'super_admin' ? (
                            <Shield className="size-3 text-blue-500" />
                          ) : (
                            <GraduationCap className="size-3 text-zinc-500" />
                          )}
                          <span className="text-muted-foreground">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                           <div className="space-y-1">
                              <p className="text-[8px] text-muted-foreground">Subscription</p>
                              <span className={cn(
                                "text-[9px] font-bold",
                                user.isSubscribed ? "text-green-500" : "text-zinc-500"
                              )}>
                                {user.isSubscribed ? "PREMIUM" : "FREE"}
                              </span>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[8px] text-muted-foreground">Account</p>
                              <span className={cn(
                                "text-[9px] font-bold",
                                user.isBanned ? "text-destructive" : "text-green-500"
                              )}>
                                {user.isBanned ? "BANNED" : "ACTIVE"}
                              </span>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="size-8 rounded-none group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          <ExternalLink className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExternalLink(props: any) {
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
