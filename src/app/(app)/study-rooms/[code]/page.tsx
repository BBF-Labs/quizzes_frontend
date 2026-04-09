"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  useInviteByEmail,
  useInviteByUsername,
  useJoinStudyRoom,
  useSendStudyRoomMessage,
  useStudyRoom,
  useUpdateStudyRoomTimer,
} from "@/hooks/study-rooms/use-study-rooms";
import { useStudyRoomSocket } from "@/hooks/study-rooms/use-study-room-socket";
import { getSessionUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

const ensureGuestId = (): string => {
  const key = "study_room_guest_id";
  const existing = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (existing) return existing;
  const next = `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (typeof window !== "undefined") localStorage.setItem(key, next);
  return next;
};

type RoomChallenge = {
  id: "race_50" | "cycles_5" | "messages_20";
  name: string;
  description: string;
  target: number;
};

const CHALLENGES: RoomChallenge[] = [
  {
    id: "race_50",
    name: "Race to 50",
    description: "First player to hit 50 points wins.",
    target: 50,
  },
  {
    id: "cycles_5",
    name: "Focus Five",
    description: "Complete 5 timer cycles as a room.",
    target: 5,
  },
  {
    id: "messages_20",
    name: "Discussion Sprint",
    description: "Send 20 messages in this room.",
    target: 20,
  },
];

export default function StudyRoomDetailPage() {
  const params = useParams<{ code: string }>();
  const code = String(params?.code || "").toUpperCase();
  const user = getSessionUser();
  const join = useJoinStudyRoom();
  const sendMessage = useSendStudyRoomMessage();
  const inviteByUsername = useInviteByUsername();
  const inviteByEmail = useInviteByEmail();
  const updateTimer = useUpdateStudyRoomTimer();
  const { data, refetch } = useStudyRoom(code);

  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [usernameInvite, setUsernameInvite] = useState("");
  const [emailInvite, setEmailInvite] = useState("");
  const [selectedChallengeId, setSelectedChallengeId] =
    useState<RoomChallenge["id"]>("race_50");

  useStudyRoomSocket(code, {
    onPresence: () => refetch(),
    onMessage: () => refetch(),
    onTimer: () => refetch(),
    onLocked: () => refetch(),
    onEnded: () => refetch(),
  });

  const room = data?.room;
  const messages = data?.messages || [];
  const leaderboard = data?.leaderboard || [];
  const leaderboardTop = leaderboard[0];
  const myScore =
    leaderboard.find((p: any) => p.displayName === (user?.name || guestName))?.points || 0;
  const timerProgress =
    room && room.timer?.durationSeconds
      ? Math.round(
          ((room.timer.durationSeconds - room.timer.remainingSeconds) /
            room.timer.durationSeconds) *
            100,
        )
      : 0;
  const selectedChallenge = CHALLENGES.find((c) => c.id === selectedChallengeId)!;
  const challengeValue = useMemo(() => {
    if (selectedChallengeId === "race_50") return leaderboardTop?.points || 0;
    if (selectedChallengeId === "cycles_5") return room?.timer?.cycle || 0;
    return messages.length;
  }, [selectedChallengeId, leaderboardTop?.points, room?.timer?.cycle, messages.length]);
  const challengeProgress = Math.max(
    0,
    Math.min(100, Math.round((challengeValue / selectedChallenge.target) * 100)),
  );
  const challengeComplete = challengeValue >= selectedChallenge.target;

  const earnedBadges = useMemo(() => {
    const badges: string[] = [];
    if (myScore >= 10) badges.push("Rookie");
    if (myScore >= 25) badges.push("Focused");
    if (myScore >= 50) badges.push("Challenger");
    if ((room?.timer?.cycle || 0) >= 3) badges.push("Pomodoro Pro");
    if (messages.length >= 10) badges.push("Contributor");
    return badges;
  }, [myScore, room?.timer?.cycle, messages.length]);
  const isHost = useMemo(() => {
    if (!room || !user?.id) return false;
    return String(room.hostId) === user.id || room.participants?.some((p: any) => p.userId === user.id && p.role === "host");
  }, [room, user?.id]);

  const onJoin = async () => {
    try {
      const guestId = user ? undefined : ensureGuestId();
      if (!user && typeof window !== "undefined") {
        localStorage.setItem("study_room_guest_name", guestName || "Guest");
      }
      await join.mutateAsync({ code, roomCode: code, guestName: user ? undefined : guestName || "Guest", guestId });
      toast.success("Joined room");
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to join room");
    }
  };

  const onSend = async () => {
    if (!message.trim()) return;
    try {
      const guestId = user ? undefined : ensureGuestId();
      await sendMessage.mutateAsync({
        code,
        content: message.trim(),
        guestName: user ? undefined : guestName || "Guest",
        guestId,
      });
      setMessage("");
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Message failed");
    }
  };

  const onTimer = async (action: "start" | "pause" | "reset" | "tickComplete") => {
    try {
      await updateTimer.mutateAsync({ code, action });
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Timer update failed");
    }
  };

  if (!room) {
    return <main className="p-6">Loading room...</main>;
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-4 p-6 lg:grid-cols-[2fr_1fr]">
      <section className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{room.title}</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{room.roomCode}</Badge>
            <Badge variant={room.visibility === "open" ? "secondary" : "outline"}>
              {room.visibility}
            </Badge>
            <Badge variant={room.isLocked ? "destructive" : "secondary"}>
              {room.isLocked ? "Locked" : "Unlocked"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Compete with friends, complete focus cycles, and top the room leaderboard.
          </p>
          {!user ? (
            <div className="mt-3 flex gap-2">
              <Input placeholder="Guest display name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              <Button variant="outline" onClick={onJoin}>Join as guest</Button>
            </div>
          ) : (
            <Button variant="outline" className="mt-3" onClick={onJoin}>Join room</Button>
          )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Timer</CardTitle></CardHeader>
          <CardContent>
          <p className="text-2xl font-semibold">{Math.floor((room.timer?.remainingSeconds || 0) / 60)}m {(room.timer?.remainingSeconds || 0) % 60}s</p>
          <p className="text-sm text-muted-foreground">Cycle {room.timer?.cycle || 0}</p>
          <div className="mt-3">
            <Progress value={Math.max(0, Math.min(100, timerProgress))} />
          </div>
          {isHost ? (
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={() => onTimer("start")}>Start</Button>
              <Button variant="outline" onClick={() => onTimer("pause")}>Pause</Button>
              <Button variant="outline" onClick={() => onTimer("reset")}>Reset</Button>
              <Button variant="outline" onClick={() => onTimer("tickComplete")}>Complete</Button>
            </div>
          ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Chat</CardTitle></CardHeader>
          <CardContent>
          <ScrollArea className="mb-3 h-[22rem] border p-2">
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m._id} className="border p-2">
                <p className="text-xs text-muted-foreground">{m.senderName}</p>
                <p>{m.content}</p>
              </div>
            ))}
          </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input className="flex-1" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Send a message" />
            <Button variant="outline" onClick={onSend}>Send</Button>
          </div>
          </CardContent>
        </Card>
      </section>

      <aside className="grid gap-4">
        <Card>
          <CardHeader><CardTitle>Gamify</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              {CHALLENGES.map((challenge) => (
                <Button
                  key={challenge.id}
                  size="sm"
                  variant={selectedChallengeId === challenge.id ? "default" : "outline"}
                  onClick={() => setSelectedChallengeId(challenge.id)}
                >
                  {challenge.name}
                </Button>
              ))}
            </div>
            <div className="border p-3">
              <p className="font-medium">{selectedChallenge.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedChallenge.description}
              </p>
              <div className="mt-2 space-y-2">
                <Progress value={challengeProgress} />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {challengeValue}/{selectedChallenge.target}
                  </span>
                  <Badge variant={challengeComplete ? "secondary" : "outline"}>
                    {challengeComplete ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border p-2">
              <span className="text-sm text-muted-foreground">Top player</span>
              <Badge>{leaderboardTop?.displayName || "—"}</Badge>
            </div>
            <div className="flex items-center justify-between border p-2">
              <span className="text-sm text-muted-foreground">Top points</span>
              <Badge variant="secondary">{leaderboardTop?.points || 0}</Badge>
            </div>
            <div className="flex items-center justify-between border p-2">
              <span className="text-sm text-muted-foreground">Your points</span>
              <Badge variant="outline">{myScore}</Badge>
            </div>
            <div className="border p-2">
              <p className="mb-2 text-sm text-muted-foreground">Earned badges</p>
              <div className="flex flex-wrap gap-2">
                {earnedBadges.length === 0 ? (
                  <Badge variant="outline">No badges yet</Badge>
                ) : (
                  earnedBadges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Participants</CardTitle></CardHeader>
          <CardContent>
          <div className="space-y-2">
            {room.participants?.filter((p) => !p.leftAt).map((p: any) => (
              <div key={`${p.userId || p.guestId}`} className="flex justify-between border p-2">
                <span>{p.displayName}</span>
                <Badge variant="outline">{p.role}</Badge>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leaderboard</CardTitle></CardHeader>
          <CardContent>
          <div className="space-y-2">
            {leaderboard.map((p: any, i: number) => (
              <div key={`${p.displayName}_${i}`} className="flex justify-between border p-2">
                <span>{p.displayName}</span>
                <Badge>{p.points || 0}</Badge>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>

        {isHost ? (
          <Card>
            <CardHeader><CardTitle>Invites</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
            <Input placeholder="Username" value={usernameInvite} onChange={(e) => setUsernameInvite(e.target.value)} />
            <Button variant="outline" onClick={async () => {
              try {
                await inviteByUsername.mutateAsync({ code, username: usernameInvite.trim() });
                setUsernameInvite("");
                toast.success("Username invite sent");
              } catch (error: any) {
                toast.error(error?.response?.data?.message || "Invite failed");
              }
            }}>Invite by username</Button>
            <Input placeholder="Email" value={emailInvite} onChange={(e) => setEmailInvite(e.target.value)} />
            <Button variant="outline" onClick={async () => {
              try {
                await inviteByEmail.mutateAsync({ code, email: emailInvite.trim() });
                setEmailInvite("");
                toast.success("Email invite sent");
              } catch (error: any) {
                toast.error(error?.response?.data?.message || "Invite failed");
              }
            }}>Invite by email</Button>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/study-rooms/${code}`)}>
              Copy room link
            </Button>
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </main>
  );
}

