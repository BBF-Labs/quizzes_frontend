"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { StudyRoom } from "@/hooks/study-rooms/use-study-rooms";

export interface StudyRoomCardProps {
  room: StudyRoom;
}

const EMOJI_MAP = ["🌙", "🌅", "📝", "📊", "⚖️", "⚡", "📚", "🧠"];
const EMOJI_BG_MAP = [
  "bg-blue-50 text-blue-700",
  "bg-emerald-50 text-emerald-700",
  "bg-rose-50 text-rose-700",
  "bg-cyan-50 text-cyan-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
];

const AVATAR_EMOJIS = ["🦊", "🐼", "🦉", "🐯", "🐧", "🐨", "🐸"];
const AVATAR_BGS = ["bg-blue-200", "bg-violet-200", "bg-orange-200", "bg-emerald-200", "bg-rose-200", "bg-lime-200", "bg-cyan-200"];

function getHashIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

export function StudyRoomCard({ room }: StudyRoomCardProps) {
  const emojiIndex = getHashIndex(room.roomCode || room._id, EMOJI_MAP.length);
  const bgIndex = getHashIndex(room.roomCode || room._id, EMOJI_BG_MAP.length);
  const emoji = EMOJI_MAP[emojiIndex];
  const bgClass = EMOJI_BG_MAP[bgIndex];

  const participantCount = room.participants?.length ?? 0;
  const isLive = room.timer?.isRunning || room.status === "active";
  const timerLabel = room.timer?.durationSeconds
    ? `POMODORO ${Math.round(room.timer.durationSeconds / 60)}M`
    : "SILENT FOCUS";

  return (
    <article className="room-row grid items-center gap-4 py-4 sm:grid-cols-[1fr_auto] border-b border-slate-100 last:border-0">
      <div className="flex min-w-0 gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg ${bgClass}`}>
          {emoji}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-extrabold text-slate-950 truncate">
              {room.title}
            </h2>
            {isLive ? (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-extrabold text-red-600">
                ● LIVE
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold text-amber-700">
                STARTS SOON
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {timerLabel}
            </span>
            {room.isLocked && <Lock className="h-3 w-3 text-slate-400" />}
          </div>

          <p className="mt-1 truncate text-xs text-slate-500">
            {room.topic || `Course: ${room.roomCode} · ${room.visibility === "open" ? "Public" : "Private"}`}
          </p>

          <div className="mt-2 flex items-center gap-3">
            {/* Avatar Stack */}
            <div className="flex -space-x-2">
              {(room.participants && room.participants.length > 0
                ? room.participants.slice(0, 3)
                : [1, 2, 3]
              ).map((p, idx) => {
                const aEmoji = AVATAR_EMOJIS[(idx + bgIndex) % AVATAR_EMOJIS.length];
                const aBg = AVATAR_BGS[(idx + bgIndex) % AVATAR_BGS.length];
                return (
                  <span
                    key={idx}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] ${aBg}`}
                  >
                    {typeof p === "object" ? p.displayName[0]?.toUpperCase() || aEmoji : aEmoji}
                  </span>
                );
              })}
              {participantCount > 3 && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-600">
                  +{participantCount - 3}
                </span>
              )}
            </div>

            <span className="text-[11px] font-semibold text-slate-400">
              {participantCount > 0 ? `${participantCount} studying` : "Open seat"} · {room.timer?.durationSeconds ? `${Math.round(room.timer.durationSeconds / 60)}m duration` : "Ongoing"}
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/study-rooms/${room.roomCode}`}
        className={`rounded-xl px-4 py-2.5 text-center text-xs font-extrabold transition ${
          isLive
            ? "bg-[#0C60FC] text-white hover:bg-blue-700"
            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {isLive ? "Enter room" : "Reserve seat"}
      </Link>
    </article>
  );
}
