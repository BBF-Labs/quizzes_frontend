"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { LandingHeader, LandingFooter, MobileNav } from "@/components/landing";
import { StudyRoomCard } from "@/components/study-rooms/study-room-card";
import { CreateRoomDialog } from "@/components/study-rooms/create-room-dialog";
import { useStudyRooms, type StudyRoom } from "@/hooks/study-rooms/use-study-rooms";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

const FALLBACK_STUDY_ROOMS: StudyRoom[] = [
  {
    _id: "room-1",
    roomCode: "ALGO-205",
    hostId: "user-1",
    title: "Late Night Algorithms",
    topic: "DCIT 205 · Goal: finish Dynamic Programming",
    visibility: "open",
    status: "active",
    isLocked: false,
    maxParticipants: 25,
    participants: [
      { displayName: "Alex", role: "host", points: 120 },
      { displayName: "Kwame", role: "member", points: 90 },
      { displayName: "Ama", role: "member", points: 60 },
      { displayName: "Kofi", role: "member", points: 40 },
    ],
    timer: {
      isRunning: true,
      durationSeconds: 3000,
      remainingSeconds: 1500,
      cycle: 2,
    },
  },
  {
    _id: "room-2",
    roomCode: "ANAT-6AM",
    hostId: "user-2",
    title: "6AM Anatomy Grind",
    topic: "MBChB · Mics off, timers on, flashcards open",
    visibility: "open",
    status: "active",
    isLocked: false,
    maxParticipants: 30,
    participants: [
      { displayName: "Sarah", role: "host", points: 210 },
      { displayName: "John", role: "member", points: 180 },
    ],
    timer: {
      isRunning: true,
      durationSeconds: 1500,
      remainingSeconds: 800,
      cycle: 1,
    },
  },
  {
    _id: "room-3",
    roomCode: "DCIT-207",
    hostId: "user-3",
    title: "DCIT 207 Mock Exam Hall",
    topic: "Operating Systems · Shared countdown, review after",
    visibility: "open",
    status: "active",
    isLocked: true,
    maxParticipants: 50,
    participants: [
      { displayName: "Emmanuel", role: "host", points: 300 },
      { displayName: "Jessica", role: "member", points: 250 },
      { displayName: "David", role: "member", points: 190 },
    ],
    timer: {
      isRunning: true,
      durationSeconds: 3600,
      remainingSeconds: 2100,
      cycle: 3,
    },
  },
  {
    _id: "room-4",
    roomCode: "MATH-223",
    hostId: "user-4",
    title: "Statistics Problem Sets",
    topic: "MATH 223 · Work tutorials, then compare answers",
    visibility: "open",
    status: "active",
    isLocked: false,
    maxParticipants: 20,
    participants: [
      { displayName: "Michael", role: "host", points: 95 },
    ],
    timer: {
      isRunning: false,
      durationSeconds: 1500,
      remainingSeconds: 1500,
      cycle: 1,
    },
  },
  {
    _id: "room-5",
    roomCode: "LAW-101",
    hostId: "user-5",
    title: "Con Law Case Review",
    topic: "Law · Talk through landmark cases out loud",
    visibility: "open",
    status: "active",
    isLocked: false,
    maxParticipants: 25,
    participants: [
      { displayName: "Grace", role: "host", points: 140 },
      { displayName: "Daniel", role: "member", points: 110 },
    ],
    timer: {
      isRunning: false,
      durationSeconds: 3000,
      remainingSeconds: 1800,
      cycle: 2,
    },
  },
];

