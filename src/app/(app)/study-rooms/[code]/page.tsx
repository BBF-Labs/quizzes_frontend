"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import {
  useCompleteStudyRoomTask,
  useCreateStudyRoomTask,
  useInviteByEmail,
  useInviteByUsername,
  useJoinStudyRoom,
  useModerateStudyRoomMember,
  usePostStudyRoomMedia,
  useOpenGameReadyCheck,
  useGenerateAiGame,
  useSendStudyRoomMessage,
  useStartStudyRoomGame,
  useStudyRoom,
  useSubmitCycleCheckIn,
  useSubmitStudyRoomGameAnswer,
  useToggleGameReady,
  useUpdateMediaPreference,
  useUpdateMemberRole,
  useUpdateStudyRoomAvatar,
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

const buildAvatarUri = (
  seed: string,
  avatarConfig?: Record<string, unknown>,
): string => {
  const safeSeed = seed.trim() || "study-room-user";
  const svg = createAvatar(avataaars, {
    seed: safeSeed,
    backgroundColor: ["d1d4f9", "c0aede", "b6e3f4", "ffd5dc"],
    ...(avatarConfig || {}),
  }).toString();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getYouTubeEmbedUrl = (rawUrl: string): string | null => {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.toLowerCase();
    if (!["https:", "http:"].includes(parsed.protocol)) return null;
    const isYouTubeHost =
      host === "youtu.be" ||
      host === "www.youtu.be" ||
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host.endsWith(".youtube.com");
    if (!isYouTubeHost) return null;
    if (host.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").trim();
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return `${parsed.origin}${parsed.pathname}?autoplay=0&rel=0`;
      }
      const id = parsed.searchParams.get("v");
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    return null;
  } catch {
    return null;
  }
};

