"use client";

import Link from "next/link";
import { useStudyRooms } from "@/hooks/study-rooms/use-study-rooms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, Rocket, Timer, Lock } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { CreateRoomDialog } from "@/components/study-rooms/create-room-dialog";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { cn } from "@/lib/utils";

const buildAvatar = (seed: string) =>
  createAvatar(avataaars, {
    seed: seed || "user",
    backgroundColor: ["d1d4f9", "c0aede", "b6e3f4", "ffd5dc"],
  }).toDataUri();

export default function StudyRoomsPage() {
  const { data: rooms = [], isLoading } = useStudyRooms();
  const user = getSessionUser();
  const [search, setSearch] = useState("");

  const filteredRooms = useMemo(
    () =>
      rooms.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.roomCode.toLowerCase().includes(search.toLowerCase()) ||
          (r.topic || "").toLowerCase().includes(search.toLowerCase()),
      ),
    [rooms, search],
  );

  const activeCount = rooms.filter((r) => r.timer?.isRunning).length;
  const openCount = rooms.filter((r) => !r.isLocked).length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">

        {/* ── Hero ── */}
        <header className="mb-12 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="space-y-3 text-center md:text-left">
            <Badge
              variant="outline"
              className="rounded-(--radius) border-primary/30 bg-primary/5 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary"
            >
              Live Sessions
            </Badge>
            <h1 className="text-4xl font-black italic tracking-tight text-foreground sm:text-6xl uppercase">
              Study <span className="text-primary">Sprints</span>
            </h1>
            <p className="max-w-md text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground leading-relaxed">
              Global study protocol. Join a room, set a timer, and grind with the crew.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            {user ? (
              <CreateRoomDialog>
                <Button
                  size="lg"
                  className="rounded-(--radius) h-14 px-12 text-sm font-bold uppercase tracking-[0.2em] shadow-sm transition-transform active:scale-[0.98]"
                >
                  Start New Session
                </Button>
              </CreateRoomDialog>
            ) : (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-(--radius) h-14 border-border/50 px-12 text-sm font-bold uppercase tracking-[0.2em]"
              >
                <Link href="/login">Login to Create</Link>
              </Button>
            )}
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              {rooms.length} room{rooms.length !== 1 ? "s" : ""} active
            </p>
          </div>
        </header>

        {/* ── Search + stats bar ── */}
        <div className="mb-10 flex flex-col gap-4 border-b border-border/50 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, code or topic…"
              className="rounded-(--radius) h-11 border-border/50 pl-10 font-mono text-sm focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1.5 text-emerald-500">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              {activeCount} running
            </div>
            <div className="h-4 w-px bg-border/50" />
            <div className="text-muted-foreground">{openCount} open</div>
          </div>
        </div>

        {/* ── Room grid ── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-(--radius) border overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-2 w-full rounded-none" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-2 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-(--radius) border border-border/50 bg-muted text-muted-foreground">
                <Rocket className="size-10" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
                No rooms found
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                Try a different search, or start your own session.
              </p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const activeParticipants = (room.participants || []).filter((p) => !p.leftAt);
              const fillPercent = (activeParticipants.length / (room.maxParticipants || 1)) * 100;
              const isRunning = room.timer?.isRunning;

              return (
                <Link key={room._id} href={`/study-rooms/${room.roomCode}`}>
                  <Card className="group relative h-full overflow-hidden rounded-(--radius) border border-border/50 bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-lg">
                    {/* Running indicator bar */}
                    <div
                      className={cn(
                        "h-0.5 w-full transition-colors",
                        isRunning ? "bg-emerald-500 animate-pulse" : "bg-border/30",
                      )}
                    />

                    <CardContent className="p-5">
                      {/* Top row */}
                      <div className="mb-4 flex items-start justify-between gap-2">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-(--radius) bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Users className="size-4" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isRunning && (
                            <Badge className="rounded-(--radius) gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-mono font-bold uppercase tracking-wider">
                              <Timer className="size-2.5" /> Live
                            </Badge>
                          )}
                          {room.isLocked ? (
                            <Badge variant="destructive" className="rounded-(--radius) text-[9px] font-mono font-bold uppercase tracking-wider">
                              <Lock className="mr-1 size-2.5" /> Locked
                            </Badge>
                          ) : (
                            <Badge className="rounded-(--radius) bg-emerald-500 text-[9px] font-mono font-bold uppercase tracking-wider text-white">
                              Open
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Room info */}
                      <h3 className="mb-1 font-mono text-sm font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
                        {room.title}
                      </h3>
                      <p className="mb-5 min-h-[2.25rem] line-clamp-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/70">
                        {room.topic || "Intense focus session. Join the grind."}
                      </p>

                      {/* Capacity bar */}
                      <div className="space-y-2 border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground">
                          <span>Capacity</span>
                          <span className="text-foreground">
                            {activeParticipants.length} / {room.maxParticipants}
                          </span>
                        </div>
                        <Progress value={fillPercent} className="h-1 rounded-(--radius) bg-muted" />

                        {/* Footer row */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                            {room.roomCode}
                          </span>

                          {/* Participant avatar stack */}
                          <div className="flex -space-x-2">
                            {activeParticipants.slice(0, 4).map((p, i) => (
                              <img
                                key={p.userId || p.guestId || i}
                                src={buildAvatar(p.displayName)}
                                alt={p.displayName}
                                className="size-6 rounded-full border-2 border-background bg-muted shadow-sm"
                              />
                            ))}
                            {activeParticipants.length > 4 && (
                              <div className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-primary text-[8px] font-bold text-primary-foreground">
                                +{activeParticipants.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

