"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Zap, Activity, Clock, Trash2, StopCircle, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";

interface SystemEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
}

export default function EventsPage() {
  const { socket, isConnected } = useSocket();
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!socket || isPaused) return;

    const handleEvent = (data: any) => {
      const newEvent: SystemEvent = {
        id: Math.random().toString(36).substring(7),
        type: data.type || "unknown",
        payload: data,
        timestamp: new Date().toISOString(),
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    };

    // Listen to various event channels
    socket.on("email:updated", (data) => handleEvent({ ...data, type: "email:updated" }));
    socket.on("campaign:updated", (data) => handleEvent({ ...data, type: "campaign:updated" }));
    
    return () => {
      socket.off("email:updated");
      socket.off("campaign:updated");
    };
  }, [socket, isPaused]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            Real-time Monitoring
          </span>
        </div>
        <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
          System Events
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
          Live Socket Stream
        </p>
      </motion.div>

      {/* Stats / Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-none border-border/50 bg-card/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Status</p>
              <div className="flex items-center gap-2">
                <div className={cn("size-2 rounded-none", isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-destructive animate-pulse")} />
                <p className="text-sm font-mono font-bold uppercase tracking-tighter">
                  {isConnected ? "Live Connection" : "Offline"}
                </p>
              </div>
            </div>
            <Activity className={cn("size-5 text-muted-foreground", isConnected && "text-primary animate-pulse")} />
          </CardContent>
        </Card>

        <div className="sm:col-span-2 flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPaused(!isPaused)}
            className="rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 h-10 px-4"
          >
            {isPaused ? <PlayCircle className="size-3.5" /> : <StopCircle className="size-3.5" />}
            {isPaused ? "Resume Stream" : "Pause Stream"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setEvents([])}
            className="rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 h-10 px-4"
          >
            <Trash2 className="size-3.5" /> Clear Logs
          </Button>
        </div>
      </div>

      {/* Event Log */}
      <Card className="rounded-none border-border/50 bg-card/40 flex flex-col h-[600px]">
        <CardHeader className="border-b border-border/10 shrink-0">
          <CardTitle className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground flex items-center justify-between">
            Event Log
            <span className="text-[9px] lowercase font-normal opacity-50 italic">Showing last 50 events</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto flex-1 font-mono text-[11px]">
          {events.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-2 uppercase tracking-widest">
               <Zap className="size-8 opacity-20" />
               <p>Waiting for events...</p>
            </div>
          ) : (
            <div className="divide-y divide-border/5">
              <AnimatePresence initial={false}>
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 hover:bg-secondary/10 transition-colors flex gap-4 overflow-hidden"
                  >
                    <div className="shrink-0 pt-1">
                      <Clock className="size-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-bold uppercase tracking-wider">{event.type}</span>
                        <span className="text-[10px] text-muted-foreground/40">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="bg-black/20 p-2 border border-border/5 overflow-x-auto">
                        <pre className="text-[9px] text-muted-foreground/80 leading-relaxed">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
