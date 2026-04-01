"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, GraduationCap, ArrowRight, Plus } from "lucide-react";
import { useAdminCourses, useAdminQuizzes } from "@/hooks/admin/use-academics";

export default function AcademicsHubPage() {
  const { data: courses = [] } = useAdminCourses();
  const { data: quizzes = [] } = useAdminQuizzes();

  const published = quizzes.filter((q) => q.status === "published").length;
  const drafts = quizzes.filter((q) => q.status === "draft").length;

  const cards = [
    {
      title: "Courses",
      description: "Manage course catalog — create, edit, and organise courses.",
      icon: BookOpen,
      href: "/admin/academics/courses",
      stat: courses.length,
      statLabel: "Total",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Quizzes",
      description: "Create, edit, publish, and AI-generate system-wide quizzes.",
      icon: GraduationCap,
      href: "/admin/academics/quizzes",
      stat: quizzes.length,
      statLabel: `${published} published · ${drafts} draft`,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            Content Management
          </span>
        </div>
        <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase">Academics</h1>
        <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
          Courses · Quizzes · AI Generation
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <div className="group border border-border/50 bg-card/40 hover:border-primary/50 transition-all duration-200 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className={`p-2 ${card.bg} border ${card.border}`}>
                  <card.icon className={`size-4 ${card.color}`} />
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-widest">
                  {card.title}
                </h2>
                <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 leading-relaxed uppercase">
                  {card.description}
                </p>
              </div>
              <div className="flex items-end justify-between border-t border-border/30 pt-3">
                <span className="text-2xl font-mono font-black">{card.stat}</span>
                <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                  {card.statLabel}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="border-b border-border/50 pb-2">
          <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase">
            Quick Actions
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/academics/quizzes?create=1">
            <button className="flex items-center gap-2 border border-border/40 bg-card/30 hover:border-primary/50 hover:bg-primary/5 px-3 py-2 text-[10px] font-mono uppercase tracking-widest transition-all">
              <Plus className="size-3" />
              New Quiz
            </button>
          </Link>
          <Link href="/admin/academics/courses?create=1">
            <button className="flex items-center gap-2 border border-border/40 bg-card/30 hover:border-primary/50 hover:bg-primary/5 px-3 py-2 text-[10px] font-mono uppercase tracking-widest transition-all">
              <Plus className="size-3" />
              New Course
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
