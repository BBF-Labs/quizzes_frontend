"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Users, Clock, Globe, Loader2 } from "lucide-react";
import { useCreateStudyRoom } from "@/hooks/study-rooms/use-study-rooms";

const TIMER_PRESETS = [15, 25, 45, 60];
const CAPACITY_PRESETS = [10, 25, 50, 100];

export function CreateRoomDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const createRoom = useCreateStudyRoom();

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [visibility, setVisibility] = useState<"open" | "closed">("open");
  const [maxParticipants, setMaxParticipants] = useState(25);
  const [timerMinutes, setTimerMinutes] = useState(25);

  const canSubmit = useMemo(() => title.trim().length > 1, [title]);

  const onCreate = async () => {
    if (!canSubmit) return;
    try {
      const created = await createRoom.mutateAsync({
        title: title.trim(),
        topic: topic.trim() || undefined,
        visibility,
        maxParticipants,
        timerMinutes,
      });
      toast.success("Study room created!");
      setOpen(false);
      window.location.href = `/study-rooms/${created.roomCode}`;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create room");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="rounded-xl bg-[#0C60FC] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-700 transition flex items-center gap-2">
            <Plus className="h-4 w-4" /> Start a room
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-950">
            Start a room{" "}
            <span className="hand ml-1 text-xl text-[#0C60FC]">pick your vibe ↘</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Pick a course, timer style and who can join.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Room Title */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Room Title
            </label>
            <input
              type="text"
              placeholder="e.g. Late Night Algorithms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/80 bg-[#F7F9FC] px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#0C60FC]/20 transition"
            />
          </div>

          {/* Goal / Topic */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Course & Session Goal
            </label>
            <textarea
              rows={2}
              placeholder="e.g. DCIT 205 · Goal: finish Dynamic Programming"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/80 bg-[#F7F9FC] p-3 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#0C60FC]/20 transition resize-none"
            />
          </div>

          {/* Grid: Access & Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Globe className="h-3 w-3 text-slate-400" /> Access
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "open" | "closed")}
                className="w-full rounded-xl border border-slate-200/80 bg-[#F7F9FC] px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:bg-white cursor-pointer"
              >
                <option value="open">Open (Public)</option>
                <option value="closed">Closed (Private)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Users className="h-3 w-3 text-slate-400" /> Capacity
              </label>
              <select
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200/80 bg-[#F7F9FC] px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:bg-white cursor-pointer"
              >
                {CAPACITY_PRESETS.map((cap) => (
                  <option key={cap} value={cap}>
                    {cap} Seats
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timer Style Presets */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" /> Timer Sprint Length
            </label>
            <div className="flex flex-wrap gap-2">
              {TIMER_PRESETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimerMinutes(t)}
                  className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                    timerMinutes === t
                      ? "bg-[#0A0D14] text-white shadow-sm"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 ring-1 ring-slate-200/60"
                  }`}
                >
                  {t}m
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <button
            type="button"
            onClick={onCreate}
            disabled={!canSubmit || createRoom.isPending}
            className="mt-2 w-full rounded-2xl bg-slate-950 py-3.5 text-xs font-extrabold text-white hover:bg-[#0C60FC] disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2"
          >
            {createRoom.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" /> Starting room…
              </>
            ) : (
              "Create room →"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
