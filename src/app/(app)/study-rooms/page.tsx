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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Study Rooms</h1>
        <p className="text-sm text-muted-foreground">
          Sprint together, chat live, and climb the session leaderboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a room</CardTitle>
          <CardDescription>Start an open or closed session with a shared timer.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input placeholder="Room title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Topic (optional)" value={topic} onChange={(e) => setTopic(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Select value={visibility} onValueChange={(v) => setVisibility(v as "open" | "closed")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Input className="w-40" type="number" min={2} max={300} value={maxParticipants} onChange={(e) => setMaxParticipants(Number(e.target.value || 25))} />
            <Input className="w-40" type="number" min={5} max={180} value={timerMinutes} onChange={(e) => setTimerMinutes(Number(e.target.value || 25))} />
          </div>
          <Button className="w-fit" disabled={!canSubmit || createRoom.isPending} onClick={onCreate}>
            {createRoom.isPending ? "Creating..." : "Create Room"}
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <h2 className="text-lg font-medium">Active rooms</h2>
        {isLoading ? <p>Loading rooms...</p> : null}
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
    </main>
  );
}

