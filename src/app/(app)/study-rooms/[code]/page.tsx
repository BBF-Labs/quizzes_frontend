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
import { KahootChat } from "@/components/study-rooms/kahoot-chat";
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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 text-white">
      {/* State Overlays */}
      <RoomOverlays state={activeOverlay as any} />

      {/* Main Layout */}
      <div className="mx-auto flex h-screen w-full max-w-[124rem] flex-col overflow-hidden p-6 md:flex-row gap-6">
        
        {/* Left Side: Stats & Participants */}
        <aside className="hidden w-80 flex-col gap-6 lg:flex overflow-y-auto no-scrollbar">
            <Card className="rounded-(--radius) border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black uppercase tracking-tight text-white">{room.title}</h2>
                            <Badge variant="outline" className="rounded-(--radius) px-2 py-0 border-indigo-400 text-indigo-300 font-mono">{room.roomCode}</Badge>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="rounded-(--radius) hover:bg-white/10 text-indigo-300">
                                    <Settings className="size-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-(--radius) border-white/10 bg-indigo-950 text-white backdrop-blur-3xl sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Room Intelligence</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <p className="text-xs font-black uppercase text-indigo-300">Invite Friends</p>
                                        <div className="flex gap-2">
                                            <Input placeholder="Username..." className="rounded-(--radius) border-white/20 bg-white/5" />
                                            <Button variant="outline" className="rounded-(--radius)">Invite</Button>
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
                            <span className="text-xs font-black uppercase text-indigo-400">Activity Level</span>
                            <span className="text-sm font-bold text-white">{participants.length} Active</span>
                        </div>
                        <div className="flex -space-x-2">
                            {participants.slice(0, 5).map((p, i) => (
                                <img key={i} src={buildAvatarUri(p.displayName, p.avatarConfig)} className="size-8 rounded-full border-2 border-indigo-900 bg-white/10" alt="" />
                            ))}
                            {participants.length > 5 && (
                                <div className="flex size-8 items-center justify-center rounded-full border-2 border-indigo-900 bg-indigo-600 text-[10px] font-black">+{(participants.length - 5)}</div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex-1 rounded-(--radius) border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
                 <div className="p-6 border-b border-white/10 flex items-center gap-2">
                    <Trophy className="size-5 text-yellow-400" />
                    <h3 className="font-black uppercase tracking-widest text-sm">Leaderboard</h3>
                 </div>
                 <ScrollArea className="flex-1">
                    <div className="divide-y divide-white/5">
                        {leaderboard.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 transition-colors hover:bg-white/5">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={cn("text-lg font-black italic", i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-indigo-400")}>#{i + 1}</span>
                                    <img src={buildAvatarUri(p.displayName, p.avatarConfig)} className="size-10 rounded-full bg-white/10 p-1" alt="" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black uppercase tracking-tight">{p.displayName}</p>
                                        <p className="text-[10px] font-bold text-indigo-400">Level {p.level || 1}</p>
                                    </div>
                                </div>
                                <Badge className="rounded-(--radius) bg-indigo-500 font-black">{p.points || 0}</Badge>
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
            <div className="flex flex-col items-center justify-center gap-8 py-10 md:py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-lg shadow-inner relative overflow-hidden group">
                <div className="absolute inset-x-0 -top-full bottom-0 bg-gradient-to-b from-indigo-500/10 to-transparent transition-transform group-hover:translate-y-full duration-1000" />
                
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
                                className="rounded-(--radius) size-14 bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_0_rgb(5,150,105)] active:translate-y-1 active:shadow-none transition-all p-0"
                                onClick={() => updateTimer.mutate({ code, action: room.timer?.isRunning ? "pause" : "start" })}
                            >
                                {room.timer?.isRunning ? <Pause className="size-8 fill-current" /> : <Play className="size-8 fill-current ml-1" />}
                            </Button>
                            <Button 
                                variant="outline" 
                                className="rounded-(--radius) size-14 border-2 border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 p-0"
                                onClick={() => updateTimer.mutate({ code, action: "reset" })}
                            >
                                <RotateCcw className="size-6" />
                            </Button>
                            <Button 
                                className="rounded-(--radius) h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-tight shadow-[0_4px_0_rgb(67,56,202)] active:translate-y-1 active:shadow-none transition-all"
                                onClick={() => updateTimer.mutate({ code, action: "tickComplete" })}
                            >
                                <CheckCircle2 className="size-5 mr-2" /> Complete Cycle
                            </Button>
                        </>
                    )}
                    {!myParticipant && (
                        <Button className="rounded-(--radius) bg-indigo-600 px-10 py-7 text-xl font-black uppercase" onClick={() => join.mutate({ code })}>Join Study Crew</Button>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-emerald-400/50 bg-emerald-400/10 text-emerald-400 px-4 py-1 font-black uppercase tracking-wider text-[10px]">
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
            <Card className="rounded-(--radius) border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl relative">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Music className="size-5 text-indigo-400" />
                        <h3 className="font-black uppercase tracking-widest text-sm">Focus Music</h3>
                    </div>
                    {isHost && (
                        <div className="flex items-center gap-2 max-w-sm">
                            <Input 
                                placeholder="YouTube URL..." 
                                className="h-8 rounded-(--radius) border-white/20 bg-white/5 text-xs" 
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                            />
                            <Button size="sm" className="h-8 rounded-(--radius) bg-indigo-600" onClick={async () => {
                                await postMedia.mutateAsync({ code, url: mediaUrl });
                                setMediaUrl("");
                            }}>Broadcast</Button>
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
                        <div className="flex items-center justify-center size-full flex-col gap-4 text-white/20">
                            <Music className="size-20" />
                            <p className="font-black uppercase tracking-widest">Awaiting host media...</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Tasks & XP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                <Card className="rounded-(--radius) border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black uppercase tracking-widest text-sm text-indigo-300">Room Tasks</h3>
                            {isHost && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="icon" variant="outline" className="rounded-(--radius) border-white/20">
                                            <Plus className="size-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-indigo-950 text-white rounded-(--radius) border-white/20">
                                        <DialogHeader>
                                            <DialogTitle>New Challenge Task</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <Input placeholder="Task description..." className="rounded-(--radius)" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                                            <Button className="w-full rounded-(--radius)" onClick={async () => {
                                                await createTask.mutateAsync({ code, title: taskTitle, points: 25 });
                                                setTaskTitle("");
                                            }}>Create Global Task</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        <ScrollArea className="h-48">
                            <div className="space-y-3">
                                {room.tasks?.length ? room.tasks.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-(--radius) bg-white/5 border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold">{t.title}</p>
                                            <p className="text-[10px] font-bold uppercase text-indigo-400">Award: {t.points} XP</p>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="rounded-(--radius) bg-emerald-500 hover:bg-emerald-600 shadow-[0_2px_0_rgb(5,150,105)]"
                                            onClick={() => completeTask.mutate({ code, taskId: t.id })}
                                        >
                                            Complete
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center h-32 text-white/20 italic text-sm">No active tasks.</div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </Card>

                <Card className="rounded-(--radius) border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 flex flex-col items-center justify-center text-center gap-4">
                    <div className="size-20 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-xl border-b-4 border-indigo-700">
                        <Trophy className="size-10 text-white" />
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-tight text-white text-lg">Your Session Record</h4>
                        <p className="text-xs font-bold text-indigo-300">Current Rank: #{(leaderboard.findIndex(p => p.displayName === (user?.name || guestName)) + 1) || "N/A"}</p>
                    </div>
                    <div className="w-full flex justify-between items-center bg-white/5 p-4 rounded-(--radius)">
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-indigo-400">Personal Score</p>
                            <p className="text-2xl font-black">{leaderboard.find(p => p.displayName === (user?.name || guestName))?.points || 0} XP</p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="rounded-(--radius) border-indigo-400/50 text-indigo-300">Avatar Builder</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl rounded-(--radius) border-white/10 bg-indigo-950 text-white shadow-2xl backdrop-blur-3xl overflow-hidden p-0">
                                <div className="p-6 border-b border-white/10">
                                    <h2 className="text-2xl font-black uppercase text-indigo-400">Design Your Soul</h2>
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
        <KahootChat 
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
                className="size-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl border-4 border-indigo-900 group"
                onClick={() => setIsChatOpen(true)}
            >
                <div className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black">{messages.length}</div>
                <MessageSquare className="size-6 transition-transform group-hover:scale-110" />
            </Button>
            <Button 
                size="icon" 
                className="size-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl border-4 border-emerald-900 group"
                onClick={async () => {
                    const guestId = user ? undefined : ensureGuestId();
                    await toggleGameReady.mutateAsync({ code, ready: !isReady, guestId });
                    setIsReady(prev => !prev);
                }}
            >
                {isReady ? <Check className="size-6" /> : <Play className="size-6 transition-transform group-hover:scale-110 ml-0.5" />}
            </Button>
        </div>
      </div>
    </main>
  );
}
