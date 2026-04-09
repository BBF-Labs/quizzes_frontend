"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateStudyRoom, useStudyRooms } from "@/hooks/study-rooms/use-study-rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMER_PRESETS = [15, 25, 45, 60];
const CAPACITY_PRESETS = [10, 25, 50, 100];

export default function StudyRoomsPage() {
  const { data: rooms = [], isLoading } = useStudyRooms();
  const createRoom = useCreateStudyRoom();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [visibility, setVisibility] = useState<"open" | "closed">("open");
  const [maxParticipants, setMaxParticipants] = useState(25);
  const [timerMinutes, setTimerMinutes] = useState(25);

  const canSubmit = useMemo(() => title.trim().length > 1, [title]);

  const onCreate = async () => {
    if (!canSubmit) return;
    try {
      const created = await createRoom.mutateAsync({
        title: title.trim(),
        topic: topic.trim() || undefined,
        visibility,
        maxParticipants,
        timerMinutes,
      });
      toast.success("Study room created");
      window.location.href = `/study-rooms/${created.roomCode}`;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create room");
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl overflow-y-auto no-scrollbar p-6">
      <div className="flex flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Study Rooms</h1>
        <p className="text-sm text-muted-foreground">
          Sprint together, chat live, and climb the session leaderboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a room</CardTitle>
          <CardDescription>
            Start a focused challenge session with smart defaults and quick presets.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="study-room-title">Room title</Label>
            <Input
              id="study-room-title"
              placeholder="e.g. MATH 201 Night Sprint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="study-room-topic">Session goal / topic</Label>
            <Textarea
              id="study-room-topic"
              placeholder="What are you all trying to achieve in this room?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label>Room visibility</Label>
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility(v as "open" | "closed")}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open (anyone can join)</SelectItem>
                <SelectItem value="closed">Closed (invite only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Timer length (minutes)</Label>
            <div className="flex flex-wrap gap-2">
              {TIMER_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant={timerMinutes === preset ? "default" : "outline"}
                  onClick={() => setTimerMinutes(preset)}
                >
                  {preset}m
                </Button>
              ))}
              <Input
                className="w-28"
                type="number"
                min={5}
                max={180}
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Number(e.target.value || 25))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Max participants</Label>
            <div className="flex flex-wrap gap-2">
              {CAPACITY_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant={maxParticipants === preset ? "default" : "outline"}
                  onClick={() => setMaxParticipants(preset)}
                >
                  {preset}
                </Button>
              ))}
              <Input
                className="w-28"
                type="number"
                min={2}
                max={300}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value || 25))}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{visibility === "open" ? "Open room" : "Invite only"}</Badge>
            <Badge variant="outline">{timerMinutes}m focus cycles</Badge>
            <Badge variant="outline">Max {maxParticipants} people</Badge>
          </div>

          <Button
            className="w-full sm:w-fit"
            disabled={!canSubmit || createRoom.isPending}
            onClick={onCreate}
          >
            {createRoom.isPending ? "Creating..." : "Create Room"}
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <h2 className="text-lg font-medium">Active rooms</h2>
        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`room-skeleton-${index}`} className="py-0 border border-border/40 bg-card/30">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-48 rounded-none" />
                      <Skeleton className="h-3 w-40 rounded-none" />
                      <div className="pt-1">
                        <Skeleton className="h-2 w-full max-w-sm rounded-none" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-12 rounded-none" />
                      <Skeleton className="h-6 w-20 rounded-none" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
        {!isLoading && rooms.length === 0 ? (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground">
                No active rooms yet. Create one and invite your study crew.
              </p>
            </CardContent>
          </Card>
        ) : null}
        {rooms.map((room) => (
          <Card key={room._id} className="py-0">
            <CardContent className="flex items-center justify-between py-4">
              <Link href={`/study-rooms/${room.roomCode}`} className="min-w-0 flex-1">
                <p className="font-medium">{room.title}</p>
                <p className="text-sm text-muted-foreground">
                  {room.visibility} · {room.participants?.length || 0}/{room.maxParticipants}
                </p>
                <div className="mt-2 max-w-sm">
                  <Progress
                    value={Math.min(
                      100,
                      Math.round(
                        ((room.participants?.length || 0) / Math.max(room.maxParticipants, 1)) *
                          100,
                      ),
                    )}
                  />
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Live</Badge>
                <Badge variant="outline">{room.roomCode}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      </div>
    </main>
  );
}