function StudyRoomsContent() {
  const { data: apiRooms = [], isLoading } = useStudyRooms();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("active");

  const roomsList = useMemo(() => {
    return apiRooms.length > 0 ? apiRooms : FALLBACK_STUDY_ROOMS;
  }, [apiRooms]);

  const filteredRooms = useMemo(() => {
    return roomsList.filter((r) => {
      let matchesFilter = true;
      if (activeFilter === "silent") {
        matchesFilter = (r.topic || "").toLowerCase().includes("silent") || (r.topic || "").toLowerCase().includes("mics off");
      } else if (activeFilter === "pomodoro") {
        matchesFilter = !!r.timer?.isRunning || (r.topic || "").toLowerCase().includes("pomodoro");
      } else if (activeFilter === "exam") {
        matchesFilter = (r.title || "").toLowerCase().includes("exam") || (r.topic || "").toLowerCase().includes("exam");
      } else if (activeFilter === "night") {
        matchesFilter = (r.title || "").toLowerCase().includes("night") || (r.topic || "").toLowerCase().includes("night");
      } else if (activeFilter === "mine") {
        matchesFilter = (r.topic || "").toLowerCase().includes("dcit") || (r.title || "").toLowerCase().includes("dcit");
      }

      return matchesFilter;
    });
  }, [roomsList, activeFilter]);

  const totalParticipants = useMemo(() => {
    const sum = roomsList.reduce((acc, r) => acc + (r.participants?.length || 0), 0);
    return sum > 0 ? sum : 318;
  }, [roomsList]);

  return (
    <div className="overflow-x-hidden bg-[#F7F9FC] text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white min-h-screen">
      <LandingHeader />

      <main className="relative">
        {/* Hero Section */}
        <section className="soft-grid relative overflow-hidden px-5 pb-12 pt-32 lg:pb-16 lg:pt-40">
          <div className="pointer-events-none absolute -left-20 top-24 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="hand text-base font-semibold text-[#0C60FC]">
                  Public library / Study rooms
                </p>
                <h1 className="display mt-2 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Live study <br />
                  <span className="hand text-[#0C60FC]">sprints.</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                  Global study protocol. Join an active room, set a pomodoro timer, and grind with students worldwide.
                </p>
              </div>

              {/* Action + Stats Header Right */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="min-w-[120px] rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-center shadow-sm backdrop-blur-sm">
                  <b className="display text-3xl font-extrabold text-slate-950 block leading-none">
                    {roomsList.length > 0 ? roomsList.length : 42}
                  </b>
                  <span className="mt-2 block text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
                    ROOMS LIVE
                  </span>
                </div>

                <div className="min-w-[130px] rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-center shadow-sm backdrop-blur-sm">
                  <b className="display text-3xl font-extrabold text-slate-950 block leading-none">
                    {totalParticipants}
                  </b>
                  <span className="mt-2 block text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
                    STUDYING NOW
                  </span>
                </div>

                {user ? (
                  <CreateRoomDialog>
                    <button className="squishy rounded-2xl bg-[#0C60FC] px-6 py-4 text-xs font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700">
                      + Start room
                    </button>
                  </CreateRoomDialog>
                ) : (
                  <Link
                    href="/login"
                    className="squishy rounded-2xl bg-slate-950 px-6 py-4 text-xs font-extrabold text-white shadow-lg transition hover:bg-[#0C60FC]"
                  >
                    Log in to create →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content Body */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-7xl space-y-4">
            {/* Resume Banner */}
            <div className="panel flex flex-wrap items-center gap-4 p-4 sm:p-5 rounded-[24px] border border-slate-200 bg-white shadow-sm">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg text-white">
                ◍
              </span>
              <div className="min-w-[180px] flex-1">
                <p className="hand text-xl leading-none text-[#0C60FC]">
                  you left a session running…
                </p>
                <p className="mt-1 text-sm font-bold text-slate-950">
                  Late Night Algorithms · 8 people inside
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-xl bg-[#F7F9FC] px-3 py-2 font-mono text-sm font-bold sm:block">
                  24:59
                </span>
                <Link
                  href="/study-rooms/ALGO-205"
                  className="rounded-xl bg-[#0C60FC] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-blue-700"
                >
                  Rejoin →
                </Link>
              </div>
            </div>

            {/* Stat Strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="panel p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xl font-extrabold text-slate-950">{roomsList.length > 0 ? roomsList.length : 42}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rooms live
                </p>
              </div>
              <div className="panel p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xl font-extrabold text-slate-950">{totalParticipants}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Studying now
                </p>
              </div>
              <div className="panel p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xl font-extrabold text-slate-950">3</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Your rooms
                </p>
              </div>
              <div className="panel p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xl font-extrabold text-slate-950">6h 40m</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Focus this week
                </p>
              </div>
            </div>

            {/* Filters + List Container */}
            <div className="panel p-4 sm:p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <h2 className="display text-lg font-bold text-slate-950">Rooms</h2>
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-extrabold text-red-600">
                    ● {roomsList.length} live
                  </span>
                  <span className="hand hidden text-xl text-[#0C60FC] sm:inline">
                    pick your vibe ↘
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <span>Sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold outline-none cursor-pointer"
                  >
                    <option value="active">Most active</option>
                    <option value="mine">My courses first</option>
                    <option value="soon">Starting soon</option>
                    <option value="small">Smallest rooms</option>
                  </select>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All rooms" },
                  { id: "mine", label: "My courses" },
                  { id: "silent", label: "Silent" },
                  { id: "pomodoro", label: "Pomodoro" },
                  { id: "exam", label: "Exam prep" },
                  { id: "night", label: "Late night" },
                ].map((cat) => {
                  const isActive = activeFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveFilter(cat.id)}
                      className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                        isActive
                          ? "bg-[#0A0D14] text-white shadow-sm"
                          : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 ring-1 ring-slate-200/60"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Room List Rows */}
              <div className="mt-5 divide-y divide-slate-100">
                {isLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#0C60FC]" />
                    <p className="mt-2 text-xs font-bold text-slate-400">Loading active study rooms…</p>
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <p className="py-8 text-center text-xs font-semibold text-slate-400">
                    No rooms match that filter yet — try another, or start your own.
                  </p>
                ) : (
                  filteredRooms.map((room) => (
                    <StudyRoomCard key={room._id} room={room} />
                  ))
                )}
              </div>
            </div>

            {/* Bottom Utility Row */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Suggested for you */}
              <div className="panel p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm lg:col-span-2">
                <h2 className="text-sm font-extrabold text-slate-950">
                  Suggested for you{" "}
                  <span className="hand ml-1 text-lg text-[#0C60FC]">picked for tonight</span>
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Based on your courses, weak topics and when you usually study.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#F7F9FC] p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                      🧠
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-950">Big-O Bootcamp</p>
                      <p className="text-[11px] font-medium text-slate-500">Matches your weak topic</p>
                    </div>
                    <Link href="/study-rooms/ALGO-205" className="ml-auto text-[11px] font-extrabold text-[#0C60FC] hover:underline">
                      Join
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-[#F7F9FC] p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                      👋
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-950">DCIT 201 Crew</p>
                      <p className="text-[11px] font-medium text-slate-500">3 course mates inside</p>
                    </div>
                    <Link href="/study-rooms/DCIT-201" className="ml-auto text-[11px] font-extrabold text-[#0C60FC] hover:underline">
                      Join
                    </Link>
                  </div>
                </div>
              </div>

              {/* Start a room */}
              <div className="panel p-5 rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <h2 className="text-sm font-extrabold text-slate-950">Start a room</h2>
                <p className="mt-1 text-xs text-slate-500">Pick a course, timer style and who can join.</p>
                <div className="mt-4 space-y-2 text-[11px] font-bold text-slate-500">
                  <div className="rounded-xl bg-[#F7F9FC] px-3 py-2.5">Course · DCIT 205 Algorithms</div>
                  <div className="rounded-xl bg-[#F7F9FC] px-3 py-2.5">Timer · Pomodoro 50/10</div>
                  <div className="rounded-xl bg-[#F7F9FC] px-3 py-2.5">Access · Anyone on my course</div>
                </div>
                {user ? (
                  <CreateRoomDialog>
                    <button className="mt-4 w-full rounded-xl bg-slate-950 py-3 text-center text-xs font-extrabold text-white transition hover:bg-[#0C60FC]">
                      Create room
                    </button>
                  </CreateRoomDialog>
                ) : (
                  <Link href="/login" className="mt-4 block w-full rounded-xl bg-slate-950 py-3 text-center text-xs font-extrabold text-white transition hover:bg-[#0C60FC]">
                    Log in to create
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <MobileNav />
    </div>
  );
}

export default function StudyRoomsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0C60FC]" />
        </div>
      }
    >
      <StudyRoomsContent />
    </Suspense>
  );
}
