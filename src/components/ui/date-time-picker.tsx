"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date) => void;
  className?: string;
}

export function DateTimePicker({ date, setDate, className }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [time, setTime] = React.useState(date ? format(date, "HH:mm") : "12:00");

  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setTime(format(date, "HH:mm"));
    }
  }, [date]);

  const handleDateSelect = (d: Date | undefined) => {
    if (d) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(d);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      setSelectedDate(newDate);
      setDate(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (selectedDate) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      setSelectedDate(newDate);
      setDate(newDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-mono text-[11px] uppercase tracking-widest h-9 bg-background border-border/50",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50" />
            {date ? format(date, "PPP HH:mm") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-border/40" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="rounded-none bg-background font-mono"
          />
          <div className="p-3 border-t border-border/40 flex items-center gap-3 bg-secondary/5">
            <Clock className="size-3.5 text-muted-foreground" />
            <Input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="h-8 text-[11px] font-mono uppercase bg-transparent border-border/30 focus-visible:ring-primary/20"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
