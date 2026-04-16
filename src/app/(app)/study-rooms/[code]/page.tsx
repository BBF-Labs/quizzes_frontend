"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Users,
  Trophy,
  Settings,
  Music,
  CheckCircle2,
  Plus,
  Copy,
  Play,
  Pause,
  RotateCcw,
  Square,
  Check,
  RefreshCw,
  MoreVertical,
  Shield,
  MicOff,
  UserMinus,
  Star,
  Zap,
  Target,
  Lock,
  Unlock,
  Timer,
} from "lucide-react";
import { SprintChat } from "@/components/study-rooms/kahoot-chat";
import { RoomOverlays } from "@/components/study-rooms/room-overlays";
import { AvatarBuilder } from "@/components/study-rooms/avatar-builder";
import { toDiceBearOptions } from "@/components/study-rooms/avatar-builder";
import { useStudyRoomLayout } from "@/app/(app)/study-rooms/study-room-layout-provider";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

const ensureGuestId = (): string => {
  const key = "study_room_guest_id";
  const existing = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (existing) return existing;
  const next = `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (typeof window !== "undefined") localStorage.setItem(key, next);
  return next;
};

const buildAvatarUri = (seed: string, avatarConfig?: Record<string, unknown>): string => {
  const opts =
    avatarConfig && Object.keys(avatarConfig).length > 0
      ? toDiceBearOptions(avatarConfig as Record<string, string>)
      : { seed: seed || "study-user", backgroundColor: ["d1d4f9", "c0aede", "b6e3f4", "ffd5dc"] };
  return createAvatar(avataaars, opts).toDataUri();
};

const OPTION_LABELS = ["A", "B", "C", "D"];

// ── component ─────────────────────────────────────────────────────────────────

export default function StudyRoomDetailPage() {
  const params = useParams<{ code: string }>();
  const code = String(params?.code || "").toUpperCase();
  const user = getSessionUser();

  const { data, refetch, isLoading } = useStudyRoom(code);
  const room = data?.room;
  const messages = data?.messages || [];
  const leaderboard = data?.leaderboard || [];
  const participants = room?.participants?.filter((p) => !p.leftAt) || [];

  // mutations
  const join = useJoinStudyRoom();
  const sendMessage = useSendStudyRoomMessage();
  const updateTimer = useUpdateStudyRoomTimer();
  const updateAvatar = useUpdateStudyRoomAvatar();
  const updateRole = useUpdateMemberRole();
  const submitCheckIn = useSubmitCycleCheckIn();
  const createTask = useCreateStudyRoomTask();
  const completeTask = useCompleteStudyRoomTask();
  const postMedia = usePostStudyRoomMedia();
  const openReadyCheck = useOpenGameReadyCheck();
  const toggleGameReady = useToggleGameReady();
  const generateAiGame = useGenerateAiGame();
  const startGame = useStartStudyRoomGame();
  const submitGameAnswer = useSubmitStudyRoomGameAnswer();
  const moderateMember = useModerateStudyRoomMember();
  const inviteByUsername = useInviteByUsername();
  const inviteByEmail = useInviteByEmail();
  const updateMediaPreference = useUpdateMediaPreference();
  const syncMediaState = useMutation({
    mutationFn: async (payload: { status: "playing" | "paused"; currentTime: number }) => {
      await api.post(`/study-rooms/${code}/media/sync`, payload);
    },
  });

  const { isImmersive, setIsImmersive } = useStudyRoomLayout();

  // local ui state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [xpFx, setXpFx] = useState<{ delta: number } | null>(null);
  const [isOverlayDismissed, setIsOverlayDismissed] = useState(false);
  const [localRemaining, setLocalRemaining] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1500);
  const [gameInput, setGameInput] = useState("");
  const [inviteValue, setInviteValue] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);


  // ── derived state ──────────────────────────────────────────────────────────

  const myDisplayName = user?.name ?? (typeof window !== "undefined"
    ? localStorage.getItem("study_room_guest_name") || guestName
    : guestName);

  const myGuestId = typeof window !== "undefined" ? localStorage.getItem("study_room_guest_id") : null;

  const myParticipant = useMemo(() => {
    const myId = user?.id;
    return (room?.participants || []).find(
      (p) => (myId && p.userId === myId) || (myGuestId && p.guestId === myGuestId),
    );
  }, [room?.participants, user?.id, myGuestId]);

  const isHost = useMemo(
    () => !!(room && (room.hostId === user?.id || myParticipant?.role === "host" || myParticipant?.role === "moderator")),
    [room, user, myParticipant],
  );

  // Derive ready state from server instead of local boolean
  const amIReady = useMemo(() => {
    if (!room?.readyState?.readyParticipants) return false;
    return room.readyState.readyParticipants.some(
      (r) => (user?.id && r.userId === user.id) || (myGuestId && r.guestId === myGuestId),
    );
  }, [room?.readyState?.readyParticipants, user?.id, myGuestId]);

  // Did I already answer this QA round?
  const myQaResponse = useMemo(() => {
    const game = room?.activeGame;
    if (!game || game.type !== "qa" || !game.responses) return null;
    return game.responses.find(
      (r) => (user?.id && r.userId === user.id) || (myGuestId && r.guestId === myGuestId),
    ) ?? null;
  }, [room?.activeGame, user?.id, myGuestId]);

  const progress = useMemo(() => {
    if (!room?.timer?.durationSeconds || localRemaining === null) return 0;
    return ((room.timer.durationSeconds - localRemaining) / room.timer.durationSeconds) * 100;
  }, [room?.timer?.durationSeconds, localRemaining]);

  const remainingFormatted = useMemo(() => {
    const s = localRemaining ?? 0;
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  }, [localRemaining]);

  const activeOverlay = useMemo(() => {
    if (isOverlayDismissed) return null;
    if (room?.readyState?.isOpen) return "ready_check";
    if (room?.timer?.isRunning) return "focus";
    return null;
  }, [room?.timer?.isRunning, room?.readyState?.isOpen, isOverlayDismissed]);

  // ── timer ticker ───────────────────────────────────────────────────────────

  // Sync selectedDuration from server when room loads or duration changes
  useEffect(() => {
    if (room?.timer?.durationSeconds) {
      setSelectedDuration(room.timer.durationSeconds);
    }
  }, [room?.timer?.durationSeconds]);

  const hasAutoTickedRef = useRef(false);
  useEffect(() => {
    if (!room?.timer) return;
    hasAutoTickedRef.current = false;

    const tick = () => {
      const base = room.timer?.remainingSeconds ?? 0;
      const startedAt = room.timer?.startedAt ? new Date(room.timer.startedAt).getTime() : null;
      const running = room.timer?.isRunning;

      if (!running || !startedAt) { setLocalRemaining(base); return; }

      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, base - elapsed);
      setLocalRemaining(remaining);

      if (remaining === 0 && !hasAutoTickedRef.current && isHost) {
        hasAutoTickedRef.current = true;
        updateTimer.mutate({ code, action: "tickComplete" });
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [room?.timer?.isRunning, room?.timer?.startedAt, room?.timer?.remainingSeconds]);

  // ── socket ─────────────────────────────────────────────────────────────────

  const roomSocket = useStudyRoomSocket(code, {
    onPresence: () => refetch(),
    onMessage: () => refetch(),
    onTimer: (p) => {
      // Immediately sync local time from socket payload — don't wait for refetch
      if (p?.timer) {
        const t = p.timer;
        const base = t.remainingSeconds ?? 0;
        const startedAt = t.startedAt ? new Date(t.startedAt).getTime() : null;
        if (!t.isRunning || !startedAt) {
          setLocalRemaining(base);
        } else {
          const elapsed = Math.floor((Date.now() - startedAt) / 1000);
          setLocalRemaining(Math.max(0, base - elapsed));
        }
      }
      refetch();
    },
    onTyping: (p) => {
      const sender = String(p?.senderName || "");
      if (!sender || sender === myDisplayName) return;
      setTypingUsers((prev) =>
        p?.isTyping ? (prev.includes(sender) ? prev : [...prev, sender]) : prev.filter((n) => n !== sender),
      );
    },
    onTask: () => refetch(),
    onGame: () => refetch(),
    onGameState: () => refetch(),
    onXp: (p) => {
      const myId = user?.id || myGuestId || "";
      if (p?.actorId === myId) {
        setXpFx({ delta: p.delta });
        setTimeout(() => setXpFx(null), 2000);
      }
      refetch();
    },
    onMilestone: () => {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      refetch();
    },
    onReady: () => refetch(),
    onCheckIn: () => refetch(),
    onSharedMedia: () => refetch(),
    onLocked: () => refetch(),
    onEnded: () => refetch(),
    onMedia: () => refetch(),
    onMediaSync: (p) => {
      if (isHost || !playerRef.current) return;
      const player = playerRef.current;
      if (p.status === "playing") player.playVideo();
      else player.pauseVideo();
      if (Math.abs((p.currentTime ?? 0) - player.getCurrentTime()) > 2.5)
        player.seekTo(p.currentTime, true);
    },
    onModeration: (p) => {
      const myId = user?.id || myGuestId;
      if (p?.targetUserId === myId || p?.targetGuestId === myId) {
        if (p.action === "kick") {
          toast.error("You've been removed from the room.");
          window.location.href = "/study-rooms";
        } else if (p.action === "mute") {
          toast.warning("The host has muted your chat.");
        }
      }
      refetch();
    },
  });

  // ── YouTube player ─────────────────────────────────────────────────────────

  const playerRef = useRef<any>(null);
  const videoId = useMemo(() => {
    const url = room?.sharedMedia?.currentUrl || "";
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    } catch { /* ignore */ }
    return null;
  }, [room?.sharedMedia?.currentUrl]);

  useEffect(() => {
    const loadPlayer = () => {
      if (!(window as any).YT?.Player) return;
      if (!videoId || !document.getElementById("yt-player")) return;

      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }
      playerRef.current = new (window as any).YT.Player("yt-player", {
        height: "100%",
        width: "100%",
        videoId,
        playerVars: { autoplay: 0, controls: isHost ? 1 : 0, modestbranding: 1, rel: 0 },
        events: {
          onStateChange: (e: any) => {
            if (!isHost) return;
            syncMediaState.mutate({ status: e.data === 1 ? "playing" : "paused", currentTime: playerRef.current.getCurrentTime() });
          },
        },
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = loadPlayer;
    } else {
      loadPlayer();
    }
  }, [videoId, isHost]);

  // Host periodic sync broadcast
  useEffect(() => {
    if (!isHost || !room?.sharedMedia?.status || room.sharedMedia.status !== "playing") return;
    const id = setInterval(() => {
      if (playerRef.current?.getPlayerState() === 1)
        syncMediaState.mutate({ status: "playing", currentTime: playerRef.current.getCurrentTime() });
    }, 5000);
    return () => clearInterval(id);
  }, [isHost, room?.sharedMedia?.status]);

  // Reset selected option when new QA round starts
  useEffect(() => {
    setSelectedOption(null);
  }, [room?.activeGame?.roundEndsAt]);

  // ── game helpers (derived, must be before early return) ───────────────────

  const game = room?.activeGame;
  const gameVisible = game && game.status !== "ended";
  const isQa = game?.type === "qa";
  const isWordGuess = game?.type === "word_guess";

  // Build per-option response counts for reveal
  const optionCounts = useMemo(() => {
    if (!game?.options || !game.responses) return [];
    return game.options.map((_, idx) => game.responses!.filter((r) => r.optionIndex === idx).length);
  }, [game?.options, game?.responses]);

  const totalResponses = optionCounts.reduce((a, b) => a + b, 0);

  // ── loading ────────────────────────────────────────────────────────────────

  if (isLoading || !room)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Skeleton className="h-20 w-80 rounded-(--radius)" />
      </div>
    );

  const handleSubmitAnswer = () => {
    const answer = isQa ? String(selectedOption ?? "") : gameInput.trim().toUpperCase();
    if (!answer && answer !== "0") return;
    const gId = user ? undefined : ensureGuestId();
    submitGameAnswer.mutate(
      { code, answer, guestId: gId },
      {
        onSuccess: (res: any) => {
          if (res?.correct) toast.success("Correct!");
          else if (res?.duplicate) toast.info("Already answered.");
          else toast.error("Wrong answer.");
          setGameInput("");
          setSelectedOption(null);
          refetch();
        },
        onError: (e: any) => toast.error(e?.message || "Could not submit answer"),
      },
    );
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <main className="relative min-h-screen bg-background text-foreground no-scrollbar">
      {/* State Overlays */}
      <RoomOverlays state={activeOverlay as any} onDismiss={() => setIsOverlayDismissed(true)} />

      {/* XP FX popup */}
      <AnimatePresence>
        {xpFx && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            className="pointer-events-none fixed bottom-28 right-8 z-[200] flex items-center gap-2 rounded-(--radius) border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-sm font-bold text-primary shadow-lg"
          >
            <Zap className="size-4" />
            {xpFx.delta > 0 ? `+${xpFx.delta}` : xpFx.delta} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3-column layout */}
      <div className="mx-auto flex min-h-screen w-full max-w-[128rem] flex-col gap-5 p-4 md:p-6 md:flex-row">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="hidden w-72 shrink-0 flex-col gap-4 lg:flex overflow-y-auto no-scrollbar">

          {/* Room identity */}
          <Card className="rounded-(--radius) border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-4">
                <div className="min-w-0">
                  <h2 className="truncate font-mono text-sm font-bold italic tracking-tight text-foreground">{room.title}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="rounded-(--radius) px-2 py-0 font-mono text-[9px] border-border/50">{room.roomCode}</Badge>
                    {room.isLocked
                      ? <Badge variant="destructive" className="rounded-(--radius) text-[9px] font-mono gap-1"><Lock className="size-2.5" /> Locked</Badge>
                      : <Badge className="rounded-(--radius) bg-emerald-500 text-[9px] font-mono text-white"><Unlock className="size-2.5 mr-1" />Open</Badge>
                    }
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="rounded-(--radius) shrink-0 text-muted-foreground hover:bg-accent">
                      <Settings className="size-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-(--radius) border-border/50 bg-background sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-mono italic tracking-tighter">Room Settings</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-5 py-4">
                      <div className="flex items-center justify-between rounded-(--radius) border border-border/50 p-4 bg-muted/20">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-mono font-bold uppercase tracking-tight">Immersive Mode</Label>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Hide global navigation.</p>
                        </div>
                        <Switch checked={isImmersive} onCheckedChange={setIsImmersive} />
                      </div>
                      <div className="flex items-center justify-between rounded-(--radius) border border-border/50 p-4 bg-muted/20">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-mono font-bold uppercase tracking-tight">Media Follow Mode</Label>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Sync with host broadcast.</p>
                        </div>
                        <Switch
                          checked={myParticipant?.mediaMode !== "personal"}
                          onCheckedChange={(checked) =>
                            updateMediaPreference.mutate({
                              code,
                              mode: checked ? "follow_host" : "personal",
                              guestId: user ? undefined : myGuestId || "",
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Invite</p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Username or email…"
                            className="rounded-(--radius) border-border/50 font-mono text-xs"
                            value={inviteValue}
                            onChange={(e) => setInviteValue(e.target.value)}
                          />
                          <Button
                            variant="outline"
                            className="rounded-(--radius) text-xs font-mono uppercase shrink-0"
                            disabled={inviteByUsername.isPending || inviteByEmail.isPending}
                            onClick={() => {
                              if (!inviteValue) return;
                              if (inviteValue.includes("@")) {
                                inviteByEmail.mutate({ code, email: inviteValue }, {
                                  onSuccess: () => { toast.success(`Invite sent`); setInviteValue(""); },
                                  onError: () => toast.error("Failed to send invite"),
                                });
                              } else {
                                inviteByUsername.mutate({ code, username: inviteValue }, {
                                  onSuccess: () => { toast.success(`Invite sent`); setInviteValue(""); },
                                  onError: () => toast.error("User not found"),
                                });
                              }
                            }}
                          >
                            Invite
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-(--radius) gap-2 w-full" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
                        <Copy className="size-4" /> Copy Room Link
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Participant stack */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-widest">Online</span>
                  <span className="text-xs font-mono font-bold text-foreground">{participants.length} / {room.maxParticipants}</span>
                </div>
                <Progress value={(participants.length / room.maxParticipants) * 100} className="h-1 rounded-(--radius)" />
                <div className="flex -space-x-2 pt-1">
                  <AnimatePresence>
                    {participants.slice(0, 6).map((p) => (
                      <motion.img
                        key={p.userId || p.guestId}
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        src={buildAvatarUri(p.displayName, p.avatarConfig)}
                        title={p.displayName}
                        className="size-7 rounded-full border-2 border-background bg-muted"
                        alt=""
                      />
                    ))}
                    {participants.length > 6 && (
                      <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-[9px] font-bold text-primary-foreground">
                        +{participants.length - 6}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Game controls (host only) */}
          {isHost && (
            <Card className="rounded-(--radius) border-border/50">
              <CardContent className="p-5 space-y-3">
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">AI Challenge Generator</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-(--radius) font-mono text-[9px] uppercase tracking-wider h-9"
                    disabled={generateAiGame.isPending}
                    onClick={() => generateAiGame.mutate({ code, type: "word_guess" }, {
                      onSuccess: () => toast.success("Z is drafting a word challenge…"),
                      onError: (e: any) => toast.error(e?.message || "Generation failed"),
                    })}
                  >
                    {generateAiGame.isPending ? <RefreshCw className="size-3 animate-spin mr-1" /> : null}
                    Word Guess
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-(--radius) font-mono text-[9px] uppercase tracking-wider h-9"
                    disabled={generateAiGame.isPending}
                    onClick={() => generateAiGame.mutate({ code, type: "qa" }, {
                      onSuccess: () => toast.success("Z is preparing a Q&A battle…"),
                      onError: (e: any) => toast.error(e?.message || "Generation failed"),
                    })}
                  >
                    {generateAiGame.isPending ? <RefreshCw className="size-3 animate-spin mr-1" /> : null}
                    Q&A Battle
                  </Button>
                </div>
                {isHost && !room.readyState?.isOpen && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full rounded-(--radius) font-mono text-[9px] uppercase tracking-wider h-9"
                    onClick={() => openReadyCheck.mutate({ code }, { onError: (e: any) => toast.error(e?.message || "Failed") })}
                  >
                    Open Ready Check
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card className="flex flex-1 flex-col rounded-(--radius) border-border/50 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
              <Trophy className="size-4 text-primary" />
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest">Leaderboard</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border/30">
                <AnimatePresence mode="popLayout">
                  {leaderboard.map((p, i) => {
                    const isSelf = (user?.id && p.userId === user.id) || (myGuestId && p.guestId === myGuestId);
                    const canModerate = isHost && !isSelf && p.role !== "host";
                    return (
                      <motion.div
                        key={p.userId || p.guestId || p.displayName}
                        layout
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-muted/40",
                          isSelf && "bg-primary/5",
                        )}
                      >
                        <span className={cn("w-4 shrink-0 text-xs font-mono font-black italic", i === 0 ? "text-primary" : "text-muted-foreground")}>
                          #{i + 1}
                        </span>
                        <img src={buildAvatarUri(p.displayName, p.avatarConfig)} className="size-8 rounded-full border border-border/50 bg-muted shrink-0" alt="" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="truncate text-[11px] font-mono font-bold uppercase">{p.displayName}</p>
                            {p.role === "host" && <Star className="size-2.5 shrink-0 fill-amber-400 text-amber-400" />}
                            {p.role === "moderator" && <Shield className="size-2.5 shrink-0 text-blue-400" />}
                          </div>
                          <p className="text-[9px] font-mono text-muted-foreground uppercase">{p.points ?? 0} XP</p>
                        </div>

                        {canModerate ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="size-6 rounded-(--radius) text-muted-foreground shrink-0">
                                <MoreVertical className="size-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-(--radius) font-mono text-[10px]">
                              <DropdownMenuLabel className="text-[9px] uppercase tracking-widest">Moderation</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {p.userId && p.role !== "moderator" && (
                                <DropdownMenuItem onClick={() =>
                                  updateRole.mutate({ code, memberUserId: p.userId!, role: "moderator" }, {
                                    onSuccess: () => toast.success(`${p.displayName} promoted`),
                                    onError: (e: any) => toast.error(e?.message || "Failed"),
                                  })
                                }>
                                  <Shield className="mr-2 size-3 text-blue-400" /> Promote to Mod
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() =>
                                moderateMember.mutate({
                                  code,
                                  memberUserId: p.userId || undefined,
                                  memberGuestId: p.userId ? undefined : p.guestId || undefined,
                                  action: "mute",
                                }, {
                                  onSuccess: () => toast.success(`${p.displayName} muted`),
                                  onError: (e: any) => toast.error(e?.message || "Failed"),
                                })
                              }>
                                <MicOff className="mr-2 size-3 text-amber-500" /> Mute
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  moderateMember.mutate({
                                    code,
                                    memberUserId: p.userId || undefined,
                                    memberGuestId: p.userId ? undefined : p.guestId || undefined,
                                    action: "kick",
                                  }, {
                                    onSuccess: () => toast.success(`${p.displayName} removed`),
                                    onError: (e: any) => toast.error(e?.message || "Failed"),
                                  })
                                }
                              >
                                <UserMinus className="mr-2 size-3" /> Eject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : isSelf ? (
                          <Badge variant="outline" className="rounded-(--radius) text-[8px] font-mono border-primary/30 text-primary shrink-0">You</Badge>
                        ) : null}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </Card>
        </aside>

        {/* ── CENTER STAGE ── */}
        <section className="flex flex-1 flex-col gap-5 overflow-y-auto no-scrollbar">

          {/* Timer card */}
          <Card className="rounded-(--radius) border-border/50 shadow-sm overflow-hidden">
            {/* Amber accent strip — pulses when running */}
            <div className={cn(
              "h-1 w-full bg-amber-500",
              room.timer?.isRunning && "animate-pulse",
            )} />

            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-5">

                {/* Status badge */}
                <div className="flex items-center gap-2">
                  {room.timer?.isRunning ? (
                    <Badge className="rounded-(--radius) bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Focus Session Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-(--radius) border-border/40 text-muted-foreground font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1.5">
                      <Timer className="size-3" />
                      {localRemaining === 0 ? "Cycle Complete" : "Session Paused"}
                    </Badge>
                  )}
                  <Badge variant="outline" className="rounded-(--radius) border-amber-500/30 text-amber-500 font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                    Sprint {room.timer?.cycle ?? 0}
                  </Badge>
                </div>

                {/* Big time display */}
                <p className={cn(
                  "font-mono font-black tracking-tighter leading-none select-none",
                  "text-7xl sm:text-8xl",
                  room.timer?.isRunning ? "text-foreground" : "text-muted-foreground",
                )}>
                  {remainingFormatted}
                </p>

                {/* Participant avatar stack */}
                {participants.length > 0 && (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex -space-x-2">
                      {participants.slice(0, 5).map((p) => (
                        <img
                          key={p.userId ?? p.guestId}
                          src={buildAvatarUri(p.displayName, p.avatarConfig)}
                          alt={p.displayName}
                          className="size-7 rounded-full border-2 border-background bg-muted"
                          title={p.displayName}
                        />
                      ))}
                      {participants.length > 5 && (
                        <div className="size-7 rounded-full border-2 border-background bg-muted flex items-center justify-center font-mono text-[9px] font-bold text-muted-foreground">
                          +{participants.length - 5}
                        </div>
                      )}
                    </div>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                      {participants.length === 1
                        ? `${participants[0].displayName} is studying`
                        : participants.length <= 3
                        ? `${participants.slice(0, -1).map((p) => p.displayName).join(", ")} and ${participants[participants.length - 1].displayName} are studying`
                        : `${participants[0].displayName} and ${participants.length - 1} others are studying`}
                    </p>
                  </div>
                )}

                {/* Duration picker (host/mod, idle only) */}
                {isHost && !room.timer?.isRunning && (
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mr-1">Duration</p>
                    {[15, 25, 45, 60].map((mins) => {
                      const secs = mins * 60;
                      const active = selectedDuration === secs;
                      return (
                        <button
                          key={mins}
                          onClick={() => setSelectedDuration(secs)}
                          className={cn(
                            "font-mono text-[9px] font-bold uppercase px-2.5 py-1 border transition-all",
                            active
                              ? "border-amber-500 text-amber-500 bg-amber-500/10"
                              : "border-border/40 text-muted-foreground hover:border-amber-500/50 hover:text-amber-500",
                          )}
                        >
                          {mins}m
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {isHost && (
                    <>
                      {/* Play / Pause — circular amber filled */}
                      <button
                        onClick={() => {
                          const isRunning = room.timer?.isRunning;
                          updateTimer.mutate({
                            code,
                            action: isRunning ? "pause" : "start",
                            durationSeconds: isRunning ? undefined : selectedDuration,
                          });
                        }}
                        className="size-14 rounded-full bg-amber-500 hover:bg-amber-400 transition-colors flex items-center justify-center shadow-md shadow-amber-500/20 active:scale-95"
                      >
                        {room.timer?.isRunning
                          ? <Pause className="size-5 fill-white text-white" />
                          : <Play className="size-5 fill-white text-white ml-0.5" />}
                      </button>

                      {/* Stop — circular outlined */}
                      <button
                        onClick={() => updateTimer.mutate({ code, action: "reset" })}
                        className="size-14 rounded-full border-2 border-border/60 hover:border-destructive/60 hover:text-destructive text-muted-foreground transition-colors flex items-center justify-center active:scale-95"
                      >
                        <Square className="size-4 fill-current" />
                      </button>
                    </>
                  )}
                  {!myParticipant && (
                    <Button
                      className="rounded-(--radius) h-11 px-10 text-sm font-bold uppercase tracking-widest"
                      onClick={() => join.mutate({ code })}
                    >
                      Join Room
                    </Button>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>

          {/* ── GAME PANEL ── */}
          <AnimatePresence mode="wait">
            {gameVisible && (
              <motion.div
                key={`game-${game.status}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card className="rounded-(--radius) border-primary/30 bg-card shadow-sm overflow-hidden">
                  {/* Header strip */}
                  <div className={cn(
                    "h-1 w-full",
                    game.status === "running" ? "bg-primary animate-pulse" :
                    game.status === "reveal" ? "bg-emerald-500" :
                    game.status === "generating" ? "bg-amber-500 animate-pulse" : "bg-border/50"
                  )} />

                  <CardContent className="p-6">
                    {/* Generating */}
                    {game.status === "generating" && (
                      <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <RefreshCw className="size-10 animate-spin text-primary/50" />
                        <div>
                          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Z is generating your challenge…</p>
                        </div>
                      </div>
                    )}

                    {/* Ready — host can launch */}
                    {game.status === "ready" && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <Badge className="rounded-(--radius) bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[9px] font-mono uppercase">Draft Ready</Badge>
                          <Badge variant="outline" className="rounded-(--radius) text-[9px] font-mono uppercase border-border/50">{game.type === "qa" ? "Q&A Battle" : "Word Guess"}</Badge>
                        </div>
                        <p className="font-mono text-sm font-bold text-foreground">{game.prompt}</p>
                        {!isHost && (
                          <p className="text-[10px] font-mono text-muted-foreground uppercase">Waiting for host to launch the challenge…</p>
                        )}
                        {isHost && (
                          <div className="flex gap-3">
                            <Button
                              className="flex-1 rounded-(--radius) h-12 font-mono font-bold uppercase tracking-widest"
                              disabled={startGame.isPending}
                              onClick={() => startGame.mutate({ code, type: game.type, prompt: game.prompt }, {
                                onSuccess: () => toast.success("Challenge started!"),
                                onError: (e: any) => toast.error(e?.message || "Failed to start"),
                              })}
                            >
                              {startGame.isPending ? <RefreshCw className="size-4 animate-spin" /> : "Launch Challenge"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Running — WORD GUESS */}
                    {game.status === "running" && isWordGuess && (
                      <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-2">
                          <Badge className="rounded-(--radius) bg-primary/10 text-primary border border-primary/30 text-[9px] font-mono uppercase">Word Guess</Badge>
                          <span className="font-mono text-[10px] text-muted-foreground uppercase">{game.prompt}</span>
                        </div>

                        {/* Masked word tiles */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {(game.maskedWord || "").split("").map((ch, i) => (
                            <div
                              key={i}
                              className={cn(
                                "flex size-10 items-center justify-center border-b-2 font-mono text-lg font-black uppercase transition-colors",
                                ch !== "_" ? "border-primary text-foreground" : "border-border/50 text-transparent",
                              )}
                            >
                              {ch !== "_" ? ch : "·"}
                            </div>
                          ))}
                        </div>

                        {/* Wrong letters */}
                        {(game.wrongLetters?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {game.wrongLetters!.map((l) => (
                              <Badge key={l} variant="outline" className="rounded-(--radius) border-destructive/30 text-destructive bg-destructive/5 font-mono text-xs">{l}</Badge>
                            ))}
                          </div>
                        )}

                        {/* Guess input */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a letter or full word…"
                            className="rounded-(--radius) h-11 font-mono text-xs uppercase"
                            value={gameInput}
                            onChange={(e) => setGameInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                            maxLength={30}
                          />
                          <Button
                            className="rounded-(--radius) h-11 px-6 font-mono uppercase font-bold"
                            disabled={submitGameAnswer.isPending || !gameInput.trim()}
                            onClick={handleSubmitAnswer}
                          >
                            {submitGameAnswer.isPending ? <RefreshCw className="size-4 animate-spin" /> : "Guess"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Running — Q&A */}
                    {game.status === "running" && isQa && (
                      <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-2">
                          <Badge className="rounded-(--radius) bg-primary/10 text-primary border border-primary/30 text-[9px] font-mono uppercase">Q&A Battle</Badge>
                        </div>
                        <p className="font-mono text-sm font-bold leading-snug text-foreground">{game.prompt}</p>

                        {myQaResponse ? (
                          <div className="rounded-(--radius) border border-border/50 bg-muted/30 p-4 text-center">
                            <Check className="mx-auto mb-2 size-6 text-emerald-500" />
                            <p className="font-mono text-[10px] font-bold uppercase text-muted-foreground">Answer submitted — waiting for others…</p>
                          </div>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {(game.options || []).map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedOption(idx)}
                                className={cn(
                                  "flex items-center gap-3 rounded-(--radius) border p-3 text-left font-mono text-xs font-bold transition-all hover:border-primary/50",
                                  selectedOption === idx
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border/50 bg-muted/20 text-foreground hover:bg-muted/40",
                                )}
                              >
                                <span className={cn(
                                  "flex size-6 shrink-0 items-center justify-center rounded-(--radius) text-[10px] font-black",
                                  selectedOption === idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                                )}>
                                  {OPTION_LABELS[idx]}
                                </span>
                                <span className="leading-tight">{opt}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {!myQaResponse && (
                          <Button
                            className="rounded-(--radius) h-11 font-mono font-bold uppercase tracking-widest"
                            disabled={submitGameAnswer.isPending || selectedOption === null}
                            onClick={handleSubmitAnswer}
                          >
                            {submitGameAnswer.isPending ? <RefreshCw className="size-4 animate-spin" /> : "Submit Answer"}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Reveal — QA results */}
                    {game.status === "reveal" && isQa && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <Badge className="rounded-(--radius) bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[9px] font-mono uppercase">Round Over</Badge>
                        </div>
                        <p className="font-mono text-sm font-bold text-foreground">{game.prompt}</p>
                        <div className="grid gap-2">
                          {(game.options || []).map((opt, idx) => {
                            const isCorrect = idx === game.correctOption;
                            const count = optionCounts[idx] ?? 0;
                            const pct = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "rounded-(--radius) border p-3 font-mono text-xs",
                                  isCorrect
                                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "border-border/50 bg-muted/20 text-muted-foreground",
                                )}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "flex size-5 items-center justify-center rounded-(--radius) text-[9px] font-black",
                                      isCorrect ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
                                    )}>
                                      {OPTION_LABELS[idx]}
                                    </span>
                                    <span className="font-bold leading-tight">{opt}</span>
                                  </div>
                                  <span className="shrink-0 font-black">{count} <span className="font-normal opacity-60">({pct}%)</span></span>
                                </div>
                                <Progress
                                  value={pct}
                                  className={cn("h-1 rounded-(--radius)", isCorrect ? "bg-emerald-500/20" : "bg-muted")}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cycle Check-In overlay */}
          <AnimatePresence>
            {room.timer?.checkInOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <Card className="rounded-(--radius) border-primary/40 overflow-hidden shadow-lg">
                  <div className="h-1 bg-primary animate-pulse" />
                  <CardContent className="p-6 text-center space-y-5">
                    <div>
                      <Badge variant="outline" className="rounded-(--radius) border-primary/50 text-primary font-mono text-[9px] uppercase">Cycle {room.timer?.cycle} Check-in</Badge>
                      <h3 className="mt-2 font-mono text-lg font-black italic uppercase tracking-tight">How did that go?</h3>
                    </div>
                    <div className="grid gap-2">
                      {[
                        { status: "completed" as const, label: "Crushed it!", color: "bg-emerald-500" },
                        { status: "partial" as const, label: "Got a lot done", color: "bg-amber-500" },
                        { status: "not_done" as const, label: "Barely started", color: "bg-destructive" },
                      ].map(({ status, label, color }) => (
                        <Button
                          key={status}
                          variant="outline"
                          className="rounded-(--radius) h-11 justify-start border-border/50 font-mono text-[10px] font-bold uppercase gap-3"
                          onClick={() => submitCheckIn.mutate({ code, status })}
                        >
                          <span className={cn("size-2 rounded-full", color)} />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Media player */}
          <Card className="rounded-(--radius) border-border/50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
              <div className="flex items-center gap-2">
                <Music className="size-4 text-primary" />
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest">Media Player</h3>
                {room.sharedMedia?.updatedByName && (
                  <span className="text-[9px] font-mono text-muted-foreground">— cast by {room.sharedMedia.updatedByName}</span>
                )}
              </div>
              {isHost && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="YouTube URL…"
                    className="h-8 w-52 rounded-(--radius) border-border/50 bg-muted/20 font-mono text-[10px]"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && mediaUrl) {
                        postMedia.mutateAsync({ code, url: mediaUrl }).then(() => setMediaUrl(""));
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 rounded-(--radius) font-mono text-[9px] uppercase"
                    disabled={!mediaUrl || postMedia.isPending}
                    onClick={() => postMedia.mutateAsync({ code, url: mediaUrl }).then(() => setMediaUrl(""))}
                  >
                    Cast
                  </Button>
                </div>
              )}
            </div>
            <div className="aspect-video bg-black relative">
              <div id="yt-player" className="absolute inset-0 size-full" />
              {!videoId && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground/30">
                  <Music className="size-12" />
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest">
                    {isHost ? "Paste a YouTube URL above to cast to the room" : "Waiting for host to cast media…"}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Tasks */}
          <Card className="rounded-(--radius) border-border/50 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-primary" />
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest">Session Objectives</h3>
              </div>
              {isHost && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="outline" className="rounded-(--radius) border-border/50 size-7">
                      <Plus className="size-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background rounded-(--radius) border-border/50">
                    <DialogHeader>
                      <DialogTitle className="font-mono italic tracking-tighter">New Objective</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        placeholder="Objective description…"
                        className="rounded-(--radius) font-mono text-xs"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && taskTitle) {
                            createTask.mutate({ code, title: taskTitle, points: 50 }, {
                              onSuccess: () => setTaskTitle(""),
                            });
                          }
                        }}
                      />
                      <Button
                        className="w-full rounded-(--radius) font-mono text-xs uppercase font-bold"
                        disabled={!taskTitle || createTask.isPending}
                        onClick={() => createTask.mutate({ code, title: taskTitle, points: 50 }, { onSuccess: () => setTaskTitle("") })}
                      >
                        {createTask.isPending ? "Creating…" : "Create Objective"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <CardContent className="p-5">
              {(!room.tasks || room.tasks.length === 0) ? (
                <p className="py-8 text-center font-mono text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                  No objectives yet.{isHost ? " Add one above." : ""}
                </p>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {room.tasks.map((t) => {
                      const alreadyDone = t.completedBy?.some(
                        (c) => (user?.id && c.userId === user.id) || (myGuestId && c.guestId === myGuestId),
                      );
                      return (
                        <motion.div
                          key={t.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center gap-3 rounded-(--radius) border border-border/50 bg-muted/20 p-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-mono text-xs font-bold truncate", alreadyDone && "line-through text-muted-foreground")}>{t.title}</p>
                            <p className="font-mono text-[9px] text-primary font-bold">{t.points} XP reward</p>
                          </div>
                          <Button
                            size="icon"
                            variant={alreadyDone ? "secondary" : "ghost"}
                            className="size-7 rounded-(--radius) shrink-0"
                            disabled={completeTask.isPending || alreadyDone}
                            onClick={() => completeTask.mutate({ code, taskId: t.id })}
                          >
                            {alreadyDone ? <Check className="size-3 text-emerald-500" /> : <div className="size-2 rounded-full border border-border" />}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My stats + avatar */}
          <Card className="rounded-(--radius) border-border/50 shadow-sm pb-20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {myParticipant && (
                    <img
                      src={buildAvatarUri(myParticipant.displayName, myParticipant.avatarConfig)}
                      className="size-12 rounded-full border-2 border-primary/30 bg-muted"
                      alt=""
                    />
                  )}
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">{myDisplayName}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {leaderboard.find((p) => p.displayName === myDisplayName)?.points ?? 0} XP
                      {" · "}Rank #{(leaderboard.findIndex((p) => p.displayName === myDisplayName) + 1) || "—"}
                    </p>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-(--radius) font-mono text-[9px] uppercase border-border/50">
                      Edit Avatar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-[95vw] rounded-(--radius) border-border/50 bg-background shadow-2xl p-0 sm:max-w-xl">
                    <div className="border-b border-border/50 px-4 py-4 sm:px-5">
                      <h2 className="font-mono text-base font-bold italic tracking-tighter">Avatar Builder</h2>
                    </div>
                    <AvatarBuilder
                      initialConfig={myParticipant?.avatarConfig as Record<string, string> | undefined}
                      onUpdate={(c) => updateAvatar.mutate({ code, avatarConfig: c })}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Slide-out chat */}
      <AnimatePresence>
        {isChatOpen && (
          <SprintChat
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={messages}
            myDisplayName={myDisplayName}
            onSendMessage={(c) => {
              const gName = user ? undefined : myDisplayName;
              const gId = user ? undefined : ensureGuestId();
              sendMessage.mutate(
                { code, content: c, guestName: gName, guestId: gId },
                { onSuccess: (saved) => roomSocket.relayMessage(saved as unknown as Record<string, unknown>) },
              );
            }}
            onTyping={(is) => roomSocket.emitTyping(is, myDisplayName)}
            typingUsers={typingUsers}
          />
        )}
      </AnimatePresence>

      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {/* Chat */}
        <Button
          size="icon"
          className="relative size-13 rounded-(--radius) shadow-xl"
          onClick={() => setIsChatOpen((v) => !v)}
        >
          <MessageSquare className="size-5" />
          {messages.length > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {messages.length > 99 ? "99+" : messages.length}
            </span>
          )}
        </Button>

        {/* Ready toggle — only visible when a ready check is open */}
        {room.readyState?.isOpen && (
          <Button
            size="icon"
            variant={amIReady ? "default" : "outline"}
            className={cn("size-13 rounded-(--radius) shadow-xl border-2", amIReady ? "border-emerald-500 bg-emerald-500 hover:bg-emerald-600" : "border-border")}
            onClick={async () => {
              const guestId = user ? undefined : ensureGuestId();
              await toggleGameReady.mutateAsync({ code, ready: !amIReady, guestId });
              refetch();
            }}
          >
            {amIReady ? <Check className="size-5" /> : <Users className="size-5" />}
          </Button>
        )}
      </div>
    </main>
  );
}
