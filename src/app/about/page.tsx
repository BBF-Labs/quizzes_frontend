"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Zap,
  Globe,
  Target,
  Shield,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/common";
import { Footer } from "@/components/landing";

// ─── Animation helpers ────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.55 } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRINCIPLES = [
  {
    icon: Brain,
    title: "Intelligence over repetition",
    body: "Rote memorisation is a losing strategy. Z analyses your weaknesses, builds a targeted plan, and won't let you advance until you've actually understood the material.",
  },
  {
    icon: Target,
    title: "Radical personalisation",
    body: "No two students share the same curriculum, pace, or gaps. Qz adapts to your exact programme, your exact lecturer's syllabus, and your exact exam schedule.",
  },
  {
    icon: Globe,
    title: "Built for African universities",
    body: "We didn't port a Western product and call it localised. Qz was designed from the ground up around Ghanaian and broader African university structures.",
  },
  {
    icon: Shield,
    title: "Your data stays yours",
    body: "The notes and materials you upload are your intellectual property. We use them only to serve you, and never to train third-party models without your explicit consent.",
  },
  {
    icon: Zap,
    title: "Speed without compromise",
    body: "Study sessions, quizzes, flashcards, and mind maps are generated in seconds — not because we cut corners, but because we obsess over the pipeline.",
  },
  {
    icon: BookOpen,
    title: "Education as infrastructure",
    body: "Access to quality learning tools shouldn't depend on geography or income. Affordable plans and student-verified pricing are a core part of how we operate.",
  },
];

const TIMELINE = [
  {
    year: "2023",
    event: "The frustration begins",
    detail: "Two Computer Science students at a Ghanaian university notice that every study tool available was designed for a student in California — not for them.",
  },
  {
    year: "2024",
    event: "BetaForge Labs founded",
    detail: "The first internal prototype of Qz is built: a chatbot that could read a PDF and generate quiz questions. It was rough. It was promising.",
  },
  {
    year: "Early 2025",
    event: "Z comes to life",
    detail: "The simple quiz bot evolves into a full AI study agent with phase-based sessions, syllabus awareness, memory, and verification gating.",
  },
  {
    year: "2025",
    event: "Public launch",
    detail: "Qz opens to students across Ghana, with curriculum support for over 14 universities, 200+ departments, and 1,200+ courses.",
  },
  {
    year: "2026 →",
    event: "Expanding the map",
    detail: "Partnerships with institutions, expansion into West Africa, and continued investment in the Z agent's reasoning capabilities.",
  },
];

// ─── Section components ───────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-block border border-primary/40 bg-primary/5 px-2 py-1 mb-6">
      <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">
        {children}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-border/50 my-20" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-24 border-l-4 border-primary pl-8 py-4"
          >
            <motion.div variants={itemVariants}>
              <SectionLabel>About / BetaForge Labs</SectionLabel>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase leading-none"
            >
              We built the<br />
              <span className="text-primary">tool we needed.</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-muted-foreground font-mono text-sm leading-relaxed"
            >
              Qz is built by BetaForge Labs — a small team of developers and
              educators who were once students frustrated by the gap between
              what study tools promised and what African universities actually
              needed. So we stopped waiting and built it ourselves.
            </motion.p>
          </motion.div>

          {/* ── Mission ──────────────────────────────────────────────────── */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-24"
          >
            <motion.div variants={itemVariants}>
              <SectionLabel>Our Mission</SectionLabel>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border/40"
            >
              <div className="p-10 border-r border-border/40 bg-primary/5">
                <p className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-tight text-foreground">
                  Make every African student<br />
                  <span className="text-primary">examination-ready.</span>
                </p>
              </div>
              <div className="p-10 flex flex-col justify-center space-y-4 font-mono text-sm text-muted-foreground leading-relaxed">
                <p>
                  University in Ghana — and across Africa — is high-stakes and
                  high-pressure. Syllabi are dense, resources are scarce, and
                  the gap between in-class instruction and exam performance is
                  wide.
                </p>
                <p>
                  We believe an AI study partner that actually knows your
                  curriculum, remembers your weaknesses, and forces mastery
                  before moving on can close that gap at scale.
                </p>
              </div>
            </motion.div>
          </motion.section>

          <Divider />

          {/* ── Principles ───────────────────────────────────────────────── */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-24"
          >
            <motion.div variants={itemVariants}>
              <SectionLabel>What We Believe</SectionLabel>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-10"
            >
              Six principles<br />that shape every decision.
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-border/30">
              {PRINCIPLES.map((p, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-background p-6 flex flex-col gap-4"
                >
                  <div className="p-2 border border-primary/20 bg-primary/5 w-fit">
                    <p.icon className="size-4 text-primary" />
                  </div>
                  <p className="text-[13px] font-black uppercase tracking-tight text-foreground leading-snug">
                    {p.title}
                  </p>
                  <p className="text-[12px] font-mono text-muted-foreground/70 leading-relaxed">
                    {p.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <Divider />

          {/* ── Timeline ─────────────────────────────────────────────────── */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-24"
          >
            <motion.div variants={itemVariants}>
              <SectionLabel>Our Journey</SectionLabel>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-10"
            >
              From frustration<br />to infrastructure.
            </motion.h2>

            <div className="relative pl-8 border-l border-border/40 space-y-10">
              {TIMELINE.map((t, i) => (
                <motion.div key={i} variants={itemVariants} className="relative">
                  {/* dot */}
                  <div className="absolute -left-[2.15rem] top-1 size-3.5 border-2 border-primary bg-background" />
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-primary shrink-0">
                      {t.year}
                    </span>
                    <span className="text-[13px] font-black uppercase tracking-tight text-foreground">
                      {t.event}
                    </span>
                  </div>
                  <p className="text-[12px] font-mono text-muted-foreground/60 leading-relaxed">
                    {t.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <Divider />

          {/* ── Z Callout ────────────────────────────────────────────────── */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-24"
          >
            <motion.div
              variants={itemVariants}
              className="border border-primary/30 bg-primary/5 p-10 md:p-14"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-black text-lg">
                  Z
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">
                  The AI Tutor
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight mb-6">
                Z isn&apos;t a chatbot.<br />
                <span className="text-primary">Z is a study system.</span>
              </h2>
              <p className="max-w-2xl font-mono text-sm text-muted-foreground/80 leading-relaxed mb-8">
                Z reads your curriculum, identifies your knowledge gaps, builds
                a structured study plan, generates lessons, quizzes, flashcards,
                and mind maps tailored to your material, and won&apos;t sign you off
                until you can prove mastery. No hand-holding. No shortcuts.
              </p>
              <Link href="/app">
                <Button className="font-mono text-[10px] uppercase tracking-[0.2em] h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Start a session
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </motion.div>
          </motion.section>

          {/* ── Back link ────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

        </div>
      </main>

      <Footer />
    </div>
  );
}
