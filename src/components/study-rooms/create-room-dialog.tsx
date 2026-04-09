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
      <DialogContent className="rounded-(--radius) sm:max-w-[500px] border border-border/50 bg-background shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-mono font-bold uppercase tracking-tight text-primary italic">Start a Study Sprint</DialogTitle>
          <DialogDescription>
            Set up your room, invite your friends, and track your progress together.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/70">Room Name</Label>
            <Input
              id="title"
              placeholder="e.g. Physics Final Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-(--radius) border-border/50 focus-visible:ring-primary text-base h-11"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="topic" className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/70">Session Goal</Label>
            <Textarea
              id="topic"
              placeholder="Session objective..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-(--radius) border-border/50 resize-none min-h-[60px] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                <Globe className="size-3" /> Visibility
              </Label>
              <Select value={visibility} onValueChange={(v: "open" | "closed") => setVisibility(v)}>
                <SelectTrigger className="rounded-(--radius) border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-(--radius)">
                  <SelectItem value="open" className="rounded-(--radius)">Open (Public)</SelectItem>
                  <SelectItem value="closed" className="rounded-(--radius)">Closed (Private)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                <Users className="size-3" /> Capacity
              </Label>
              <Select value={String(maxParticipants)} onValueChange={(v) => setMaxParticipants(Number(v))}>
                <SelectTrigger className="rounded-(--radius) border-border/50">
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
            <Label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
              <Clock className="size-3" /> Timer Length
            </Label>
            <div className="flex flex-wrap gap-2">
              {TIMER_PRESETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimerMinutes(t)}
                  className={cn(
                    "px-4 py-2 rounded-(--radius) border text-xs font-mono font-bold transition-all",
                    timerMinutes === t 
                      ? "bg-primary border-primary text-primary-foreground shadow-md scale-105" 
                      : "bg-background border-border/50 hover:border-primary/50"
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
                  className="rounded-(--radius) border-border/50 h-9 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
             <Badge variant="outline" className="rounded-(--radius) border-border/50 text-[10px] font-mono uppercase">
               {maxParticipants} capacity
             </Badge>
             <Badge variant="outline" className="rounded-(--radius) border-border/50 text-[10px] font-mono uppercase">
               {timerMinutes} minutes
             </Badge>
          </div>
          <Button 
            onClick={onCreate} 
            disabled={!canSubmit || createRoom.isPending}
            className="rounded-(--radius) px-6 font-bold uppercase tracking-wider transition-all active:translate-y-0.5"
          >
            {createRoom.isPending ? "Starting..." : "Start Sprint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
