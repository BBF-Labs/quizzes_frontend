"use client";

import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const messageText = "> ANALYSIS COMPLETE: ALGORITHMS (L03).\n> PREVIOUS STRUGGLE DETECTED: BIG-O NOTATION.\n> ACTION: 6-QUESTION SET COMPILED STARTING WITH WEAK AREAS.\n> STATUS: READY FOR INITIATION.";
const lines = messageText.split("\n");

const sentenceVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const lineVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: { opacity: 1, x: 0 },
};

export function MeetZ() {
  return (
    <section className="py-20 md:py-32 bg-secondary/10 border-b border-border/50 flex items-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 max-w-6xl"
      >
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2 uppercase">
                Agent Z
              </motion.h2>
              <motion.p variants={itemVariants} className="text-muted-foreground text-sm font-mono uppercase tracking-widest text-[10px] md:text-xs">
                A system that comprehends your curriculum, memorises your weaknesses, and tests you prior to advancement.
              </motion.p>
            </div>
            <div className="text-primary font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              AI Study Agent
            </div>
          </div>
          <div className="h-px w-full bg-border/50 mb-10" />
          <motion.div variants={itemVariants} className="flex flex-wrap justify-start gap-4 font-mono text-[10px] sm:text-xs">
            <div className="border border-border/80 px-4 py-2 flex items-center gap-2 uppercase tracking-widest">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span>Curriculum Aware</span>
            </div>
            <div className="border border-border/80 px-4 py-2 flex items-center gap-2 uppercase tracking-widest">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span>Gatekeeper Testing</span>
            </div>
            <div className="border border-border/80 px-4 py-2 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span>Adaptive Memory</span>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="w-full mx-auto">
          <div className="border border-border/50 bg-card rounded-none overflow-hidden font-mono text-xs">
            <div className="p-4 border-b border-border/50 bg-background/80 flex flex-row items-center gap-4">
              <div className="w-6 h-6 border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
                Z
              </div>
              <div className="font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-primary block animate-pulse" />
                SYSTEM MESSAGE // INBOUND PROTOCOL
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              <div className="bg-background/80 text-foreground p-6 border border-border/40 font-mono text-[13px] md:text-sm shadow-inner uppercase">
                <motion.div
                  variants={sentenceVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="space-y-3 font-medium text-primary/90"
                >
                  {lines.map((line, i) => (
                    <motion.p key={i} variants={lineVariants} className="tracking-wider">
                      {line}
                    </motion.p>
                  ))}
                </motion.div>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <Button className="rounded-none font-mono text-xs font-bold tracking-[0.1em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all h-12 px-6">
                  Initiate Sequence
                </Button>
                <Button variant="outline" className="rounded-none border-border/80 font-mono text-xs font-bold tracking-[0.1em] uppercase hover:bg-secondary/50 hover:text-foreground transition-all h-12 px-6">
                  Adjust Parameters
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
