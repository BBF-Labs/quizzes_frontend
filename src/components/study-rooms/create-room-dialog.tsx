"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Users, Clock, Lock, Globe } from "lucide-react";
import { useCreateStudyRoom } from "@/hooks/study-rooms/use-study-rooms";
import { cn } from "@/lib/utils";

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
          <Button className="rounded-(--radius) gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
            <Plus className="size-4" /> Create Room
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-(--radius) sm:max-w-[500px] border-none shadow-2xl bg-gradient-to-br from-background to-muted/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-indigo-600">Start a Study Sprint</DialogTitle>
          <DialogDescription>
            Set up your room, invite your friends, and track your progress together.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Room Name</Label>
            <Input
              id="title"
              placeholder="e.g. Physics Final Review 🚀"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-(--radius) border-2 focus-visible:ring-indigo-500 text-lg py-6"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="topic" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Session Goal</Label>
            <Textarea
              id="topic"
              placeholder="What are you studying today? (Optional)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-(--radius) border-2 resize-none min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                <Globe className="size-3" /> Visibility
              </Label>
              <Select value={visibility} onValueChange={(v: "open" | "closed") => setVisibility(v)}>
                <SelectTrigger className="rounded-(--radius) border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-(--radius)">
                  <SelectItem value="open" className="rounded-(--radius)">Open (Public)</SelectItem>
                  <SelectItem value="closed" className="rounded-(--radius)">Closed (Private)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                <Users className="size-3" /> Capacity
              </Label>
              <Select value={String(maxParticipants)} onValueChange={(v) => setMaxParticipants(Number(v))}>
                <SelectTrigger className="rounded-(--radius) border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-(--radius)">
                  {CAPACITY_PRESETS.map((p) => (
                    <SelectItem key={p} value={String(p)} className="rounded-(--radius)">{p} People</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
              <Clock className="size-3" /> Timer Length
            </Label>
            <div className="flex flex-wrap gap-2">
              {TIMER_PRESETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimerMinutes(t)}
                  className={cn(
                    "px-4 py-2 rounded-(--radius) border-2 text-sm font-bold transition-all",
                    timerMinutes === t 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105" 
                      : "bg-background border-muted hover:border-indigo-400"
                  )}
                >
                  {t}m
                </button>
              ))}
              <div className="flex-1 min-w-[100px]">
                <Input
                  type="number"
                  placeholder="Custom"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Number(e.target.value))}
                  className="rounded-(--radius) border-2"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
             <Badge variant="outline" className="rounded-(--radius) border-indigo-200 bg-indigo-50 text-indigo-700">
               {maxParticipants} users
             </Badge>
             <Badge variant="outline" className="rounded-(--radius) border-indigo-200 bg-indigo-50 text-indigo-700">
               {timerMinutes} min
             </Badge>
          </div>
          <Button 
            onClick={onCreate} 
            disabled={!canSubmit || createRoom.isPending}
            className="rounded-(--radius) bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-bold shadow-[0_4px_0_rgb(67,56,202)] active:translate-y-1 active:shadow-none transition-all"
          >
            {createRoom.isPending ? "Starting..." : "Start Session!"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
