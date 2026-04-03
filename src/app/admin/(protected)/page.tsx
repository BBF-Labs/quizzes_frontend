"use client";

import { motion, Variants } from "framer-motion";
import {
  Users,
  Mail,
  Send,
  LayoutDashboard,
  ArrowRight,
  UserPlus,
  Calendar,
  Database,
} from "lucide-react";
import Link from "next/link";
import { useAdminStats } from "@/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  const cards = [
    {
      title: "Total Users",
      value: stats?.users ?? 0,
      description: "Registered platform users",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Waitlist",
      value: stats?.waitlist ?? 0,
      description: "Potential beta testers",
      icon: UserPlus,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      href: "/admin/waitlist",
    },
    {
      title: "Subscribers",
      value: stats?.newsletter ?? 0,
      description: "Active newsletter mailing list",
      icon: Mail,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      href: "/admin/subscribers",
    },
    {
      title: "Campaigns",
      value: stats?.campaigns ?? 0,
      description: "Newsletter campaigns sent",
      icon: Send,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      href: "/admin/campaigns",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            System Overview
          </span>
        </div>
        <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
          Dashboard
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
          V1.2.0 • Analytics & Control
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {cards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <Card className="rounded-(--radius) border-border/50 bg-card/40 hover:border-primary/50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground leading-none">
                  {card.title}
                </CardTitle>
                <div
                  className={`p-2 ${card.bg} border ${card.border} group-hover:border-primary/30 transition-colors`}
                >
                  <card.icon className={`size-3.5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="h-28 flex flex-col">
                <div className="text-2xl font-mono font-bold tracking-tighter">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 rounded-(--radius) bg-muted/20" />
                  ) : (
                    card.value
                  )}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-1 tracking-widest uppercase line-clamp-2">
                  {card.title === "Subscribers"
                    ? "Active mailing list"
                    : card.title === "Campaigns"
                      ? "Campaigns dispatched"
                      : card.description}
                </p>
                <div className="mt-auto">
                  {card.href ? (
                    <Link
                      href={card.href}
                      className="flex items-center justify-between group/link pt-2"
                    >
                      <span className="text-[9px] font-mono text-primary tracking-widest uppercase">
                        View All
                      </span>
                      <ArrowRight className="size-3 text-primary transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  ) : (
                    <div className="h-6" /> // Spacer to match link height
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions / Recent Activity Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-foreground">
              Next Phases
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-border/40 p-5 space-y-3 bg-secondary/5 group hover:border-primary/40 transition-colors">
              <LayoutDashboard className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="space-y-1">
                <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase">
                  Content Moderation
                </h3>
                <p className="text-[10px] font-mono text-muted-foreground/60 leading-relaxed uppercase">
                  Review and approve AI-generated materials and quizzes.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full rounded-(--radius) h-7 text-[8px] font-mono tracking-widest uppercase opacity-50"
              >
                Locked
              </Button>
            </div>

            <div className="border border-border/40 p-5 space-y-3 bg-secondary/5 group hover:border-primary/40 transition-colors">
              <Users className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="space-y-1">
                <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase">
                  Student Insights
                </h3>
                <p className="text-[10px] font-mono text-muted-foreground/60 leading-relaxed uppercase">
                  Visualize student engagement and performance metrics.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full rounded-(--radius) h-7 text-[8px] font-mono tracking-widest uppercase opacity-50"
              >
                Locked
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-foreground">
              Shortcuts
            </h2>
          </div>
          <div className="space-y-2">
            <Link href="/admin/campaigns">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-(--radius) h-11 border border-border/30 hover:bg-secondary/20 hover:border-primary/50 group"
              >
                <Send className="size-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-mono tracking-widest uppercase">
                  Campaigns Manager
                </span>
                <ArrowRight className="size-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>

            <Link href="/admin/academics/timetables">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-(--radius) h-11 border border-border/30 hover:bg-secondary/20 hover:border-primary/50 group"
              >
                <Calendar className="size-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-mono tracking-widest uppercase">
                  Timetable Sync
                </span>
                <ArrowRight className="size-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>

            <Link href="/admin/migrations">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-(--radius) h-11 border border-border/30 hover:bg-secondary/20 hover:border-primary/50 group"
              >
                <Database className="size-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-mono tracking-widest uppercase">
                  System Migrations
                </span>
                <ArrowRight className="size-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
