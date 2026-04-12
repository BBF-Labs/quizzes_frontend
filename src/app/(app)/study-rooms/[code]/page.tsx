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
  useUpdateStudyRoomTimer 
} from "@/hooks/study-rooms/use-study-rooms";
import { useStudyRoomSocket } from "@/hooks/study-rooms/use-study-room-socket";
import { getSessionUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
  Check,
  RefreshCw,
  MoreVertical,
  Shield,
  MicOff,
  UserMinus,
  Star,
  ExternalLink
} from "lucide-react";
import { SprintChat } from "@/components/study-rooms/kahoot-chat";
import { RoomOverlays } from "@/components/study-rooms/room-overlays";
import { CircularTimer } from "@/components/study-rooms/circular-timer";
import { AvatarBuilder } from "@/components/study-rooms/avatar-builder";
import { useStudyRoomLayout } from "@/app/(app)/study-rooms/study-room-layout-provider";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { cn } from "@/lib/utils";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const ensureGuestId = (): string => {
  const key = "study_room_guest_id";
  const existing = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (existing) return existing;
  const next = `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (typeof window !== "undefined") localStorage.setItem(key, next);
  return next;
};

const buildAvatarUri = (seed: string, avatarConfig?: Record<string, unknown>): string => {
  const safeSeed = seed || "study-user";
  const avatar = createAvatar(avataaars, {
    seed: safeSeed,
    backgroundColor: ["d1d4f9", "c0aede", "b6e3f4", "ffd5dc"],
    ...(avatarConfig || {}),
  });
  return avatar.toDataUri();
};

const getYouTubeEmbedUrl = (rawUrl: string): string | null => {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.toLowerCase();
    const isYouTubeHost = host.includes("youtu.be") || host.includes("youtube.com");
    if (!isYouTubeHost) return null;
    if (host.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}?autoplay=0&rel=0` : null;
    }
    const id = parsed.searchParams.get("v") || parsed.pathname.split("/").pop();
    return id ? `https://www.youtube.com/embed/${id}?autoplay=0&rel=0` : null;
  } catch { return null; }
};

