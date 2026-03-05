"use client";

import { Shield, Brain, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } },
};

const pillars = [
  {
    Icon: Shield,
    label: "PILLAR 01",
    title: "CURRICULUM ALIGNMENT",
    desc: "Never study outside the scope of your actual university syllabus and lecturer's material. Z knows exactly what's in the exam.",
    highlight: false,
  },
  {
    Icon: Brain,
    label: "PILLAR 02",
    title: "ADAPTIVE MEMORY",
    desc: "Do not guess answers. If the underlying concept is not understood, Z halts and systematically reviews your gaps before advancing.",
    highlight: false,
  },
  {
    Icon: BarChart2,
    label: "PILLAR 03",
    title: "GATEKEEPER TESTING",
    desc: "Whether quiz or final exam, maintain relentless discipline and follow the recommended path. No advancement without mastery.",
    highlight: false,
  },
];

export function ProblemSolution() {
  return (
    <section className="py-20 md:py-32 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground uppercase mb-2">
                The Protocol
              </h2>
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest text-[10px] md:text-xs">
                Three pillars of the system
              </p>
            </div>
            <div className="text-primary font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              System Architecture
            </div>
          </div>
          <div className="h-px w-full bg-border/50" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {pillars.map((p, i) => (
            <motion.div key={i} variants={itemVariants}>
              <div className={`h-full border bg-card rounded-none p-6 hover:border-primary transition-colors flex flex-col group relative overflow-hidden ${p.highlight ? "border-primary/50" : "border-border/50"}`}>
                <div className={`absolute top-0 left-0 w-full h-[2px] bg-primary ${p.highlight ? "opacity-100" : "scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"}`} />
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-10 h-10 border flex items-center justify-center rounded-none ${p.highlight ? "border-primary/50 bg-primary/10" : "border-border/50 bg-background"}`}>
                    <p.Icon className={`w-5 h-5 ${p.highlight ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                  </div>
                  <span className="font-mono text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest">
                    {p.label}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground tracking-wider uppercase mb-3">{p.title}</h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed flex-1 font-light">{p.desc}</p>
                <div className="mt-8 pt-4 border-t border-border/50">
                  <span className="text-primary text-[10px] font-mono tracking-widest uppercase font-bold group-hover:opacity-100 opacity-50 transition-opacity flex items-center gap-2">
                    View Module <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
