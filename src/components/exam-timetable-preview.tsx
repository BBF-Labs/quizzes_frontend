"use client";

import { motion } from "framer-motion";
import { CalendarClock, MapPin, Clock, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const exams = [
  {
    code: "DCIT 205",
    name: "Algorithms",
    date: "Mon 12 Jan 2026",
    time: "9:00 AM",
    venue: "Great Hall, Main Campus",
    duration: "2 hours",
    daysAway: 18,
    urgent: true,
  },
  {
    code: "DCIT 207",
    name: "Operating Systems",
    date: "Wed 14 Jan 2026",
    time: "2:00 PM",
    venue: "Balme Library Hall",
    duration: "3 hours",
    daysAway: 20,
    urgent: false,
  },
];

const nextExam = exams[0];

export function ExamTimetablePreview() {
  return (
    <section className="py-20 md:py-32 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground uppercase mb-2">
            Exam Protocol
          </h2>
          <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest text-[10px] md:text-xs">
            Qz pulls your university exam timetable and sets automated reminders.
          </p>
          <div className="h-px w-full bg-border/50 mt-6" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-border/50"
        >
          {/* Left 1/3 — Countdown panel */}
          <div className="border-b lg:border-b-0 lg:border-r border-border/50 p-8 md:p-10 flex flex-col justify-between bg-card">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary block animate-pulse" />
                Next Exam
              </div>
              <h3 className="text-xl font-bold text-foreground uppercase tracking-tight mb-1">
                {nextExam.code}
              </h3>
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-8">
                {nextExam.name}
              </p>
              <div className="text-7xl md:text-8xl font-black text-foreground font-mono tracking-tight leading-none mb-2">
                {nextExam.daysAway}
              </div>
              <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                Days Remaining
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-black text-foreground font-mono">{nextExam.time}</div>
                <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mt-1">Start Time</div>
              </div>
              <div>
                <div className="text-2xl font-black text-foreground font-mono">{nextExam.duration}</div>
                <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mt-1">Duration</div>
              </div>
            </div>
          </div>

          {/* Right 2/3 — Timetable entries */}
          <div className="col-span-1 lg:col-span-2">
            {/* Terminal header */}
            <div className="p-4 border-b border-border/50 bg-background/80 flex items-center gap-4 font-mono text-xs">
              <div className="w-6 h-6 border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                Z
              </div>
              <div className="font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-primary block animate-pulse" />
                Task: Upcoming Timetable Supervision
              </div>
            </div>

            <div className="divide-y divide-border/50">
              {exams.map((exam, i) => (
                <motion.div key={i} variants={itemVariants} className="flex hover:bg-secondary/10 transition-colors">
                  {/* Left — course info */}
                  <div className="flex-1 p-8 md:p-10">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{exam.code}</div>
                    <h4 className="text-xl font-bold text-foreground mb-3">{exam.name}</h4>
                    <div className="flex flex-wrap gap-y-2 gap-x-5 text-sm text-muted-foreground font-mono mb-6">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5 text-primary/80" />
                        <span>{exam.date} · {exam.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary/80" />
                        <span>{exam.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary/80" />
                        <span>{exam.duration}</span>
                      </div>
                    </div>
                    <div className="bg-primary/5 p-3 flex items-center gap-3 border border-primary/10">
                      <Bell className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-xs font-mono text-primary">
                        Reminders: {exam.urgent ? "7 days, 3 days, 1 day before" : "3 days, 1 day before"}
                      </span>
                    </div>
                  </div>

                  {/* Right — countdown */}
                  <div className="border-l border-border/50 flex flex-col items-center justify-center px-8 min-w-[120px] text-center">
                    <div className={`text-5xl md:text-6xl font-black font-mono tracking-tight leading-none ${exam.urgent ? "text-primary" : "text-foreground"}`}>
                      {exam.daysAway}
                    </div>
                    <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mt-2">days</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
