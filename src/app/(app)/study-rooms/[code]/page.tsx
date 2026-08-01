"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  useOpenGameReadyCheck,
  useSendStudyRoomMessage,
  useStudyRoom,
  useToggleGameReady,
  useUpdateStudyRoomAvatar,
  useUpdateStudyRoomTimer,
} from "@/hooks/study-rooms/use-study-rooms";
import { useStudyRoomSocket } from "@/hooks/study-rooms/use-study-room-socket";
import { getSessionUser } from "@/lib/session";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomOverlays } from "@/components/study-rooms/room-overlays";
import { useStudyRoomLayout } from "@/app/(app)/study-rooms/study-room-layout-provider";

const ensureGuestId = (): string => {
  const key = "study_room_guest_id";
  const existing =
    typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (existing) return existing;
  const next = `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (typeof window !== "undefined") localStorage.setItem(key, next);
  return next;
};

export default function StudyRoomDetailPage() {
  const params = useParams<{ code: string }>();
  const code = String(params?.code || "").toUpperCase();
  const user = getSessionUser();

  const { data, refetch, isLoading } = useStudyRoom(code);
  const room = data?.room;
  const messages = data?.messages || [];
  const participants = room?.participants?.filter((p) => !p.leftAt) || [];

  // mutations
  const sendMessage = useSendStudyRoomMessage();
  const updateTimer = useUpdateStudyRoomTimer();
  const updateAvatar = useUpdateStudyRoomAvatar();
  const openReadyCheck = useOpenGameReadyCheck();

  // local ui state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [guestName] = useState("");
  const [xpFx, setXpFx] = useState<{ delta: number } | null>(null);
  const [isOverlayDismissed, setIsOverlayDismissed] = useState(false);
  const [localRemaining, setLocalRemaining] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"games" | "board" | "avatar">("games");
  const [chatText, setChatText] = useState("");
  const [avatarFace, setAvatarFace] = useState("🦊");
  const [avatarBg, setAvatarBg] = useState("bg-blue-200");
  const [avatarBadge, setAvatarBadge] = useState("🎧");
  const [localTasks, setLocalTasks] = useState([
    { id: "t1", title: "Re-read L03 notes", done: true },
    { id: "t2", title: "10 Big-O practice questions", done: true },
    { id: "t3", title: "Memoization vs tabulation", done: false },
    { id: "t4", title: "Knapsack problem walkthrough", done: false },
    { id: "t5", title: "Quiz: 15 questions", done: false },
  ]);
  const [showAllTasks, setShowAllTasks] = useState(false);

  // ── derived state ──────────────────────────────────────────────────────────

  const myDisplayName =
    user?.name ??
    (typeof window !== "undefined"
      ? localStorage.getItem("study_room_guest_name") || guestName
      : guestName);

  const myGuestId =
    typeof window !== "undefined"
      ? localStorage.getItem("study_room_guest_id")
      : null;

  const remainingFormatted = useMemo(() => {
    const s = localRemaining ?? 1499;
    return `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  }, [localRemaining]);

  const activeOverlay = useMemo(() => {
    if (isOverlayDismissed) return null;
    if (room?.readyState?.isOpen) return "ready_check";
    return null;
  }, [room?.readyState?.isOpen, isOverlayDismissed]);

  // ── timer ticker ───────────────────────────────────────────────────────────

  const hasAutoTickedRef = useRef(false);
  useEffect(() => {
    if (!room?.timer) return;
    hasAutoTickedRef.current = false;

    const tick = () => {
      const base = room.timer?.remainingSeconds ?? 1500;
      const startedAt = room.timer?.startedAt
        ? new Date(room.timer.startedAt).getTime()
        : null;
      const running = room.timer?.isRunning;

      if (!running || !startedAt) {
        setLocalRemaining(base);
        return;
      }

      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, base - elapsed);
      setLocalRemaining(remaining);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [
    room?.timer?.isRunning,
    room?.timer?.startedAt,
    room?.timer?.remainingSeconds,
  ]);

  // ── socket ─────────────────────────────────────────────────────────────────

  useStudyRoomSocket(code, {
    onPresence: () => refetch(),
    onMessage: () => refetch(),
    onTimer: () => refetch(),
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
  });

  if (isLoading || !room)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F7F9FC]">
        <Skeleton className="h-20 w-80 rounded-2xl" />
      </div>
    );

  return (
    <div className="overflow-x-hidden bg-[#F7F9FC] text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white min-h-screen">
      {/* State Overlays */}
      <RoomOverlays
        state={activeOverlay as any}
        onDismiss={() => setIsOverlayDismissed(true)}
      />

      {/* Full-width App Bar Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/study-rooms"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:bg-slate-50 transition"
            aria-label="Back to study rooms"
          >
            ←
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="display truncate text-sm font-bold sm:text-base text-slate-950">
                {room?.title || "Late Night Algorithms"}
              </h1>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-extrabold text-red-600">
                ● {participants.length || 8}
              </span>
            </div>
            <p className="truncate text-[11px] font-semibold text-slate-500">
              {room?.topic || `Code: ${code}`} · Pomodoro 50/10
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="relative rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              💬 Chat{" "}
              {messages.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {messages.length}
                </span>
              )}
            </button>
            <Link
              href="/study-rooms"
              className="rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#0C60FC]"
            >
              Leave
            </Link>
          </div>
        </div>
      </header>

      {/* Main Full-Width Desktop Layout */}
      <main className="mx-auto max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8 pb-24 lg:pb-12">
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          {/* LEFT COLUMN: Focus Card + Breather Tabs */}
          <div className="space-y-4">
            {/* Primary Focus Card */}
            <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white sm:p-8 shadow-xl">
              <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#0C60FC]/40 blur-3xl" />
              <div className="relative text-center">
                <p className="hand text-2xl text-[#DFFF61]">
                  everyone’s heads down right now
                </p>
                <p className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Session {room?.timer?.cycle ?? 3} of 4 · deep focus
                </p>
                <p className="mt-3 font-mono text-6xl font-bold tracking-tight sm:text-7xl">
                  {remainingFormatted}
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  Room goal · {room?.topic || "finish Dynamic Programming"}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => {
                      updateTimer.mutate({
                        code,
                        action: "start",
                        durationSeconds: localRemaining ?? 1500,
                      });
                    }}
                    className="rounded-xl bg-[#DFFF61] px-5 py-3 text-xs font-extrabold text-slate-950 hover:opacity-90 transition"
                  >
                    ▶ Focus
                  </button>
                  <button
                    onClick={() => {
                      updateTimer.mutate({
                        code,
                        action: "pause",
                        durationSeconds: localRemaining ?? 1500,
                      });
                    }}
                    className="rounded-xl bg-white/10 px-5 py-3 text-xs font-extrabold text-white hover:bg-white/20 transition"
                  >
                    ⏸ Pause
                  </button>
                  <button
                    onClick={() => {
                      updateTimer.mutate({
                        code,
                        action: "pause",
                        durationSeconds: 300,
                      });
                    }}
                    className="rounded-xl bg-white/10 px-5 py-3 text-xs font-extrabold text-white hover:bg-white/20 transition"
                  >
                    ☕ Break
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-400">
                  <span className="flex -space-x-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-950 bg-blue-200 text-[10px]">
                      🦊
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-950 bg-violet-200 text-[10px]">
                      🐼
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-950 bg-orange-200 text-[10px]">
                      🦉
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-950 bg-white/20 text-[9px] font-bold">
                      +{Math.max(0, (participants.length || 8) - 3)}
                    </span>
                  </span>
                  <span>{participants.length || 8} studying</span>
                  <span>3h 12m together</span>
                  <span>🔥 8 day room streak</span>
                </div>
              </div>
            </section>

            {/* Tabbed Section: "when you need a breather ✦" */}
            <section className="panel p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="hand text-xl text-[#0C60FC]">when you need a breather ✦</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab("games")}
                    className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                      activeTab === "games"
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    🎮 Play
                  </button>
                  <button
                    onClick={() => setActiveTab("board")}
                    className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                      activeTab === "board"
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    🏆 Standings
                  </button>
                  <button
                    onClick={() => setActiveTab("avatar")}
                    className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                      activeTab === "avatar"
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    🧑‍🎨 My avatar
                  </button>
                </div>
              </div>

              {/* PLAY TAB */}
              {activeTab === "games" && (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <article className="rounded-[20px] border border-slate-200 bg-[#F1F6FF] p-5">
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">⚡</span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-extrabold text-blue-700">
                          LIVE · 5 PLAYING
                        </span>
                      </div>
                      <h3 className="mt-4 text-base font-bold text-slate-950">Quiz Race</h3>
                      <p className="mt-1 text-[11px] leading-5 text-slate-600">
                        20 questions on Dynamic Programming. Fastest correct answer takes the round.
                      </p>
                      <button
                        onClick={async () => {
                          await openReadyCheck.mutateAsync({ code });
                          toast.success("Quiz race opened!");
                        }}
                        className="mt-4 w-full rounded-xl bg-[#0C60FC] py-2.5 text-[11px] font-extrabold text-white hover:bg-blue-700 transition"
                      >
                        Join race →
                      </button>
                    </article>

                    <article className="rounded-[20px] border border-slate-200 bg-[#E9FFD3] p-5">
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">🐉</span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-extrabold text-lime-800">
                          CO-OP
                        </span>
                      </div>
                      <h3 className="mt-4 text-base font-bold text-slate-950">Topic Boss Battle</h3>
                      <p className="mt-1 text-[11px] leading-5 text-slate-600">
                        The room fights Greedy Algorithms together. Every correct answer chips its HP.
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-bold text-slate-700">
                          <span>Boss HP</span>
                          <span>38%</span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-white">
                          <div className="h-full w-[38%] rounded-full bg-rose-500" />
                        </div>
                      </div>
                      <button
                        onClick={() => toast.info("Boss battle initiated!")}
                        className="mt-3 w-full rounded-xl bg-slate-950 py-2.5 text-[11px] font-extrabold text-white hover:bg-[#0C60FC] transition"
                      >
                        Join the fight →
                      </button>
                    </article>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
                    <span className="hand text-lg text-[#0C60FC]">also here:</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">🃏 Flashcard Sprint</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">🎯 Challenge a roommate</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 opacity-60">🌙 Midnight quest · locked</span>
                  </div>
                </div>
              )}

              {/* STANDINGS TAB */}
              {activeTab === "board" && (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="hand text-xl text-[#0C60FC]">you’re leading tonight 🎉</p>
                    <div className="flex gap-2 text-[10px] font-bold text-slate-500">
                      <span className="rounded-full bg-slate-950 text-white px-3 py-1">Today</span>
                      <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1">Week</span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F9FC] text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3 hidden sm:table-cell">Focus</th>
                          <th className="px-4 py-3">Accuracy</th>
                          <th className="px-4 py-3 text-right">XP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        <tr className="bg-blue-50/60">
                          <td className="px-4 py-3 font-extrabold">1</td>
                          <td className="px-4 py-3">🦊 Ama <span className="text-slate-400">(you)</span></td>
                          <td className="px-4 py-3 hidden sm:table-cell">45 min</td>
                          <td className="px-4 py-3">88%</td>
                          <td className="px-4 py-3 text-right font-extrabold text-[#0C60FC]">465</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-extrabold">2</td>
                          <td className="px-4 py-3">🐼 Kwame</td>
                          <td className="px-4 py-3 hidden sm:table-cell">42 min</td>
                          <td className="px-4 py-3">84%</td>
                          <td className="px-4 py-3 text-right font-extrabold text-slate-900">410</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-extrabold">3</td>
                          <td className="px-4 py-3">🦉 Esi</td>
                          <td className="px-4 py-3 hidden sm:table-cell">31 min</td>
                          <td className="px-4 py-3">91%</td>
                          <td className="px-4 py-3 text-right font-extrabold text-slate-900">388</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-extrabold">4</td>
                          <td className="px-4 py-3">🐧 Yaw</td>
                          <td className="px-4 py-3 hidden sm:table-cell">28 min</td>
                          <td className="px-4 py-3">76%</td>
                          <td className="px-4 py-3 text-right font-extrabold text-slate-900">302</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#F7F9FC] p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                      ⏳
                    </span>
                    <div className="min-w-[160px] flex-1">
                      <p className="text-[11px] font-extrabold text-slate-950">Room quest · 5 focus hours together</p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-200">
                        <div className="h-full w-[64%] rounded-full bg-[#0C60FC]" />
                      </div>
                    </div>
                    <span className="rounded-full bg-[#DFFF61] px-3 py-1.5 text-[10px] font-extrabold text-slate-950">
                      +150 XP
                    </span>
                  </div>
                </div>
              )}

              {/* AVATAR TAB */}
              {activeTab === "avatar" && (
                <div className="mt-5 space-y-6 sm:grid sm:grid-cols-[200px_1fr] sm:gap-6 sm:space-y-0">
                  <div className="rounded-[20px] bg-[#F7F9FC] p-5 text-center">
                    <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-5xl ring-4 ring-[#DFFF61] ring-offset-4 ring-offset-[#F7F9FC] ${avatarBg}`}>
                      {avatarFace}
                    </div>
                    <p className="mt-3 text-xs font-extrabold text-slate-950">
                      {myDisplayName} <span className="ml-1">{avatarBadge}</span>
                    </p>
                    <p className="hand mt-1 text-lg text-[#0C60FC]">level 7 night owl</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-extrabold text-slate-900">Character</p>
                      <div className="flex flex-wrap gap-2">
                        {["🦊", "🐼", "🦉", "🐧", "🐯", "🐨"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setAvatarFace(f)}
                            className={`rounded-xl border px-3 py-2 text-lg transition ${
                              avatarFace === f
                                ? "border-[#0C60FC] bg-[#EFF5FF] text-[#0C60FC]"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-extrabold text-slate-900">Backdrop</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Blue", value: "bg-blue-200" },
                          { label: "Violet", value: "bg-violet-200" },
                          { label: "Amber", value: "bg-orange-200" },
                          { label: "Mint", value: "bg-emerald-200" },
                          { label: "Midnight", value: "bg-slate-800" },
                        ].map((b) => (
                          <button
                            key={b.value}
                            onClick={() => setAvatarBg(b.value)}
                            className={`rounded-xl border px-3 py-2 text-[11px] font-bold transition ${
                              avatarBg === b.value
                                ? "border-[#0C60FC] bg-[#EFF5FF] text-[#0C60FC]"
                                : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-extrabold text-slate-900">
                        Badge <span className="hand ml-1 text-base text-[#0C60FC]">earned at level 5</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["🎧", "🌙", "⚡", "🏆"].map((bdg) => (
                          <button
                            key={bdg}
                            onClick={() => setAvatarBadge(bdg)}
                            className={`rounded-xl border px-3 py-2 text-base transition ${
                              avatarBadge === bdg
                                ? "border-[#0C60FC] bg-[#EFF5FF] text-[#0C60FC]"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            {bdg}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={async () => {
                          await updateAvatar.mutateAsync({
                            code,
                            avatarConfig: { face: avatarFace, bg: avatarBg, badge: avatarBadge },
                          });
                          toast.success("Avatar updated!");
                        }}
                        className="rounded-xl bg-[#0C60FC] px-5 py-3 text-[11px] font-extrabold text-white hover:bg-blue-700 transition"
                      >
                        Save avatar
                      </button>
                      <button
                        onClick={() => {
                          const faces = ["🦊", "🐼", "🦉", "🐧", "🐯", "🐨"];
                          const bgs = ["bg-blue-200", "bg-violet-200", "bg-orange-200", "bg-emerald-200", "bg-slate-800"];
                          setAvatarFace(faces[Math.floor(Math.random() * faces.length)]);
                          setAvatarBg(bgs[Math.floor(Math.random() * bgs.length)]);
                        }}
                        className="rounded-xl border border-slate-200 px-5 py-3 text-[11px] font-extrabold text-slate-600 hover:bg-slate-50 transition"
                      >
                        Randomise 🎲
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: What's Next + My Tasks */}
          <div className="space-y-4">
            {/* What you're doing next */}
            <div className="panel p-5 rounded-[24px] border border-slate-200 bg-white shadow-sm">
              <p className="hand text-xl text-[#0C60FC]">what you’re doing next ↓</p>
              <div className="mt-3 flex items-start gap-3 rounded-2xl bg-[#F1F6FF] p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
                  🧠
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-950">
                    {localTasks.find((t) => !t.done)?.title || "Memoization vs tabulation"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    From your task list · about 12 minutes
                  </p>
                </div>
                <button
                  onClick={() => {
                    const next = localTasks.find((t) => !t.done);
                    if (next) {
                      setLocalTasks((prev) =>
                        prev.map((t) => (t.id === next.id ? { ...t, done: true } : t))
                      );
                      toast.success("Task completed!");
                    }
                  }}
                  className="rounded-xl bg-[#0C60FC] px-4 py-2.5 text-[11px] font-extrabold text-white hover:bg-blue-700 transition"
                >
                  Start
                </button>
              </div>
              <p className="mt-4 text-[11px] font-semibold text-slate-400">
                Qz picks one thing at a time so the room stays quiet in your head too.
              </p>
            </div>

            {/* My Tasks */}
            <div className="panel p-5 rounded-[24px] border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-950">My tasks</h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {localTasks.filter((t) => t.done).length} / {localTasks.length} DONE
                </span>
              </div>

              <ul className="mt-3 space-y-2">
                {(showAllTasks ? localTasks : localTasks.slice(0, 3)).map((t) => (
                  <li key={t.id}>
                    <label
                      className={`task flex cursor-pointer items-start gap-2.5 rounded-xl p-3 transition ${
                        t.done ? "bg-[#F7F9FC] text-slate-400 line-through" : "bg-[#F7F9FC] text-slate-900"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => {
                          setLocalTasks((prev) =>
                            prev.map((item) =>
                              item.id === t.id ? { ...item, done: !item.done } : item
                            )
                          );
                        }}
                        className="mt-0.5 h-4 w-4 rounded accent-[#0C60FC]"
                      />
                      <span className="text-[11px] font-bold leading-5">{t.title}</span>
                    </label>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowAllTasks(!showAllTasks)}
                className="mt-3 w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition"
              >
                {showAllTasks ? "Show fewer" : `Show ${Math.max(0, localTasks.length - 3)} more`}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* CHAT DRAWER */}
      {isChatOpen && (
        <>
          <div
            onClick={() => setIsChatOpen(false)}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
          <aside className="fixed inset-y-0 right-0 z-55 flex w-full max-w-[360px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-extrabold text-slate-950">Room chat</h2>
                <p className="hand text-base leading-none text-[#0C60FC]">say hi, it helps</p>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Today
              </p>
              {messages.map((m: any, idx: number) => {
                const isMe = m.displayName === myDisplayName || m.senderId === user?.id;
                return isMe ? (
                  <div key={m.id || idx} className="flex justify-end">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400">You</p>
                      <div className="mt-1 rounded-2xl rounded-tr-sm bg-[#0C60FC] px-3.5 py-2.5 text-left text-[11px] leading-5 text-white">
                        {m.message}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={m.id || idx} className="flex gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-200 text-xs">
                      🐼
                    </span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400">{m.displayName || "Participant"}</p>
                      <div className="mt-1 rounded-2xl rounded-tl-sm bg-[#F7F9FC] px-3.5 py-2.5 text-[11px] leading-5 text-slate-900">
                        {m.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatText.trim()) return;
                sendMessage.mutate({ code, content: chatText.trim() });
                setChatText("");
              }}
              className="border-t border-slate-100 p-3"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-[#F7F9FC] px-3 py-2">
                <input
                  type="text"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Message the room…"
                  className="min-w-0 flex-1 bg-transparent py-2 text-[11px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-3 py-2 text-[11px] font-extrabold text-white hover:bg-[#0C60FC] transition"
                >
                  Send
                </button>
              </div>
            </form>
          </aside>
        </>
      )}
    </div>
  );
}
