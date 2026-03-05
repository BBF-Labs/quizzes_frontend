"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Eye, Zap, Check } from "lucide-react";
import { SquareLoader } from "@/components/ui/square-loader";

import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } },
};

const steps = [
  {
    icon: <ClipboardList className="w-5 h-5" />,
    title: "INPUT PARAMETERS",
    desc: "Specify lecture or topic. Z acquires curriculum context instantly.",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "VERIFY PLAN",
    desc: "Z outputs the schema (topics, types, duration). You confirm or override.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "INITIATE EXECUTION",
    desc: "Task executes sequentially in real time. Total transparency.",
  },
];

const mockLines = [
  { id: 1, status: "done", text: "PLAN CONFIRMED: 4 TOPICS, 24 QUESTIONS, ~14 MINS" },
  { id: 2, status: "done", text: "SORTING ALGORITHMS (MCQ) ... [3/3]" },
  { id: 3, status: "done", text: "SEARCHING STRATEGIES (T/F) ... [2/2]" },
  { id: 4, status: "progress", text: "TIME COMPLEXITY (SHORT) ... [1/3]" },
  { id: 5, status: "pending", text: "RECURSIVE BRANCHING ... [PENDING]" },
];

export function HowZWorks() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    
    // Simulate real-time execution log
    mockLines.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, i]);
        }, 1200 * (i + 1))
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <section className="py-20 md:py-32 bg-background border-b border-border/50 flex items-center">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2 uppercase">
                Deterministic Execution
              </h2>
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest text-[10px] md:text-xs">
                Z doesn't just answer questions. It formulates and executes a strict plan.
              </p>
            </div>
            <div className="text-primary font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              Study Engine
            </div>
          </div>
          <div className="h-px w-full bg-border/50" />
        </motion.div>

        {/* Stepper */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row gap-6 mb-16"
        >
          {steps.map((step, idx) => (
            <motion.div key={idx} variants={itemVariants} className="flex-1 p-6 border border-border/50 bg-secondary/10 flex flex-col hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 border border-primary/20 bg-primary/10 text-primary flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-sm font-bold tracking-wider text-foreground mb-3 font-mono">{step.title}</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed font-light">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mock Live Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
          viewport={{ once: true }}
          className="w-full mx-auto"
        >
          <div className="border border-border/50 bg-card/40 rounded-none overflow-hidden font-mono text-xs">
            <div className="p-4 border-b border-border/50 bg-background/80 flex flex-row items-center gap-4">
              <div className="w-6 h-6 border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
                Z
              </div>
              <div className="font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-primary block animate-pulse" />
                Task: Generating quiz _ Algorithms [L03]
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-4 min-h-[160px]">
                <AnimatePresence>
                  {mockLines.map((line, i) => (
                    visibleLines.includes(i) && (
                      <motion.div
                        key={line.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                      >
                        {line.status === "done" && (
                          <div className="w-4 h-4 border border-primary bg-primary/20 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-primary" />
                          </div>
                        )}
                        {line.status === "progress" && <SquareLoader size={16} strokeWidth={1.5} />}
                        {line.status === "pending" && <div className="w-4 h-4 border border-muted-foreground/30 shrink-0" />}
                        
                        <span className={`${line.status === "pending" ? "text-muted-foreground/50" : line.status === "progress" ? "text-primary font-bold" : "text-foreground font-medium"} tracking-wider uppercase`}>
                          {line.text}
                        </span>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-6 border-t border-border/50">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-3 font-bold uppercase tracking-widest">
                  <span>System Progress</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={visibleLines.length >= 4 ? { opacity: 1 } : { opacity: 0 }}
                    className="text-primary"
                  >
                    62% COMPLETE
                  </motion.span>
                </div>
                <div className="h-1 bg-border/50 rounded-none overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: visibleLines.length >= 4 ? "62%" : "0%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
