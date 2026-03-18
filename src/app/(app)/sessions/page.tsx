"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, BookOpen, Clock, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import type { ZSession } from "@/types/session";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<ZSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: ZSession[] }>("/sessions")
      .then((res) => setSessions(res.data.data ?? []))
      .catch((err) =>
        setError(err?.response?.data?.message ?? "Failed to load sessions"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="inline-block border border-primary/60 px-2 py-1 mb-4 bg-primary/5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
              Study Sessions
            </span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Your Sessions
            </h1>
            <Link
              href="/sessions/new"
              className="flex items-center gap-2 border border-primary/60 bg-primary/5 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Plus className="size-3" />
              New Session
            </Link>
          </div>
          <div className="mt-4 h-px w-12 bg-primary/40" />
        </motion.div>

        {/* States */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse bg-card border border-border/40"
              />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}

        {!isLoading && !error && sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="flex size-16 items-center justify-center border border-primary/30 bg-primary/10">
              <BookOpen className="size-8 text-primary" />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              No sessions yet — start your first study session
            </p>
            <Link
              href="/sessions/new"
              className="mt-2 inline-flex items-center gap-2 bg-primary px-6 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-3.5" />
              Start Session
            </Link>
          </motion.div>
        )}

        {!isLoading && !error && sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3"
          >
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/sessions/${session.id}`}
                  className="group flex items-center gap-4 border border-border/50 bg-card/40 px-4 py-4 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center border border-primary/30 bg-primary/10">
                    <BookOpen className="size-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate font-mono text-sm font-bold uppercase tracking-wide">
                      {session.title || `Session ${session.id.slice(0, 6)}`}
                    </p>
                    {session.subject && (
                      <p className="truncate text-[11px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                        {session.subject}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60">
                      <Clock className="size-2.5" />
                      <span>
                        {new Date(session.updatedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border",
                        session.status === "active"
                          ? "border-green-500/40 bg-green-500/10 text-green-500"
                          : session.status === "completed"
                            ? "border-border/50 bg-muted/30 text-muted-foreground"
                            : "border-amber-500/40 bg-amber-500/10 text-amber-500",
                      )}
                    >
                      {session.status}
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
