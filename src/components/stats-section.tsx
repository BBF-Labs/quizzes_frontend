"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest) + suffix);

  return (
    <motion.span
      onViewportEnter={() => {
        animate(count, value, { duration: 2.5, ease: [0.16, 1, 0.3, 1] });
      }}
      viewport={{ once: true }}
    >
      {rounded}
    </motion.span>
  );
}

const stats = [
  { value: 14, suffix: "+", label: "UNIVERSITIES" },
  { value: 80, suffix: "+", label: "COLLEGES" },
  { value: 120, suffix: "+", label: "SCHOOLS" },
  { value: 200, suffix: "+", label: "DEPARTMENTS" },
  { value: 1200, suffix: "+", label: "COURSES" },
];

export function StatsSection() {
  return (
    <section className="py-6 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-border/50">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center px-6 py-2">
              <span className="text-5xl md:text-6xl font-black text-foreground font-mono tracking-tight">
                <Counter value={s.value} suffix={s.suffix} />
              </span>
              <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
