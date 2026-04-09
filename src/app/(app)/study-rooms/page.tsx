"use client";

import Link from "next/link";
import { useStudyRooms } from "@/hooks/study-rooms/use-study-rooms";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, Rocket, Trophy, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { CreateRoomDialog } from "@/components/study-rooms/create-room-dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function StudyRoomsPage() {
  const { data: rooms = [], isLoading } = useStudyRooms();
  const user = getSessionUser();
  const [search, setSearch] = useState("");

  const filteredRooms = rooms.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.roomCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        {/* Hero Section */}
        <header className="mb-12 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Sparkles className="size-3" /> Live Sessions
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl text-foreground uppercase italic">
              Study <span className="text-primary">Sprints</span>
            </h1>
            <p className="max-w-md text-xs font-mono uppercase tracking-widest text-muted-foreground mt-4 leading-relaxed">
              Global study protocol. Join a room, set a timer, and track your performance with the crew.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            {user ? (
              <CreateRoomDialog>
                <Button size="lg" className="rounded-(--radius) px-12 h-14 text-sm font-bold uppercase tracking-[0.2em] shadow-sm transition-transform active:scale-[0.98]">
                  Start New Session
                </Button>
              </CreateRoomDialog>
            ) : (
                <Button asChild size="lg" variant="outline" className="rounded-(--radius) border-border/50 px-12 h-14 text-sm font-bold uppercase tracking-[0.2em] shadow-sm">
                    <Link href="/login">Login to Create</Link>
                </Button>
            )}
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
               {rooms.length} Ready for dispatch
            </p>
          </div>
        </header>

        {/* Search & Filters */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-8">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder="Search session code..." 
                    className="rounded-(--radius) border-border/50 pl-10 focus-visible:ring-primary h-12 text-sm font-mono uppercase"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="rounded-(--radius) border-2 px-3 py-1 font-bold">
                    Ongoing: {rooms.filter(r => r.timer?.isRunning).length}
                </Badge>
                <Badge variant="outline" className="rounded-(--radius) border-2 px-3 py-1 font-bold">
                    Available: {rooms.filter(r => !r.isLocked).length}
                </Badge>
            </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-(--radius) border-2 overflow-hidden shadow-sm">
                <CardContent className="p-0">
                  <Skeleton className="h-32 w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4 rounded-(--radius)" />
                    <Skeleton className="h-4 w-1/2 rounded-(--radius)" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full py-20 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-6">
                    <Rocket className="size-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No rooms found</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">Try searching for something else or start your own study session.</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <Link key={room._id} href={`/study-rooms/${room.roomCode}`}>
                <Card className="group relative h-full overflow-hidden border border-border/50 rounded-(--radius) bg-card transition-all hover:border-primary/50 hover:shadow-xl shadow-sm">
                  <div className="absolute right-4 top-4 z-10">
                    {room.isLocked ? (
                        <Badge variant="destructive" className="rounded-(--radius) font-black uppercase tracking-widest text-[10px]">Locked</Badge>
                    ) : (
                        <Badge className="rounded-(--radius) bg-emerald-500 font-black uppercase tracking-widest text-[10px] text-white">Open</Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Users className="size-5" />
                    </div>

                    <h3 className="mb-2 text-lg font-mono font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {room.title}
                    </h3>
                    
                    <p className="mb-6 line-clamp-2 min-h-[2.5rem] text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/80">
                      {room.topic || "Intense focus session. Join the grind."}
                    </p>

                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                        <span>Progress</span>
                        <span className="text-slate-900 dark:text-white">
                            {room.participants?.length || 0} / {room.maxParticipants}
                        </span>
                      </div>
                      <Progress 
                        value={((room.participants?.length || 0) / (room.maxParticipants || 1)) * 100} 
                        className="h-2 rounded-(--radius) bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            <Trophy className="size-3" /> {room.roomCode}
                        </div>
                        <div className="flex -space-x-2">
                            {room.participants?.slice(0, 3).map((p, i) => (
                                <div key={i} className="size-6 rounded-full border-2 border-white bg-slate-200 dark:border-slate-800" />
                            ))}
                            {(room.participants?.length || 0) > 3 && (
                                <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-[8px] font-bold text-indigo-600 dark:border-slate-800">
                                    +{(room.participants?.length || 0) - 3}
                                </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

