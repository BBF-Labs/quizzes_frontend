"use client";

import { useMemo, useRef, useState } from "react";
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
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const roomSocket = useStudyRoomSocket(code, {
    onPresence: () => refetch(),
    onMessage: () => refetch(),
    onTimer: () => refetch(),
    onLocked: () => refetch(),
    onEnded: () => refetch(),
    onTyping: (payload) => {
      const senderName = String(payload?.senderName || "");
      if (!senderName) return;
      const myDisplayName =
        user?.name ||
        (typeof window !== "undefined"
          ? localStorage.getItem("study_room_guest_name") || guestName
          : guestName);
      if (senderName === myDisplayName) return;
      const isTyping = Boolean(payload?.isTyping);
      setTypingUsers((prev) => {
        if (isTyping) return prev.includes(senderName) ? prev : [...prev, senderName];
        return prev.filter((name) => name !== senderName);
      });
    },
  });

  const room = data?.room;
  const messages = data?.messages || [];
  const leaderboard = data?.leaderboard || [];
  const leaderboardTop = leaderboard[0];
  const activeParticipants = room?.participants?.filter((p: any) => !p.leftAt) || [];
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
      roomSocket.emitTyping(false, user?.name || guestName || "Guest");
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

  const onMessageChange = (value: string) => {
    setMessage(value);
    const displayName = user?.name || guestName || "Guest";
    const isTyping = value.trim().length > 0;
    roomSocket.emitTyping(isTyping, displayName);
    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
    }
    typingStopTimeoutRef.current = setTimeout(() => {
      roomSocket.emitTyping(false, displayName);
    }, 1400);
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

  const primaryLabel = activeParticipants[0]?.displayName || "Someone";
  const othersCount = Math.max(0, activeParticipants.length - 1);

  return (
    <main className="mx-auto grid max-w-[96rem] gap-4 p-4 md:p-6 lg:grid-cols-[22rem_minmax(0,1fr)_26rem]">
      <aside className="grid gap-4">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>{room.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{room.roomCode}</Badge>
              <Badge variant={room.visibility === "open" ? "secondary" : "outline"}>
                {room.visibility}
              </Badge>
              <Badge variant={room.isLocked ? "destructive" : "secondary"}>
                {room.isLocked ? "Locked" : "Unlocked"}
              </Badge>
            </div>
            {!user ? (
              <div className="grid gap-2">
                <Input
                  className="rounded-none"
                  placeholder="Guest display name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
                <Button className="rounded-none" variant="outline" onClick={onJoin}>
                  Join as guest
                </Button>
              </div>
            ) : (
              <Button className="rounded-none" variant="outline" onClick={onJoin}>
                Join room
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader><CardTitle>Gamify</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              {CHALLENGES.map((challenge) => (
                <Button
                  key={challenge.id}
                  size="sm"
                  className="rounded-none"
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

        <Card className="rounded-none">
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

        <Card className="rounded-none">
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
          <Card className="rounded-none">
            <CardHeader><CardTitle>Invites</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
            <Input className="rounded-none" placeholder="Username" value={usernameInvite} onChange={(e) => setUsernameInvite(e.target.value)} />
            <Button className="rounded-none" variant="outline" onClick={async () => {
              try {
                await inviteByUsername.mutateAsync({ code, username: usernameInvite.trim() });
                setUsernameInvite("");
                toast.success("Username invite sent");
              } catch (error: any) {
                toast.error(error?.response?.data?.message || "Invite failed");
              }
            }}>Invite by username</Button>
            <Input className="rounded-none" placeholder="Email" value={emailInvite} onChange={(e) => setEmailInvite(e.target.value)} />
            <Button className="rounded-none" variant="outline" onClick={async () => {
              try {
                await inviteByEmail.mutateAsync({ code, email: emailInvite.trim() });
                setEmailInvite("");
                toast.success("Email invite sent");
              } catch (error: any) {
                toast.error(error?.response?.data?.message || "Invite failed");
              }
            }}>Invite by email</Button>
            <Button className="rounded-none" variant="outline" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/study-rooms/${code}`)}>
              Copy room link
            </Button>
            </CardContent>
          </Card>
        ) : null}
      </aside>

      <section className="grid gap-4">
        <Card className="rounded-none border-2 border-black shadow-[0.65rem_0.65rem_0_#000] bg-card">
          <CardContent className="flex min-h-[34rem] flex-col items-center justify-center gap-8 p-6 text-center md:p-10">
            <Badge variant="outline" className="rounded-none px-4 py-1 text-xs tracking-widest uppercase">
              Focus Session Active
            </Badge>
            <div className="text-7xl font-black tracking-tight md:text-8xl">
              {Math.floor((room.timer?.remainingSeconds || 0) / 60)
                .toString()
                .padStart(2, "0")}
              :
              {((room.timer?.remainingSeconds || 0) % 60).toString().padStart(2, "0")}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {activeParticipants.slice(0, 3).map((p: any, index: number) => (
                  <div
                    key={`${p.userId || p.guestId}_${index}`}
                    className="size-8 rounded-full border border-background bg-primary/20"
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {primaryLabel}
                {othersCount > 0 ? ` and ${othersCount} others are studying` : " is studying"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="rounded-none" variant="outline" size="icon" onClick={() => onTimer("pause")}>
                II
              </Button>
              <Button className="rounded-none" variant="outline" size="icon" onClick={() => onTimer("reset")}>
                ■
              </Button>
              {isHost ? (
                <>
                  <Button className="rounded-none" variant="outline" onClick={() => onTimer("start")}>
                    Start
                  </Button>
                  <Button className="rounded-none" variant="outline" onClick={() => onTimer("tickComplete")}>
                    Complete
                  </Button>
                </>
              ) : null}
            </div>
            <div className="w-full max-w-xl space-y-2">
              <Progress value={Math.max(0, Math.min(100, timerProgress))} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Cycle {room.timer?.cycle || 0}</span>
                <span>{timerProgress}% elapsed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="grid gap-4">
        <Card className="rounded-none">
          <CardHeader><CardTitle>Live chat</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <ScrollArea className="h-[34rem] border rounded-none p-2">
              <div className="space-y-2">
                {messages.map((m, i) => {
                  const previous = i > 0 ? messages[i - 1] : null;
                  const isGrouped = previous?.senderName === m.senderName;
                  const myDisplayName =
                    user?.name ||
                    (typeof window !== "undefined"
                      ? localStorage.getItem("study_room_guest_name") || guestName
                      : guestName);
                  const isMine = m.senderName === myDisplayName;
                  return (
                    <div
                      key={m._id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-none border px-3 py-2 ${
                          isMine
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/30 border-border"
                        }`}
                      >
                        {!isGrouped ? (
                          <p
                            className={`text-[11px] ${
                              isMine
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {m.senderName}
                          </p>
                        ) : null}
                        <p className="text-sm">{m.content}</p>
                      </div>
                    </div>
                  );
                })}
                {typingUsers.length > 0 ? (
                  <div className="flex justify-start">
                    <div className="max-w-[82%] rounded-none border bg-muted/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {typingUsers.slice(0, 4).map((name, index) => {
                            const initials = name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase();
                            const colorClass =
                              index % 4 === 0
                                ? "bg-blue-500/90"
                                : index % 4 === 1
                                  ? "bg-pink-500/90"
                                  : index % 4 === 2
                                    ? "bg-amber-500/90"
                                    : "bg-emerald-500/90";
                            return (
                              <div
                                key={name}
                                className={`relative z-10 flex size-6 items-center justify-center rounded-full border border-background ${colorClass} text-[10px] font-semibold text-white`}
                                title={name}
                              >
                                {initials}
                              </div>
                            );
                          })}
                          {typingUsers.length > 4 ? (
                            <div className="relative z-0 flex size-6 items-center justify-center rounded-full border border-background bg-muted text-[10px] font-semibold text-muted-foreground">
                              +{typingUsers.length - 4}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span>
                            {typingUsers.length === 1
                              ? `${typingUsers[0]} is typing`
                              : `${typingUsers.length} people are typing`}
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <span className="size-1 rounded-full bg-primary animate-pulse" />
                            <span className="size-1 rounded-full bg-primary animate-pulse [animation-delay:120ms]" />
                            <span className="size-1 rounded-full bg-primary animate-pulse [animation-delay:240ms]" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                className="flex-1 rounded-none"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="Send a message"
              />
              <Button className="rounded-none" variant="outline" onClick={onSend}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}