export default function StudyRoomDetailPage() {
  const params = useParams<{ code: string }>();
  const code = String(params?.code || "").toUpperCase();
  const user = getSessionUser();
  
  const { data, refetch, isLoading } = useStudyRoom(code);
  const room = data?.room;
  const messages = data?.messages || [];
  const leaderboard = data?.leaderboard || [];
  const participants = room?.participants?.filter(p => !p.leftAt) || [];

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [xpFx, setXpFx] = useState<{ delta: number; label: string } | null>(null);
  const [timerSize, setTimerSize] = useState(280);
  const [isOverlayDismissed, setIsOverlayDismissed] = useState(false);
  const [localRemaining, setLocalRemaining] = useState<number | null>(null);
  const [gameInput, setGameInput] = useState("");
  const [inviteValue, setInviteValue] = useState("");

  useEffect(() => {
    const updateSize = () => {
      setTimerSize(window.innerWidth < 640 ? 220 : 320);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Local Timer Ticker with Drift Correction (Anchored to Server startedAt)
  const hasAutoTickedRef = useRef(false);
  useEffect(() => {
    if (!room?.timer) return;
    hasAutoTickedRef.current = false;

    const syncTimer = () => {
      const initialRemaining = room.timer?.remainingSeconds ?? 0;
      const startedAt = room.timer?.startedAt ? new Date(room.timer.startedAt).getTime() : null;
      const isRunning = room.timer?.isRunning;

      if (!isRunning || !startedAt) {
        setLocalRemaining(initialRemaining);
        return;
      }

      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, initialRemaining - elapsed);
      setLocalRemaining(remaining);

      // Host auto-completes the cycle when timer reaches zero
      if (remaining === 0 && !hasAutoTickedRef.current) {
        hasAutoTickedRef.current = true;
        const myId = user?.id;
        const myParticipantRole = room?.participants?.find(
          (p: any) => p.userId === myId && !p.leftAt,
        )?.role;
        const iAmHost =
          room?.hostId === myId || myParticipantRole === "host" || myParticipantRole === "moderator";
        if (iAmHost) {
          updateTimer.mutate({ roomCode: code, action: "tickComplete" });
        }
      }
    };

    syncTimer();
    const ticker = setInterval(syncTimer, 1000);
    return () => clearInterval(ticker);
  }, [room?.timer?.isRunning, room?.timer?.startedAt, room?.timer?.remainingSeconds]);

  const roomSocket = useStudyRoomSocket(code, {
    onPresence: () => refetch(),
    onMessage: () => refetch(),
    onTimer: () => refetch(),
    onTyping: (p) => {
        const sender = String(p?.senderName || "");
        const myName = user?.name || (typeof window !== "undefined" ? localStorage.getItem("study_room_guest_name") || guestName : guestName);
        if (!sender || sender === myName) return;
        setTypingUsers(prev => p?.isTyping ? (prev.includes(sender) ? prev : [...prev, sender]) : prev.filter(n => n !== sender));
    },
    onTask: () => refetch(),
    onGame: () => refetch(),
    onXp: (p) => {
        const myId = user?.id || (typeof window !== "undefined" ? localStorage.getItem("study_room_guest_id") || "" : "");
        if (p?.actorId === myId) {
            setXpFx({ delta: p.delta, label: p.delta > 0 ? `+${p.delta} XP` : `${p.delta} XP` });
            setTimeout(() => setXpFx(null), 1500);
        }
        refetch();
    },
    onMilestone: () => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        refetch();
    },
    onMediaSync: (p) => {
        if (isHost) return; // Host doesn't follow others
        if (!playerRef.current) return;
        
        const player = playerRef.current;
        const serverTime = p.currentTime;
        const localTime = player.getCurrentTime();
        const diff = Math.abs(serverTime - localTime);
        
        // Sync Playback State
        if (p.status === "playing") {
            player.playVideo();
        } else {
            player.pauseVideo();
        }
        
        // Correct Drift
        if (diff > 2.5) {
            player.seekTo(serverTime, true);
        }
    },
    onReady: () => refetch(),
    onCheckIn: () => refetch(),
    onSharedMedia: () => refetch(),
    onGameState: () => refetch(),
    onModeration: (p) => {
        const myId = user?.id || (typeof window !== "undefined" ? localStorage.getItem("study_room_guest_id") : "");
        if (p?.targetUserId === myId || p?.targetGuestId === myId) {
            if (p.action === "kick") {
                toast.error("You've been removed from the room.");
                window.location.href = "/study-rooms";
            } else if (p.action === "mute") {
                toast.warning("The host has muted your chat.");
            }
        }
        refetch();
    }
  });

  const myParticipant = useMemo(() => {
    const myId = user?.id;
    const guestId = typeof window !== "undefined" ? localStorage.getItem("study_room_guest_id") : null;
    return (room?.participants || []).find(p => (myId && p.userId === myId) || (guestId && p.guestId === guestId));
  }, [room?.participants, user?.id]);

  const isHost = useMemo(() => {
    if (!room || !user?.id) return false;
    return room.hostId === user.id || myParticipant?.role === "host";
  }, [room, user, myParticipant]);

  const progress = useMemo(() => {
    if (!room?.timer?.durationSeconds || localRemaining === null) return 0;
    return ((room.timer.durationSeconds - localRemaining) / room.timer.durationSeconds) * 100;
  }, [room?.timer?.durationSeconds, localRemaining]);

  const remainingFormatted = useMemo(() => {
    const s_total = localRemaining ?? 0;
    const m = Math.floor(s_total / 60).toString().padStart(2, "0");
    const s = (s_total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [localRemaining]);

  const activeOverlay = useMemo(() => {
    if (isOverlayDismissed) return null;
    if (room?.readyState?.isOpen) return "ready_check";
    if (room?.timer?.isRunning) return "focus";
    return null;
  }, [room?.timer?.isRunning, room?.readyState?.isOpen, isOverlayDismissed]);

  // YouTube API Integration
  const playerRef = useRef<any>(null);
  
  useEffect(() => {
    if ((window as any).YT) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
    (window as any).onYouTubeIframeAPIReady = () => {
        console.log("YouTube API Ready");
    };
  }, []);

  const videoId = useMemo(() => {
    const url = room?.sharedMedia?.currentUrl || "";
    if (!url) return null;
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
        if (u.hostname.includes("youtu.be")) return u.pathname.substring(1);
    } catch { return null; }
    return null;
  }, [room?.sharedMedia?.currentUrl]);

  useEffect(() => {
    if (!videoId || !document.getElementById("youtube-player")) return;
    
    const initPlayer = () => {
        if (!(window as any).YT || !(window as any).YT.Player) {
            setTimeout(initPlayer, 200);
            return;
        }
        
        if (playerRef.current) {
            playerRef.current.loadVideoById(videoId);
            return;
        }

        playerRef.current = new (window as any).YT.Player("youtube-player", {
            height: "100%",
            width: "100%",
            videoId: videoId,
            playerVars: {
                autoplay: room?.sharedMedia?.status === "playing" ? 1 : 0,
                controls: isHost ? 1 : 0,
                modestbranding: 1,
            },
            events: {
                onReady: (event: any) => {
                    const iframe = event.target.getIframe();
                    if (iframe) {
                        iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
                        iframe.setAttribute("allowfullscreen", "true");
                    }
                },
                onStateChange: (event: any) => {
                    if (!isHost) return;
                    const status = event.data === 1 ? "playing" : "paused";
                    syncMediaState.mutate({ 
                        status, 
                        currentTime: playerRef.current.getCurrentTime() 
                    });
                }
            }
        });
    };

    initPlayer();
  }, [videoId, isHost]);

  // Persistent Sync for Host
  useEffect(() => {
    if (!isHost || !playerRef.current || room?.sharedMedia?.status !== "playing") return;
    
    const interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getPlayerState() === 1) {
            syncMediaState.mutate({ 
                status: "playing", 
                currentTime: playerRef.current.getCurrentTime() 
            });
        }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isHost, room?.sharedMedia?.status]);

  if (isLoading || !room) return <div className="h-screen w-full bg-background flex items-center justify-center"><Skeleton className="h-20 w-80 rounded-(--radius)" /></div>;

  return (
    <main className="relative min-h-screen bg-background text-foreground no-scrollbar">
      {/* State Overlays */}
      <RoomOverlays 
        state={activeOverlay as any} 
        onDismiss={() => setIsOverlayDismissed(true)} 
      />

      {/* Main Layout */}
      <div className="mx-auto flex min-h-screen w-full max-w-[124rem] flex-col overflow-hidden p-6 md:flex-row gap-6">
        
        {/* Left Side: Stats & Participants */}
        <aside className="hidden w-80 flex-col gap-6 lg:flex overflow-y-auto no-scrollbar">
            <Card className="rounded-(--radius) border-border/50 bg-card shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4">
                        <div className="space-y-1">
                            <h2 className="text-lg font-mono font-bold tracking-tight text-foreground italic">{room.title}</h2>
                            <Badge variant="outline" className="rounded-(--radius) px-2 py-0 border-border/50 text-muted-foreground font-mono text-[10px]">{room.roomCode}</Badge>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="rounded-(--radius) hover:bg-accent text-muted-foreground">
                                    <Settings className="size-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-(--radius) border-border/50 bg-background sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="font-mono italic tracking-tighter">Room Configuration</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="flex items-center justify-between rounded-(--radius) border border-border/50 p-4 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-mono font-bold italic tracking-tight uppercase">Immersive Mode</Label>
                                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-tight">Hide global navigation components.</p>
                                        </div>
                                        <Switch 
                                            checked={isImmersive} 
                                            onCheckedChange={setIsImmersive} 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-mono font-bold uppercase text-muted-foreground/80">Invite Protocol</p>
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="Identity/Email..." 
                                                className="rounded-(--radius) border-border/50 font-mono text-xs uppercase" 
                                                value={inviteValue}
                                                onChange={(e) => setInviteValue(e.target.value)}
                                            />
                                            <Button 
                                                variant="outline" 
                                                className="rounded-(--radius) text-xs uppercase font-mono" 
                                                disabled={inviteByUsername.isPending || inviteByEmail.isPending}
                                                onClick={() => {
                                                    if (inviteValue.includes("@")) {
                                                        inviteByEmail.mutate({ code, email: inviteValue }, {
                                                            onSuccess: () => toast.success(`Invite sent to ${inviteValue}`),
                                                            onError: () => toast.error("Failed to send email invite")
                                                        });
                                                    } else {
                                                        inviteByUsername.mutate({ code, username: inviteValue }, {
                                                            onSuccess: () => toast.success(`Invite sent to @${inviteValue}`),
                                                            onError: () => toast.error("User not found or invite failed")
                                                        });
                                                    }
                                                    setInviteValue("");
                                                }}
                                            >
                                                Invite
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {isHost && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-mono font-bold uppercase text-muted-foreground/80">AI Game Generation</p>
                                            <div className="flex gap-2">
                                                <Button 
                                                    className="flex-1 rounded-(--radius) font-mono text-[10px] items-center gap-2"
                                                    variant="secondary"
                                                    disabled={generateAiGame.isPending}
                                                    onClick={() => generateAiGame.mutate({ code, type: "word_guess" }, {
                                                        onSuccess: () => toast.success("Z is drafting a word challenge..."),
                                                        onError: () => toast.error("AI failed to generate challenge")
                                                    })}
                                                >
                                                    {generateAiGame.isPending ? <span className="size-2 bg-primary rounded-full animate-pulse" /> : null}
                                                    Word Guess
                                                </Button>
                                                <Button 
                                                    className="flex-1 rounded-(--radius) font-mono text-[10px] items-center gap-2"
                                                    variant="secondary"
                                                    disabled={generateAiGame.isPending}
                                                    onClick={() => generateAiGame.mutate({ code, type: "qa" }, {
                                                        onSuccess: () => toast.success("Z is preparing a Q&battle..."),
                                                        onError: () => toast.error("AI failed to generate challenge")
                                                    })}
                                                >
                                                    {generateAiGame.isPending ? <span className="size-2 bg-primary rounded-full animate-pulse" /> : null}
                                                    Q&A Battle
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between rounded-(--radius) border border-border/50 p-4 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-mono font-bold italic tracking-tight uppercase">Media Follow Mode</Label>
                                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-tight">Follow host broadcast or use personal media.</p>
                                        </div>
                                        <Switch 
                                            checked={(myParticipant as any)?.mediaMode !== "personal"} 
                                            onCheckedChange={(checked) => {
                                                updateMediaPreference.mutate({ 
                                                    code, 
                                                    mode: checked ? "follow_host" : "personal",
                                                    guestId: user ? undefined : (typeof window !== "undefined" ? localStorage.getItem("study_room_guest_id") || "" : "")
                                                });
                                            }} 
                                        />
                                    </div>

                                    <Button className="rounded-(--radius) gap-2 w-full" variant="outline" onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success("Link copied!");
                                    }}>
                                        <Copy className="size-4" /> Copy Room Link
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground/80">Who's Here</span>
                            <span className="text-sm font-mono font-bold text-foreground">{participants.length} Studiers</span>
                        </div>
                        <div className="flex -space-x-2">
                            <AnimatePresence>
                                {participants.slice(0, 5).map((p, i) => (
                                    <motion.img 
                                        key={p.userId || p.guestId || p.displayName} 
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        src={buildAvatarUri(p.displayName, p.avatarConfig)} 
                                        className="size-8 rounded-full border-2 border-background bg-muted" 
                                        alt="" 
                                    />
                                ))}
                                {participants.length > 5 && (
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground"
                                    >
                                        +{(participants.length - 5)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex-1 rounded-(--radius) border-border/50 bg-card shadow-sm overflow-hidden flex flex-col font-mono text-xs">
                 <div className="p-6 border-b border-border/50 flex items-center gap-2">
                    <Trophy className="size-4 text-primary" />
                    <h3 className="font-bold uppercase tracking-widest text-[10px]">Leaderboard</h3>
                 </div>
                 <ScrollArea className="flex-1">
                    <div className="divide-y divide-white/5">
                        <AnimatePresence mode="popLayout">
                        {leaderboard.map((p, i) => (
                            <motion.div 
                                key={p.userId || p.guestId || p.displayName} 
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={cn("text-base font-bold italic", i === 0 ? "text-primary" : "text-muted-foreground")}>#{i + 1}</span>
                                    <img src={buildAvatarUri(p.displayName, p.avatarConfig)} className="size-9 rounded-full bg-background border border-border/50" alt="" />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="truncate text-[11px] font-bold uppercase tracking-tight text-foreground">{p.displayName}</p>
                                            {p.role === "host" && <Star className="size-2.5 text-amber-400 fill-current" />}
                                            {p.role === "moderator" && <Shield className="size-2.5 text-blue-400" />}
                                        </div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Level {p.level || 1} • {p.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="rounded-(--radius) font-mono text-[10px]">{p.points || 0} XP</Badge>
                                    
                                     {isHost && p.userId !== user?.id ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="size-7 rounded-md text-muted-foreground">
                                                    <MoreVertical className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl font-mono text-[10px] uppercase font-bold">
                                                <DropdownMenuLabel>Moderation Suite</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {p.role !== "moderator" && (
                                                    <DropdownMenuItem onClick={() => updateRole.mutate({ code, memberUserId: p.userId!, role: "moderator" }, {
                                                        onSuccess: () => toast.success(`${p.displayName} promoted to Moderator`)
                                                    })}>
                                                        <Shield className="mr-2 size-3 text-blue-400" /> Promote to Mod
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => moderateMember.mutate({ code, memberUserId: p.userId, memberGuestId: p.guestId, action: "mute" }, {
                                                    onSuccess: () => toast.success(`${p.displayName} has been muted`)
                                                })}>
                                                    <MicOff className="mr-2 size-3 text-amber-500" /> Mute Member
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => moderateMember.mutate({ code, memberUserId: p.userId, memberGuestId: p.guestId, action: "kick" }, {
                                                    onSuccess: () => toast.success(`${p.displayName} has been removed`)
                                                })} className="text-red-500 hover:text-red-500">
                                                    <UserMinus className="mr-2 size-3" /> Eject from Room
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : p.userId === user?.id && p.role === "host" ? (
                                        <Badge variant="outline" className="rounded-full border-amber-500/30 text-amber-500 bg-amber-500/5 font-mono text-[8px] uppercase font-bold">You (Host)</Badge>
                                    ) : null}
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                 </ScrollArea>
            </Card>
        </aside>

        {/* Center Stage: Timer & Video */}
        <section className="flex flex-1 flex-col gap-6 overflow-y-auto no-scrollbar relative">
            {/* Header Mobile */}
            <div className="flex items-center justify-between lg:hidden border-b border-white/10 pb-4">
                 <h2 className="text-xl font-black tracking-tight">{room?.title}</h2>
                 <Badge className="rounded-(--radius) bg-indigo-500">{room?.roomCode}</Badge>
            </div>

            {/* Circular Timer Display */}
            <div className="flex flex-col items-center justify-center gap-8 py-10 md:py-20 bg-card rounded-(--radius) border border-border/50 shadow-sm relative overflow-hidden group">
                
                <CircularTimer 
                    percentage={progress} 
                    remainingTime={remainingFormatted} 
                    size={timerSize} 
                    color="#10b981" 
                />

                <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
                    {isHost && (
                        <>
                            <Button 
                                className="rounded-(--radius) size-12 font-mono"
                                onClick={() => updateTimer.mutate({ code, action: room.timer?.isRunning ? "pause" : "start" })}
                            >
                                {room.timer?.isRunning ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
                            </Button>
                            <Button 
                                variant="outline" 
                                className="rounded-(--radius) size-12 border-border/50"
                                onClick={() => updateTimer.mutate({ code, action: "reset" })}
                            >
                                <RotateCcw className="size-5" />
                            </Button>
                            <Button 
                                className="rounded-(--radius) h-12 px-6 text-[10px] font-mono font-bold uppercase tracking-widest"
                                onClick={() => updateTimer.mutate({ code, action: "tickComplete" })}
                            >
                                <CheckCircle2 className="size-4 mr-2" /> Complete Cycle
                            </Button>
                        </>
                    )}
                    {!myParticipant && (
                        <Button className="rounded-(--radius) px-10 h-14 text-sm font-bold uppercase tracking-widest shadow-sm" onClick={() => join.mutate({ code })}>Join Study Crew</Button>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary px-4 py-1 font-mono font-bold uppercase tracking-widest text-[9px]">
                       Sprint Cycle {room.timer?.cycle || 0}
                    </Badge>
                </div>

                {room.activeGame && (room.activeGame.status === "generating" || room.activeGame.status === "ready" || room.activeGame.isActive) && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 backdrop-blur-sm bg-background/40">
                        <Card className="w-full max-w-lg border-2 border-primary/50 shadow-2xl bg-card">
                            <CardContent className="p-8 text-center space-y-6">
                                {room.activeGame.status === "generating" ? (
                                    <div className="py-10 space-y-4 flex flex-col items-center">
                                        <RefreshCw className="size-12 animate-spin text-primary opacity-50" />
                                        <div className="space-y-1">
                                            <Badge variant="secondary" className="rounded-full font-mono text-[10px] uppercase font-bold tracking-[0.2em]">Setting things up...</Badge>
                                            <p className="text-muted-foreground text-[10px] font-mono font-bold uppercase">Z is getting your session ready</p>
                                        </div>
                                    </div>
                                ) : room.activeGame.status === "ready" ? (
                                    <div className="space-y-6">
                                        <Badge variant="outline" className="rounded-full font-mono text-[10px] uppercase font-bold tracking-[0.2em] border-emerald-500/50 text-emerald-500 bg-emerald-500/5">Session Ready</Badge>
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-mono font-black italic tracking-tighter text-foreground">
                                                {isHost ? `Draft: ${room.activeGame.prompt}` : "Hold Position"}
                                            </h2>
                                            <p className="text-muted-foreground text-[10px] font-mono font-bold uppercase">
                                                {isHost ? "Ready to deploy this challenge to the crew?" : "The host is finalizing the AI session parameters."}
                                            </p>
                                        </div>
                                         {isHost && (
                                            <Button 
                                                className="w-full rounded-(--radius) h-14 uppercase font-mono font-bold text-lg shadow-lg shadow-primary/20"
                                                onClick={() => startGame.mutate({ code }, {
                                                    onSuccess: () => toast.success("Challenge deployed to the room!")
                                                })}
                                                disabled={startGame.isPending}
                                            >
                                                {startGame.isPending ? <RefreshCw className="size-5 animate-spin" /> : "Start Challenge"}
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Badge variant="secondary" className="rounded-full font-mono text-[10px] uppercase font-bold tracking-[0.2em]">Game in Progress</Badge>
                                        <h2 className="text-2xl font-mono font-black italic tracking-tighter text-foreground">{room.activeGame?.prompt}</h2>
                                        {room.activeGame.type === "word_guess" && (
                                            <div className="flex flex-col gap-6">
                                                <div className="flex justify-center gap-2">
                                                    {(room.activeGame.maskedWord || "").split("").map((c, i) => (
                                                        <div key={i} className="size-10 flex items-center justify-center rounded-lg border-2 border-primary/20 bg-muted font-mono text-xl font-bold uppercase">
                                                            {c === "_" ? "" : c}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-center flex-wrap gap-2 max-w-sm mx-auto">
                                                    {room.activeGame.wrongLetters?.map(l => (
                                                        <Badge key={l} variant="outline" className="rounded-md border-red-500/20 text-red-500 opacity-50">{l}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="Type answer..." 
                                                className="rounded-(--radius) font-mono uppercase text-xs h-12"
                                                value={gameInput}
                                                onChange={(e) => setGameInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && submitGameAnswer.mutate({ code, answer: gameInput })}
                                            />
                                            <Button 
                                                className="rounded-(--radius) px-6 h-12 uppercase font-mono font-bold"
                                                disabled={submitGameAnswer.isPending || !gameInput.trim()}
                                                onClick={() => {
                                                    submitGameAnswer.mutate({ code, answer: gameInput });
                                                    setGameInput("");
                                                }}
                                            >
                                                {submitGameAnswer.isPending ? "Submitting..." : "Submit"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Cycle Check-in Overlay */}
                <AnimatePresence>
                    {room.timer?.checkInOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 z-30 flex items-center justify-center p-6 backdrop-blur-md bg-background/60"
                        >
                            <Card className="w-full max-w-sm border-2 border-primary/50 shadow-2xl bg-card overflow-hidden">
                                <div className="h-1 bg-primary animate-pulse w-full" />
                                <CardContent className="p-8 text-center space-y-6">
                                    <div className="space-y-1">
                                        <Badge variant="outline" className="rounded-full font-mono text-[10px] uppercase font-bold tracking-[0.2em] border-primary/50 text-primary">Session Check-in</Badge>
                                        <h3 className="text-xl font-mono font-black italic tracking-tighter uppercase">Cycle {room.timer?.cycle} Finished!</h3>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase font-bold">How did that session go?</p>
                                    </div>

                                    <div className="grid gap-3">
                                         <Button 
                                            variant="secondary" 
                                            className="rounded-(--radius) h-12 justify-start font-mono text-[10px] font-bold uppercase gap-3 group"
                                            onClick={() => {
                                                submitCheckIn.mutate({ code, status: "completed" });
                                                toast.success("Great job!");
                                            }}
                                        >
                                            <div className="size-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                                            Crushed it!
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            className="rounded-(--radius) h-12 justify-start font-mono text-[10px] font-bold uppercase gap-3 group"
                                            onClick={() => {
                                                submitCheckIn.mutate({ code, status: "partial" });
                                                toast.success("Every bit counts!");
                                            }}
                                        >
                                            <div className="size-2 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                                            Got a lot done
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            className="rounded-(--radius) h-12 justify-start font-mono text-[10px] font-bold uppercase gap-3 group"
                                            onClick={() => {
                                                submitCheckIn.mutate({ code, status: "not_done" });
                                                toast.error("Better luck next time");
                                            }}
                                        >
                                            <div className="size-2 rounded-full bg-red-500 group-hover:scale-125 transition-transform" />
                                            Barely started
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Video Player Card */}
            <Card className="w-full max-w-2xl mx-auto rounded-(--radius) border-border/50 bg-card overflow-hidden shadow-sm relative">
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Music className="size-4 text-primary" />
                        <h3 className="font-mono font-bold tracking-widest text-[10px]">Media Player</h3>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 rounded-(--radius) text-muted-foreground hover:text-primary"
                            disabled={!videoId}
                            onClick={() => {
                                if (!videoId) return;
                                window.open(
                                    `https://www.youtube.com/embed/${videoId}?autoplay=1`, 
                                    "StudyRoomPiP", 
                                    "width=640,height=360,menubar=no,toolbar=no,location=no,status=no,resizable=yes"
                                );
                            }}
                        >
                            <ExternalLink className="size-3.5" />
                        </Button>
                        {isHost && (
                            <div className="flex items-center gap-2 max-w-sm">
                                <Input 
                                    placeholder="Media URL..." 
                                    className="h-8 rounded-(--radius) border-border/50 bg-background text-[10px] font-mono uppercase" 
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                />
                                <Button size="sm" variant="secondary" className="h-8 rounded-(--radius) text-[10px] font-mono uppercase" onClick={async () => {
                                    await postMedia.mutateAsync({ code, url: mediaUrl });
                                    setMediaUrl("");
                                }}>Cast</Button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="aspect-video bg-black/40 relative">
                    <div id="youtube-player" className="absolute inset-0 size-full" />
                    {!videoId && (
                        <div className="flex items-center justify-center size-full flex-col gap-4 text-muted-foreground/30">
                            <Music className="size-16" />
                            <p className="font-mono font-bold uppercase tracking-[0.2em] text-[10px]">Media Link Standby</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Tasks & XP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                <Card className="rounded-(--radius) border-border/50 bg-card shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-mono font-bold tracking-widest text-[10px] text-muted-foreground">Session Objectives</h3>
                            {isHost && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="icon" variant="outline" className="rounded-(--radius) border-border/50 size-8">
                                            <Plus className="size-3" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-background rounded-(--radius) border-border/50">
                                        <DialogHeader>
                                            <DialogTitle className="font-mono italic tracking-tighter">New Objective</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <Input placeholder="Objective description..." className="rounded-(--radius) font-mono text-xs uppercase" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                                            <Button 
                                                className="w-full rounded-(--radius) font-mono text-xs uppercase font-bold" 
                                                disabled={!taskTitle || createTask.isPending}
                                                onClick={() => {
                                                    createTask.mutate({ code, title: taskTitle, points: 50 });
                                                    setTaskTitle("");
                                                }}
                                            >
                                                {createTask.isPending ? "Issuing Command..." : "Finalize Objective"}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        <ScrollArea className="h-48">
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                {room.tasks?.length ? room.tasks.map(t => (
                                    <motion.div 
                                        key={t.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center justify-between p-3 rounded-(--radius) bg-muted/30 border border-border/50"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold font-mono">{t.title}</p>
                                            <p className="text-[9px] font-mono font-bold text-primary">Reward: {t.points} XP</p>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="rounded-(--radius) hover:bg-emerald-500/10 hover:text-emerald-400"
                                            disabled={completeTask.isPending}
                                            onClick={() => completeTask.mutate({ code, taskId: t.id })}
                                        >
                                            {completeTask.isPending ? <RefreshCw className="size-3 animate-spin" /> : <div className="size-2 rounded-full bg-emerald-500" />}
                                        </Button>
                                    </motion.div>
                                )) : (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-32 text-white/20 italic text-sm"
                                    >
                                        No active tasks.
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </div>
                </Card>

                <Card className="rounded-(--radius) border-border/50 bg-card shadow-sm p-6 flex flex-col items-center justify-center text-center gap-4">
                    <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Trophy className="size-8 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-mono font-bold tracking-tight text-foreground text-sm">Sprint Record</h4>
                        <p className="text-[10px] font-mono font-bold text-muted-foreground">Rank: { (leaderboard.findIndex(p => p.displayName === (user?.name || guestName)) + 1) || "N/A" }</p>
                    </div>
                    <div className="w-full flex justify-between items-center bg-muted/30 p-4 rounded-(--radius) border border-border/50">
                        <div className="text-left">
                            <p className="text-[9px] font-mono font-bold text-muted-foreground">Session Score</p>
                            <p className="text-xl font-mono font-bold">{leaderboard.find(p => p.displayName === (user?.name || guestName))?.points || 0} <span className="text-[10px]">XP</span></p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-(--radius) font-mono text-[10px] uppercase">Identity Config</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl rounded-(--radius) border-border/50 bg-background shadow-2xl overflow-hidden p-0">
                                <div className="p-6 border-b border-border/50">
                                    <h2 className="text-xl font-mono font-bold italic tracking-tighter">Avatar Protocol</h2>
                                </div>
                                <div className="p-6">
                                    <AvatarBuilder 
                                        initialConfig={myParticipant?.avatarConfig} 
                                        onUpdate={(c) => updateAvatar.mutate({ code, avatarConfig: c })} 
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </Card>
            </div>
        </section>

        {/* Right Sidebar: Chat (Slide-out) */}
        <SprintChat 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)}
            messages={messages}
            myDisplayName={user?.name || (typeof window !== "undefined" ? localStorage.getItem("study_room_guest_name") || guestName : guestName)}
            onSendMessage={(c) => {
                const gName = user ? undefined : (typeof window !== "undefined" ? localStorage.getItem("study_room_guest_name") || guestName : guestName);
                roomSocket.sendSocketMessage(c, gName);
            }}
            onTyping={(is) => roomSocket.emitTyping(is, user?.name || guestName)}
            typingUsers={typingUsers}
        />

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-[60]">
            <Button 
                size="icon" 
                className="size-14 rounded-full shadow-2xl border-4 border-background group"
                onClick={() => setIsChatOpen(true)}
            >
                <div className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{messages.length}</div>
                <MessageSquare className="size-5 transition-transform group-hover:scale-110" />
            </Button>
            <Button 
                size="icon" 
                className="size-14 rounded-full shadow-2xl border-4 border-background group"
                onClick={async () => {
                    const guestId = user ? undefined : ensureGuestId();
                    await toggleGameReady.mutateAsync({ code, ready: !isReady, guestId });
                    setIsReady(prev => !prev);
                }}
            >
                {isReady ? <Check className="size-5" /> : <Play className="size-5 transition-transform group-hover:scale-110 ml-0.5" />}
            </Button>
        </div>
      </div>
    </main>
  );
}
