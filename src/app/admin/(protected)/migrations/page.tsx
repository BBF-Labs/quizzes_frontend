"use client";

import { motion } from "framer-motion";
import {
  Database,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Calendar,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMigrations, useRunMigrations } from "@/hooks";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

export default function MigrationsPage() {
  const { data: status, isLoading, refetch } = useMigrations();
  const runMutation = useRunMigrations();

  const handleRunMigrations = async () => {
    try {
      const response = await runMutation.mutateAsync();
      toast.success(response.message || "Migration job enqueued successfully.");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to enqueue migration job.");
    }
  };

  const executed = status?.executed || [];
  const pending = status?.pending || [];

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
            Infrastructure
          </span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
              Migrations
            </h1>
            <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
              Database Schema Management
            </p>
          </div>
          <div className="flex items-center gap-2">
             <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="rounded-(--radius) size-9"
              disabled={isLoading}
            >
              <RotateCw className={cn("size-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              onClick={handleRunMigrations}
              disabled={runMutation.isPending || pending.length === 0}
              className="rounded-(--radius) font-mono text-[10px] tracking-widest uppercase gap-2 h-9 px-4"
            >
              {runMutation.isPending ? (
                <RotateCw className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5" />
              )}
              Apply Pending ({pending.length})
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-(--radius) border-border/50 bg-card/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Executed
                </p>
                <p className="text-2xl font-mono font-bold">{executed.length}</p>
              </div>
              <CheckCircle2 className="size-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-(--radius) border-border/50 bg-card/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Pending
                </p>
                <p className="text-2xl font-mono font-bold text-blue-400">
                  {pending.length}
                </p>
              </div>
              <FileCode className="size-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-(--radius) border-border/50 bg-card/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Status
                </p>
                <p className={cn(
                  "text-xs font-mono font-bold uppercase tracking-widest",
                  pending.length > 0 ? "text-yellow-500" : "text-green-500"
                )}>
                  {pending.length > 0 ? "Updates Required" : "Up to date"}
                </p>
              </div>
              <Database className={cn(
                "size-8",
                pending.length > 0 ? "text-yellow-500/20" : "text-green-500/20"
              )} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History Table */}
        <Card className="lg:col-span-2 rounded-(--radius) border-border/50 bg-card/40 overflow-hidden">
          <CardHeader className="border-b border-border/10 bg-secondary/5">
            <div className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              <CardTitle className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                Run History
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[10px] uppercase tracking-wider">
                <thead>
                  <tr className="border-b border-border/5 bg-secondary/5">
                    <th className="px-6 py-4 font-bold text-muted-foreground">Script Name</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground">Executed At</th>
                    <th className="px-6 py-4 font-bold text-muted-foreground text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground animate-pulse">
                        Retrieving migration records…
                      </td>
                    </tr>
                  ) : executed.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                        No migration history found.
                      </td>
                    </tr>
                  ) : (
                    executed.slice().reverse().map((m) => (
                      <tr key={m.name} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-4 font-bold text-foreground">{m.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="size-3" />
                            {format(new Date(m.runAt), "MMM dd, yyyy HH:mm")}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="px-2 py-0.5 text-[9px] font-bold border border-green-500/50 text-green-500 bg-green-500/5">
                            SUCCESS
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pending Scripts */}
        <Card className="rounded-(--radius) border-border/50 bg-card/40 h-fit">
          <CardHeader className="border-b border-border/10 bg-secondary/5">
            <div className="flex items-center gap-2">
              <FileCode className="size-4 text-blue-400" />
              <CardTitle className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                Pending Scripts
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {pending.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="size-8 text-green-500/20 mx-auto" />
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">
                  All scripts applied. No actions required.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pending.map((file) => (
                  <div 
                    key={file}
                    className="flex items-center gap-3 p-3 rounded-(--radius) border border-border/30 bg-background/30 group"
                  >
                    <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[11px] font-mono text-foreground truncate flex-1">
                      {file}
                    </span>
                  </div>
                ))}
                <div className="mt-6 p-4 border border-blue-500/20 bg-blue-500/5 rounded-(--radius)">
                  <div className="flex gap-3">
                    <AlertCircle className="size-4 text-blue-400 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                        Ready to Sync
                      </p>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase leading-relaxed">
                        These scripts are waiting to be applied to the production engine.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
