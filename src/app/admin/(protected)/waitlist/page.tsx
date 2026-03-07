"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Search,
  Filter,
  Rocket,
  Calendar,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWaitlist } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function WaitlistPage() {
  const [search, setSearch] = useState("");
  const { data: waitlist, isLoading } = useWaitlist({ search });
  console.log("Waitlist data:", waitlist);
  const waitlistEntries = waitlist?.data ?? [];

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
            Access Control
          </span>
        </div>
        <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
          Waitlist
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
          Early Access Queue
        </p>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            className="pl-9 rounded-none bg-background/50 font-mono text-xs uppercase tracking-widest"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 flex-1 sm:flex-none"
          >
            <Filter className="size-3.5" /> Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 flex-1 sm:flex-none"
          >
            <Rocket className="size-3.5" /> Bulk Invite
          </Button>
        </div>
      </div>

      {/* List */}
      <Card className="rounded-none border-border/50 bg-card/40 overflow-hidden">
        <CardHeader className="border-b border-border/10">
          <CardTitle className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            Queue Status {waitlist?.total ? `(${waitlist.total})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px] uppercase tracking-wider">
              <thead>
                <tr className="border-b border-border/5 bg-secondary/5">
                  <th className="px-6 py-4 font-bold text-muted-foreground">
                    Entry
                  </th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">
                    University
                  </th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">
                    Joined
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
                      colSpan={5}
                      className="px-6 py-12 text-center text-muted-foreground animate-pulse"
                    >
                      Retrieving waitlist from engine…
                    </td>
                  </tr>
                ) : waitlistEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center space-y-3"
                    >
                      <UserPlus className="size-8 text-muted-foreground/30 mx-auto" />
                      <p className="text-xs font-bold">
                        No waitlist entries found
                      </p>
                    </td>
                  </tr>
                ) : (
                  waitlistEntries.map((entry) => (
                    <tr
                      key={entry._id}
                      className="hover:bg-primary/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground font-bold">
                            {entry.name || "Anonymous User"}
                          </span>
                          <span className="text-[9px] text-muted-foreground lowercase tracking-normal">
                            {entry.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {entry.university || "Not specified"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3" />
                          {format(new Date(entry.createdAt), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[9px] font-bold border",
                            entry.waitlistStatus === "active"
                              ? "border-blue-500/50 text-blue-500 bg-blue-500/5"
                              : "border-zinc-500/50 text-zinc-500 bg-zinc-500/5",
                          )}
                        >
                          {entry.waitlistStatus || "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-none group-hover:bg-primary/10 group-hover:text-primary transition-all"
                            title="Send Invitation"
                          >
                            <Mail className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-none group-hover:bg-green-500/10 group-hover:text-green-500 transition-all"
                            title="Approve"
                          >
                            <CheckCircle2 className="size-3.5" />
                          </Button>
                        </div>
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
