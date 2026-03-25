"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface YearOfStudyStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

export default function YearOfStudyStep({
  onComplete,
  initialData,
}: YearOfStudyStepProps) {
  const [year, setYear] = useState((initialData?.yearOfStudy as number) || 1);

  const years = [
    { value: 1, label: "1st Year", sub: "Freshman" },
    { value: 2, label: "2nd Year", sub: "Sophomore" },
    { value: 3, label: "3rd Year", sub: "Junior" },
    { value: 4, label: "4th Year", sub: "Senior" },
    { value: 5, label: "5th Year+", sub: "Extended" },
    { value: 0, label: "Postgrad", sub: "Masters/PhD" },
  ];

  const handleSubmit = (selectedYearValue: number) => {
    setYear(selectedYearValue);
    onComplete({ yearOfStudy: selectedYearValue });
  };

  return (
    <div className="space-y-8 sm:space-y-10 w-full min-w-0">
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] uppercase leading-tight text-center">
          Which stage?
        </h1>
        <p className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed text-center max-w-sm mx-auto px-2">
          Currently enrolled level of study.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
        {years.map((yearItem, idx) => (
          <motion.div
            key={yearItem.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="min-w-0"
          >
            <button
              onClick={() => handleSubmit(yearItem.value)}
              className={`w-full group relative overflow-hidden flex flex-col items-center justify-center p-5 sm:p-8 border rounded-(--radius) transition-all duration-300 min-h-28 sm:min-h-36 ${
                year === yearItem.value
                  ? "bg-primary border-primary shadow-[0_0_40px_rgba(var(--primary),0.2)]"
                  : "bg-secondary/20 border-border hover:bg-secondary/40 hover:border-primary/50"
              }`}
            >
              {/* Decorative accent */}
              <div
                className={`absolute top-0 right-0 size-8 transition-opacity ${
                  year === yearItem.value
                    ? "opacity-20"
                    : "opacity-0 group-hover:opacity-10"
                }`}
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, transparent 50%, white 50%)",
                }}
              />

              <span
                className={`text-xl sm:text-2xl font-black tracking-tighter mb-1 transition-colors text-center wrap-break-word ${
                  year === yearItem.value ? "text-white" : "text-primary/80"
                }`}
              >
                {yearItem.label}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-colors text-center wrap-break-word ${
                  year === yearItem.value
                    ? "text-white/60"
                    : "text-muted-foreground"
                }`}
              >
                {yearItem.sub}
              </span>

              {/* Hover highlight */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center flex-col items-center gap-4 sm:gap-6 opacity-40">
        <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.3em] text-center">
          Stage defines content difficulty.
        </p>
      </div>
    </div>
  );
}
