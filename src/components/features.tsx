"use client";

import { motion } from "framer-motion";
import { Brain, LayoutList, GraduationCap, Compass, CalendarClock, Users } from "lucide-react";

import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } },
};

const features = [
  {
    title: "AI Study Partner",
    label: "DYNAMIC GENERATION",
    description: "Z generates quizzes on specific lectures, tests you before you advance, and adapts to how you learn. You set the pace. Z ensures readiness.",
    icon: <Brain className="w-5 h-5 text-primary" />,
  },
  {
    title: "Structured Quizzes",
    label: "CURRICULUM MAPPED",
    description: "Quizzes broken down by lecture and topics. You always know exactly what you're being tested on and where you are in the material.",
    icon: <LayoutList className="w-5 h-5 text-primary" />,
  },
  {
    title: "Program Tracker",
    label: "DEGREE OVERSIGHT",
    description: "Track every core course, elective, and prerequisite across all years. Know exactly where you stand at every point in your university degree.",
    icon: <GraduationCap className="w-5 h-5 text-primary" />,
  },
  {
    title: "Smart Recs",
    label: "BEHAVIOURAL ADAPTATION",
    description: "Z surfaces courses, flashcard sets, and external resources from academic papers, Khan Academy, and GitHub — matched purely to your profile.",
    icon: <Compass className="w-5 h-5 text-primary" />,
  },
  {
    title: "Exam Timetable",
    label: "TIME SUPERVISION",
    description: "Your full schedule in one place. Set personalised reminders 7, 3, or 1 day before each paper delivered by email and push. Never miss.",
    icon: <CalendarClock className="w-5 h-5 text-primary" />,
  },
  {
    title: "Peer Matching",
    label: "NETWORK OPTIMIZATION",
    description: "Get matched with peers strong where you are weak. Based on real behaviour — quiz scores, session patterns, affinity — not random pairing.",
    icon: <Users className="w-5 h-5 text-primary" />,
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-32 bg-background border-b border-border/50 flex items-center justify-center">
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
                Infrastructure
              </h2>
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest text-[10px] md:text-xs">
                Everything you need. Nothing you don't.
              </p>
            </div>
            <div className="text-primary font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              System Capabilities
            </div>
          </div>
          <div className="h-px w-full bg-border/50" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <div className="h-full border border-border/50 bg-card rounded-none p-6 hover:border-primary transition-colors flex flex-col group relative overflow-hidden">
                {/* Top accent line on hover */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 border border-primary/20 bg-primary/5 flex items-center justify-center rounded-none">
                    {feature.icon}
                  </div>
                  <span className="font-mono text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest">
                    {feature.label}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-foreground tracking-wider uppercase mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-[15px] text-muted-foreground leading-relaxed flex-1 font-light">
                  {feature.description}
                </p>
                
                <div className="mt-8 pt-4 border-t border-border/50">
                  <span className="text-primary text-[10px] font-mono tracking-widest uppercase font-bold group-hover:opacity-100 opacity-50 transition-opacity flex items-center gap-2">
                    Initialize Module <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
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
