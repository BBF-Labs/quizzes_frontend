"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Clock3, Search } from "lucide-react";
import { useSessions } from "@/hooks";
import { cn } from "@/lib/utils";

export default function AllChatsPage() {
  const { data: sessions = [], isLoading, error } = useSessions();
  const [query, setQuery] = useState("");

  const filtered = sessions.filter((s) => {
    if (!query.trim()) return true;
    const title = s.title || "";
    return title.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-block border border-primary/40 bg-primary/5 px-2 py-1 mb-4">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-primary">
              All Chats
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">
            Your Sessions
          </h1>
          <div className="mt-4 h-px w-10 bg-primary/40" />
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions…"
            className="w-full border border-border/50 bg-card/40 pl-9 pr-4 py-2.5 text-[12px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse bg-card/40 border border-border/30"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 font-mono text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load sessions"}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="flex size-14 items-center justify-center border border-primary/20 bg-primary/5">
              <BookOpen className="size-6 text-primary/60" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
              {query ? "No sessions match your search" : "No sessions yet"}
            </p>
            {!query && (
              <Link
                href="/app"
                className="mt-1 inline-block text-[10px] font-mono uppercase tracking-widest text-primary hover:underline"
              >
                Start your first session →
              </Link>
            )}
          </motion.div>
        )}

        {/* List */}
        {!isLoading && !error && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2"
          >
            {filtered.map((session, i) => {
              const title = session.title || `Chat ${session._id.slice(0, 8)}`;
              return (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/app/${session._id}`}
                    className="group flex items-center gap-3 border border-border/40 bg-card/30 px-4 py-3.5 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <Clock3 className="size-4 text-muted-foreground/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[12px] font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                        {title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                          {session.mode}
                        </span>
                        {session.startedAt && (
                          <span className="text-[10px] font-mono text-muted-foreground/40">
                            {new Date(session.startedAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border shrink-0",
                        session.status === "active"
                          ? "border-green-500/40 bg-green-500/10 text-green-500"
                          : "border-border/50 bg-muted/30 text-muted-foreground",
                      )}
                    >
                      {session.status}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Count */}
        {!isLoading && sessions.length > 0 && (
          <p className="mt-6 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30">
            {filtered.length} of {sessions.length} sessions
          </p>
        )}
      </div>
    </div>
  );
}
