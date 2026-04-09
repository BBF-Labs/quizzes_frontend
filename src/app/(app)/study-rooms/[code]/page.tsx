"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
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
  Check
} from "lucide-react";
import { SprintChat } from "@/components/study-rooms/kahoot-chat";
import { RoomOverlays } from "@/components/study-rooms/room-overlays";
import { CircularTimer } from "@/components/study-rooms/circular-timer";
import { AvatarBuilder } from "@/components/study-rooms/avatar-builder";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { cn } from "@/lib/utils";

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

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [xpFx, setXpFx] = useState<{ delta: number; label: string } | null>(null);
  const [timerSize, setTimerSize] = useState(280);

  useEffect(() => {
    const updateSize = () => {
      setTimerSize(window.innerWidth < 640 ? 220 : 320);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

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
    if (!room?.timer?.durationSeconds) return 0;
    return ((room.timer.durationSeconds - room.timer.remainingSeconds) / room.timer.durationSeconds) * 100;
  }, [room?.timer]);

  const remainingFormatted = useMemo(() => {
    if (!room?.timer) return "00:00";
    const m = Math.floor(room.timer.remainingSeconds / 60).toString().padStart(2, "0");
    const s = (room.timer.remainingSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [room?.timer]);

  const activeOverlay = useMemo(() => {
    if (room?.readyState?.isOpen) return "ready_check";
    if (room?.timer?.isRunning) return "focus";
    return null;
  }, [room?.timer?.isRunning, room?.readyState?.isOpen]);

  if (isLoading || !room) return <div className="h-screen w-full bg-indigo-950 flex items-center justify-center"><Skeleton className="h-20 w-80 rounded-(--radius)" /></div>;

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      {/* State Overlays */}
      <RoomOverlays state={activeOverlay as any} />

      {/* Main Layout */}
      <div className="mx-auto flex min-h-screen w-full max-w-[124rem] flex-col overflow-hidden p-6 md:flex-row gap-6">
        
        {/* Left Side: Stats & Participants */}
        <aside className="hidden w-80 flex-col gap-6 lg:flex overflow-y-auto no-scrollbar">
            <Card className="rounded-(--radius) border-border/50 bg-card shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4">
                        <div className="space-y-1">
                            <h2 className="text-lg font-mono font-bold uppercase tracking-tight text-foreground italic">{room.title}</h2>
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
                                    <DialogTitle className="font-mono uppercase italic tracking-tighter">Room Configuration</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-mono font-bold uppercase text-muted-foreground/80">Invite Protocol</p>
                                        <div className="flex gap-2">
                                            <Input placeholder="Search identity..." className="rounded-(--radius) border-border/50 font-mono text-xs uppercase" />
                                            <Button variant="outline" className="rounded-(--radius) text-xs uppercase font-mono">Invite</Button>
                                        </div>
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
                            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground/80">Active Personnel</span>
                            <span className="text-sm font-mono font-bold text-foreground">{participants.length} Dispatched</span>
                        </div>
                        <div className="flex -space-x-2">
                            {participants.slice(0, 5).map((p, i) => (
                                <img key={i} src={buildAvatarUri(p.displayName, p.avatarConfig)} className="size-8 rounded-full border-2 border-background bg-muted" alt="" />
                            ))}
                            {participants.length > 5 && (
                                <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground">+{(participants.length - 5)}</div>
                            )}
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
                        {leaderboard.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={cn("text-base font-bold italic", i === 0 ? "text-primary" : "text-muted-foreground")}>#{i + 1}</span>
                                    <img src={buildAvatarUri(p.displayName, p.avatarConfig)} className="size-9 rounded-full bg-background border border-border/50" alt="" />
                                    <div className="min-w-0">
                                        <p className="truncate text-[11px] font-bold uppercase tracking-tight text-foreground">{p.displayName}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Level {p.level || 1}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="rounded-(--radius) font-mono text-[10px]">{p.points || 0} XP</Badge>
                            </div>
                        ))}
                    </div>
                 </ScrollArea>
            </Card>
        </aside>

        {/* Center Stage: Timer & Video */}
        <section className="flex flex-1 flex-col gap-6 overflow-y-auto no-scrollbar relative">
            {/* Header Mobile */}
            <div className="flex items-center justify-between lg:hidden border-b border-white/10 pb-4">
                 <h2 className="text-xl font-black uppercase tracking-tight">{room.title}</h2>
                 <Badge className="rounded-(--radius) bg-indigo-500">{room.roomCode}</Badge>
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

                {xpFx && (
                    <motion.div 
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: -100 }}
                        className="absolute bottom-20 text-3xl font-black text-emerald-400"
                    >
                        {xpFx.label}
                    </motion.div>
                )}
            </div>

            {/* Video Player Card */}
            <Card className="rounded-(--radius) border-border/50 bg-card overflow-hidden shadow-sm relative">
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Music className="size-4 text-primary" />
                        <h3 className="font-mono font-bold uppercase tracking-widest text-[10px]">Broadcast Terminal</h3>
                    </div>
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
                <div className="aspect-video bg-black/40 relative">
                    {getYouTubeEmbedUrl(room.sharedMedia?.currentUrl || "") ? (
                        <iframe 
                            src={getYouTubeEmbedUrl(room.sharedMedia?.currentUrl || "") as string} 
                            className="absolute inset-0 size-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
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
                            <h3 className="font-mono font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Session Objectives</h3>
                            {isHost && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="icon" variant="outline" className="rounded-(--radius) border-border/50 size-8">
                                            <Plus className="size-3" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-background rounded-(--radius) border-border/50">
                                        <DialogHeader>
                                            <DialogTitle className="font-mono uppercase italic tracking-tighter">New Objective</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <Input placeholder="Objective description..." className="rounded-(--radius) font-mono text-xs uppercase" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                                            <Button className="w-full rounded-(--radius) font-mono uppercase font-bold text-xs" onClick={async () => {
                                                await createTask.mutateAsync({ code, title: taskTitle, points: 25 });
                                                setTaskTitle("");
                                            }}>Authorize Objective</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        <ScrollArea className="h-48">
                            <div className="space-y-3">
                                {room.tasks?.length ? room.tasks.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-(--radius) bg-muted/30 border border-border/50">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold uppercase font-mono">{t.title}</p>
                                            <p className="text-[9px] font-mono font-bold uppercase text-primary">Reward: {t.points} XP</p>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="rounded-(--radius) h-8 text-[10px] font-mono uppercase font-bold"
                                            onClick={() => completeTask.mutate({ code, taskId: t.id })}
                                        >
                                            Verify
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center h-32 text-white/20 italic text-sm">No active tasks.</div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </Card>

                <Card className="rounded-(--radius) border-border/50 bg-card shadow-sm p-6 flex flex-col items-center justify-center text-center gap-4">
                    <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Trophy className="size-8 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-mono font-bold uppercase tracking-tight text-foreground text-sm">Sprint Record</h4>
                        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Rank: { (leaderboard.findIndex(p => p.displayName === (user?.name || guestName)) + 1) || "N/A" }</p>
                    </div>
                    <div className="w-full flex justify-between items-center bg-muted/30 p-4 rounded-(--radius) border border-border/50">
                        <div className="text-left">
                            <p className="text-[9px] font-mono font-bold uppercase text-muted-foreground">Session Score</p>
                            <p className="text-xl font-mono font-bold">{leaderboard.find(p => p.displayName === (user?.name || guestName))?.points || 0} <span className="text-[10px]">XP</span></p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-(--radius) font-mono text-[10px] uppercase">Identity Config</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl rounded-(--radius) border-border/50 bg-background shadow-2xl overflow-hidden p-0">
                                <div className="p-6 border-b border-border/50">
                                    <h2 className="text-xl font-mono font-bold uppercase italic tracking-tighter">Avatar Protocol</h2>
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
            onSendMessage={(c) => sendMessage.mutate({ code, content: c })}
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
