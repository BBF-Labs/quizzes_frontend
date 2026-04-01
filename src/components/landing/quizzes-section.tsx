"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, CheckCircle2, Clock, BarChart2 } from "lucide-react";

const highlights = [
  {
    icon: GraduationCap,
    title: "Official Qz Quizzes",
    body: "Curated, reviewed, and ready to take — built by the Qz team to test your knowledge on real academic topics.",
  },
  {
    icon: CheckCircle2,
    title: "Instant Feedback",
    body: "See the correct answer and explanation right after each question — no waiting, no guessing.",
  },
  {
    icon: Clock,
    title: "Timed & Structured",
    body: "Optional countdown timers and lecture-based structure keep your study sessions focused.",
  },
  {
    icon: BarChart2,
    title: "Track Your Progress",
    body: "Score tracking, passing thresholds, and retake support so you can measure improvement over time.",
  },
];

export function QuizzesSection() {
  return (
    <section className="py-24 border-t border-border/30 bg-secondary/5">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="inline-block border border-primary/40 px-2 py-1 mb-4 bg-primary/5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
              Platform Quizzes
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Official Qz Quizzes
              </h2>
              <p className="mt-3 text-muted-foreground/70 font-mono text-sm max-w-xl">
                Browse and take quizzes crafted by the Qz team. Organised by topic, structured by
                lecture, and designed to challenge your understanding.
              </p>
            </div>
            <Link
              href="/quizzes"
              className="flex items-center gap-2 shrink-0 border border-primary/40 bg-primary/5 hover:bg-primary hover:text-primary-foreground px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-primary transition-all duration-300 group"
            >
              Browse Quizzes
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="border border-border/40 bg-card/30 p-5 space-y-3 group hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <div className="flex size-8 items-center justify-center border border-primary/20 bg-primary/5 group-hover:border-primary/40 transition-colors">
                <h.icon className="size-4 text-primary/70" />
              </div>
              <div>
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest">
                  {h.title}
                </h3>
                <p className="mt-1 text-[10px] font-mono text-muted-foreground/60 leading-relaxed">
                  {h.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Preview strip — sample quiz card mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 border border-border/30 bg-card/20 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
              Example Question
            </p>
            <span className="text-[9px] font-mono text-muted-foreground/40">1 / 20</span>
          </div>
          <p className="font-mono text-sm text-foreground mb-4">
            Which data structure uses LIFO (Last In, First Out) ordering?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {["Queue", "Stack", "Linked List", "Binary Tree"].map((opt, i) => (
              <div
                key={opt}
                className={`border px-3 py-2 text-[11px] font-mono flex items-center gap-2 ${
                  i === 1
                    ? "border-green-500/40 bg-green-500/10 text-green-500"
                    : "border-border/30 text-muted-foreground/40"
                }`}
              >
                <span className="text-[9px] font-bold opacity-60">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {i === 1 && <CheckCircle2 className="ml-auto size-3 text-green-500" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