export default function StudyRoomDetailPage() {
  const params = useParams<{ code: string }>();
  const code = String(params?.code || "").toUpperCase();
  const user = getSessionUser();
  const join = useJoinStudyRoom();
  const sendMessage = useSendStudyRoomMessage();
  const inviteByUsername = useInviteByUsername();
  const inviteByEmail = useInviteByEmail();
  const updateTimer = useUpdateStudyRoomTimer();
  const updateRole = useUpdateMemberRole();
  const submitCheckIn = useSubmitCycleCheckIn();
  const updateAvatar = useUpdateStudyRoomAvatar();
  const createTask = useCreateStudyRoomTask();
  const completeTask = useCompleteStudyRoomTask();
  const postMedia = usePostStudyRoomMedia();
  const openReadyCheck = useOpenGameReadyCheck();
  const toggleGameReady = useToggleGameReady();
  const generateAiGame = useGenerateAiGame();
  const startGame = useStartStudyRoomGame();
  const submitGameAnswer = useSubmitStudyRoomGameAnswer();
  const moderateMember = useModerateStudyRoomMember();
  const updateMediaPreference = useUpdateMediaPreference();
  const { data, refetch } = useStudyRoom(code);

  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [usernameInvite, setUsernameInvite] = useState("");
  const [emailInvite, setEmailInvite] = useState("");
  const [selectedChallengeId, setSelectedChallengeId] =
    useState<RoomChallenge["id"]>("race_50");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [checkInStatus, setCheckInStatus] = useState<"completed" | "partial" | "not_done">(
    "completed",
  );
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPoints, setTaskPoints] = useState(10);
  const [mediaUrl, setMediaUrl] = useState("");
  const [gamePrompt, setGamePrompt] = useState("");
  const [gameAnswer, setGameAnswer] = useState("");
  const [gameGuess, setGameGuess] = useState("");
  const [selectedGameType, setSelectedGameType] = useState<"word_guess" | "qa">("word_guess");
  const [isReadyForGame, setIsReadyForGame] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState("");
  const [lofiUrl, setLofiUrl] = useState("");
  const [activeLofiEmbedUrl, setActiveLofiEmbedUrl] = useState<string | null>(null);
  const [mediaMode, setMediaMode] = useState<"follow_host" | "personal">("follow_host");
  const [xpFx, setXpFx] = useState<{
    delta: number;
    label: string;
    levelShift: 0 | 1 | -1;
  } | null>(null);
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
    onTask: () => refetch(),
    onCheckIn: () => refetch(),
    onMedia: () => refetch(),
    onGame: () => refetch(),
    onModeration: () => refetch(),
    onReady: () => refetch(),
    onSharedMedia: () => refetch(),
    onGameState: () => refetch(),
    onXp: (payload) => {
      const actorId = String(payload?.actorId || "");
      const myId = String(user?.id || (typeof window !== "undefined" ? localStorage.getItem("study_room_guest_id") || "" : ""));
      if (!actorId || actorId !== myId) return;
      const delta = Number(payload?.delta || 0);
      const previousLevel = Number(payload?.previousLevel || 1);
      const level = Number(payload?.level || previousLevel);
      const levelShift = level > previousLevel ? 1 : level < previousLevel ? -1 : 0;
      if (delta === 0 && levelShift === 0) return;
      setXpFx({
        delta,
        label: delta > 0 ? `+${delta} XP` : `${delta} XP`,
        levelShift: levelShift as 1 | -1 | 0,
      });
      setTimeout(() => setXpFx(null), 1400);
      refetch();
    },
    onMilestone: () => {
      refetch();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } });
      }
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
  const isManager = useMemo(() => {
    if (!room || !user?.id) return false;
    return (
      String(room.hostId) === user.id ||
      room.participants?.some(
        (p: any) =>
          String(p.userId || "") === user.id &&
          (p.role === "owner" || p.role === "moderator" || p.role === "host"),
      )
    );
  }, [room, user?.id]);
  const latestRoomYouTube = useMemo(() => {
    const youtubePost = (room?.mediaPosts || [])
      .filter((post) => post.kind === "youtube")
      .at(-1);
    return youtubePost?.url || "";
  }, [room?.mediaPosts]);
  const myParticipant = useMemo(() => {
    const myId = user?.id;
    const guestId =
      typeof window !== "undefined" ? localStorage.getItem("study_room_guest_id") || undefined : undefined;
    return (room?.participants || []).find(
      (p) => (myId && p.userId === myId) || (guestId && p.guestId === guestId),
    );
  }, [room?.participants, user?.id]);
  const effectiveEmbedUrl = useMemo(() => {
    if (mediaMode === "follow_host") {
      return getYouTubeEmbedUrl(room?.sharedMedia?.currentUrl || latestRoomYouTube || "");
    }
    return activeLofiEmbedUrl;
  }, [mediaMode, room?.sharedMedia?.currentUrl, latestRoomYouTube, activeLofiEmbedUrl]);
  const readyCount = room?.readyState?.readyParticipants?.length || 0;
  const minReadyCount = room?.readyState?.minReadyCount || 2;
  const currentGameCountdown = useMemo(() => {
    const next = room?.activeGame?.nextRoundStartsAt || room?.activeGame?.revealEndsAt;
    if (!next) return null;
    return Math.max(0, Math.ceil((new Date(next).getTime() - Date.now()) / 1000));
  }, [room?.activeGame?.nextRoundStartsAt, room?.activeGame?.revealEndsAt, room?.activeGame?.status]);

  useEffect(() => {
    if (!user || !avatarSeed || !code) return;
    updateAvatar.mutate({ code, avatarConfig: { seed: avatarSeed, style: "avataaars" } });
  }, [avatarSeed, code, updateAvatar, user]);

  useEffect(() => {
    if (!latestRoomYouTube || activeLofiEmbedUrl) return;
    const derived = getYouTubeEmbedUrl(latestRoomYouTube);
    if (derived) {
      setActiveLofiEmbedUrl(derived);
    }
  }, [latestRoomYouTube, activeLofiEmbedUrl]);

  useEffect(() => {
    if (!myParticipant?.mediaMode) return;
    setMediaMode(myParticipant.mediaMode);
  }, [myParticipant?.mediaMode]);

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
    <main className="min-h-screen overflow-x-hidden">
      <div className="mx-auto grid min-h-screen max-w-[96rem] gap-4 p-4 md:p-6 lg:h-screen lg:grid-cols-[22rem_minmax(0,1fr)_26rem]">
      <aside className="grid gap-4 lg:overflow-y-auto no-scrollbar">
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
              <div className="relative">
                <Badge variant="outline">{myScore}</Badge>
                <AnimatePresence>
                  {xpFx ? (
                    <motion.div
                      key={`${xpFx.label}_${xpFx.levelShift}`}
                      initial={{ rotateX: -90, opacity: 0, y: 8 }}
                      animate={{ rotateX: 0, opacity: 1, y: -6 }}
                      exit={{ rotateX: 90, opacity: 0, y: -14 }}
                      transition={{ duration: 0.28 }}
                      className={`absolute -right-2 -top-7 rounded-none border px-2 py-0.5 text-[11px] font-semibold ${
                        xpFx.delta >= 0
                          ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-500"
                          : "border-rose-500/60 bg-rose-500/15 text-rose-500"
                      }`}
                    >
                      {xpFx.label}
                      {xpFx.levelShift === 1 ? " · Level up" : xpFx.levelShift === -1 ? " · Level down" : ""}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
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
                <div className="flex items-center gap-2">
                  <img
                    src={buildAvatarUri(
                      String(p.avatarConfig?.seed || p.displayName || p.userId || p.guestId),
                      p.avatarConfig,
                    )}
                    alt={`${p.displayName} avatar`}
                    className="size-6 rounded-full border border-border"
                  />
                  <span>{p.displayName}</span>
                </div>
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

        {isManager ? (
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
        <Card className="rounded-none">
          <CardHeader><CardTitle>Avatar</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            <Input
              className="rounded-none"
              placeholder="Avatar seed (cartoon)"
              value={avatarSeed}
              onChange={(e) => setAvatarSeed(e.target.value)}
            />
          </CardContent>
        </Card>
      </aside>

      <section className="grid gap-4 lg:overflow-y-auto no-scrollbar">
        <Card className="rounded-(--radius) border-2 border-black shadow-[0.65rem_0.65rem_0_#000] bg-card">
          <CardContent className="flex min-h-[24rem] flex-col items-center justify-center gap-6 p-4 text-center md:min-h-[34rem] md:gap-8 md:p-10">
            <Badge variant="outline" className="rounded-none px-4 py-1 text-xs tracking-widest uppercase">
              Focus Session Active
            </Badge>
            <div className="text-5xl font-black tracking-tight sm:text-6xl md:text-8xl">
              {Math.floor((room.timer?.remainingSeconds || 0) / 60)
                .toString()
                .padStart(2, "0")}
              :
              {((room.timer?.remainingSeconds || 0) % 60).toString().padStart(2, "0")}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {activeParticipants.slice(0, 3).map((p: any, index: number) => (
                  <img
                    key={`${p.userId || p.guestId}_${index}`}
                    src={buildAvatarUri(
                      String(p.avatarConfig?.seed || p.displayName || p.userId || p.guestId),
                      p.avatarConfig,
                    )}
                    alt={`${p.displayName} avatar`}
                    className="size-8 rounded-full border border-background bg-primary/20"
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
              {isManager ? (
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
            <div className="w-full max-w-xl border p-3 text-left">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Lo-fi player</p>
                <div className="flex gap-2">
                  <Button
                    className="rounded-none"
                    size="sm"
                    variant={mediaMode === "follow_host" ? "default" : "outline"}
                    onClick={async () => {
                      const guestId = user ? undefined : ensureGuestId();
                      await updateMediaPreference.mutateAsync({
                        code,
                        mode: "follow_host",
                        guestId,
                      });
                      setMediaMode("follow_host");
                    }}
                  >
                    Follow host
                  </Button>
                  <Button
                    className="rounded-none"
                    size="sm"
                    variant={mediaMode === "personal" ? "default" : "outline"}
                    onClick={async () => {
                      const guestId = user ? undefined : ensureGuestId();
                      await updateMediaPreference.mutateAsync({
                        code,
                        mode: "personal",
                        personalMediaUrl: lofiUrl || undefined,
                        guestId,
                      });
                      setMediaMode("personal");
                    }}
                  >
                    Personal
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  className="rounded-none"
                  placeholder="Paste YouTube lo-fi URL"
                  value={lofiUrl}
                  onChange={(e) => setLofiUrl(e.target.value)}
                />
                <Button
                  className="rounded-none"
                  variant="outline"
                  onClick={() => {
                    const embed = getYouTubeEmbedUrl(lofiUrl);
                    if (!embed) {
                      toast.error("Please enter a valid YouTube URL");
                      return;
                    }
                    setActiveLofiEmbedUrl(embed);
                  }}
                >
                  Play
                </Button>
              </div>
              {effectiveEmbedUrl ? (
                <div className="mt-3 aspect-video w-full border">
                  <iframe
                    title="Study room lo-fi player"
                    src={effectiveEmbedUrl}
                    className="h-full w-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : null}
            </div>
            {room.timer?.checkInOpen ? (
              <div className="w-full max-w-xl border p-3 text-left">
                <p className="mb-2 text-xs text-muted-foreground">Cycle check-in</p>
                <div className="flex flex-wrap gap-2">
                  {(["completed", "partial", "not_done"] as const).map((status) => (
                    <Button
                      key={status}
                      className="rounded-none"
                      size="sm"
                      variant={checkInStatus === status ? "default" : "outline"}
                      onClick={() => setCheckInStatus(status)}
                    >
                      {status}
                    </Button>
                  ))}
                  <Button
                    className="rounded-none"
                    size="sm"
                    onClick={async () => {
                      const guestId = user ? undefined : ensureGuestId();
                      await submitCheckIn.mutateAsync({ code, status: checkInStatus, guestId });
                      refetch();
                    }}
                  >
                    Submit check-in
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader><CardTitle>Tasks and XP</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {isManager ? (
              <div className="flex flex-wrap gap-2">
                <Input className="rounded-none" placeholder="Task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                <Input className="rounded-none w-24" type="number" min={1} max={100} value={taskPoints} onChange={(e) => setTaskPoints(Number(e.target.value || 10))} />
                <Button className="rounded-none" variant="outline" onClick={async () => {
                  await createTask.mutateAsync({ code, title: taskTitle, points: taskPoints });
                  setTaskTitle("");
                  refetch();
                }}>Create</Button>
              </div>
            ) : null}
            <div className="space-y-2">
              {(room.tasks || []).map((task) => (
                <div key={task.id} className="flex items-center justify-between border p-2">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.points} pts</p>
                  </div>
                  <Button className="rounded-none" size="sm" variant="outline" onClick={async () => {
                    const guestId = user ? undefined : ensureGuestId();
                    await completeTask.mutateAsync({ code, taskId: task.id, guestId });
                    refetch();
                  }}>Complete</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="grid gap-4 lg:overflow-y-auto no-scrollbar">
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
                            return (
                              <img
                                key={name}
                                src={buildAvatarUri(name)}
                                alt={`${name} avatar`}
                                className={`relative z-10 size-6 rounded-full border border-background`}
                                title={name}
                              />
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
        <Card className="rounded-none">
          <CardHeader><CardTitle>Games and Media</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {isManager ? (
              <>
                <div className="flex items-center justify-between border p-2 text-xs">
                  <span>Ready check</span>
                  <span>{readyCount}/{minReadyCount} ready</span>
                </div>
                <div className="flex gap-2">
                  <Button className="rounded-none" variant="outline" onClick={async () => {
                    await openReadyCheck.mutateAsync({ code, minReadyCount: 2 });
                    refetch();
                  }}>
                    Open ready check
                  </Button>
                  <Button className="rounded-none" variant="outline" onClick={async () => {
                    await generateAiGame.mutateAsync({ code, type: selectedGameType, topic: gamePrompt || "study mix" });
                    refetch();
                  }}>
                    AI generate ({selectedGameType})
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input className="rounded-none" placeholder="Game prompt" value={gamePrompt} onChange={(e) => setGamePrompt(e.target.value)} />
                  <Input className="rounded-none" placeholder="Answer" value={gameAnswer} onChange={(e) => setGameAnswer(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button className="rounded-none" size="sm" variant={selectedGameType === "word_guess" ? "default" : "outline"} onClick={() => setSelectedGameType("word_guess")}>
                    Word Guess
                  </Button>
                  <Button className="rounded-none" size="sm" variant={selectedGameType === "qa" ? "default" : "outline"} onClick={() => setSelectedGameType("qa")}>
                    Q&A
                  </Button>
                </div>
                <Button className="rounded-none" variant="outline" onClick={async () => {
                  await startGame.mutateAsync({ code, type: selectedGameType, prompt: gamePrompt, answer: gameAnswer, source: "manual" });
                  setGamePrompt("");
                  setGameAnswer("");
                  refetch();
                }}>Start word guess</Button>
              </>
            ) : null}
            <Button className="rounded-none" variant={isReadyForGame ? "default" : "outline"} onClick={async () => {
              const guestId = user ? undefined : ensureGuestId();
              await toggleGameReady.mutateAsync({ code, ready: !isReadyForGame, guestId });
              setIsReadyForGame((prev) => !prev);
              refetch();
            }}>
              {isReadyForGame ? "Unready" : "Ready"}
            </Button>
            {room.activeGame?.isActive ? (
              <div className="border p-2">
                <p className="text-sm">{room.activeGame.prompt}</p>
                {room.activeGame.type === "word_guess" ? (
                  <p className="my-2 text-xl font-bold tracking-[0.3em]">
                    {room.activeGame.maskedWord || "_ _ _ _"}
                  </p>
                ) : null}
                {room.activeGame.type === "qa" && room.activeGame.options?.length ? (
                  <div className="my-2 grid gap-2">
                    {room.activeGame.options.map((option, index) => (
                      <Button
                        key={`${option}_${index}`}
                        className="rounded-none justify-start"
                        variant="outline"
                        onClick={async () => {
                          const guestId = user ? undefined : ensureGuestId();
                          await submitGameAnswer.mutateAsync({ code, answer: String(index), guestId });
                          refetch();
                        }}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                ) : null}
                <div className="mt-2 flex gap-2">
                  <Input className="rounded-none" value={gameGuess} onChange={(e) => setGameGuess(e.target.value)} placeholder="Your answer" />
                  <Button className="rounded-none" variant="outline" onClick={async () => {
                    const guestId = user ? undefined : ensureGuestId();
                    await submitGameAnswer.mutateAsync({ code, answer: gameGuess, guestId });
                    setGameGuess("");
                    refetch();
                  }}>Submit</Button>
                </div>
                {currentGameCountdown !== null ? (
                  <p className="mt-2 text-xs text-muted-foreground">Next round in {currentGameCountdown}s</p>
                ) : null}
              </div>
            ) : null}
            {isManager ? (
              <div className="flex gap-2">
                <Input className="rounded-none" placeholder="YouTube/Spotify URL" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
                <Button className="rounded-none" variant="outline" onClick={async () => {
                  await postMedia.mutateAsync({ code, url: mediaUrl });
                  setMediaUrl("");
                  refetch();
                }}>Send URL</Button>
              </div>
            ) : null}
            <div className="space-y-2">
              {(room.mediaPosts || []).map((post) => (
                <a key={post.id} href={post.url} target="_blank" rel="noreferrer" className="block border p-2 text-xs hover:bg-muted/30">
                  {post.kind.toUpperCase()} - {post.title || post.url}
                </a>
              ))}
            </div>
            {isManager ? (
              <div className="space-y-2 border p-2">
                <p className="text-xs text-muted-foreground">Moderation quick actions</p>
                {(room.participants || []).filter((p) => !p.leftAt && p.role !== "owner").slice(0, 5).map((p) => (
                  <div key={p.userId || p.guestId} className="flex items-center justify-between">
                    <span className="text-sm">{p.displayName}</span>
                    <div className="flex gap-2">
                      {p.userId ? (
                        <Button className="rounded-none" size="sm" variant="outline" onClick={() => updateRole.mutate({ code, memberUserId: p.userId!, role: p.role === "moderator" ? "member" : "moderator" })}>
                          {p.role === "moderator" ? "Remove mod" : "Make mod"}
                        </Button>
                      ) : null}
                      <Button className="rounded-none" size="sm" variant="destructive" onClick={() => moderateMember.mutate({ code, action: "kick", memberUserId: p.userId, memberGuestId: p.guestId })}>
                        Kick
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </aside>
      </div>
    </main>
  );
}

