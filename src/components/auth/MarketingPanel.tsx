"use client";

import {
  Brain,
  CalendarClock,
  GraduationCap,
  Layers,
  Network,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type MarketingPanelVariant = "login" | "signup";

interface MarketingPanelProps {
  variant: MarketingPanelVariant;
}

const VARIANT_CONTENT: Record<
  MarketingPanelVariant,
  {
    eyebrow: string;
    headline: string;
    subtag: string;
    featureBlurbs: { icon: typeof Brain; title: string; body: string }[];
  }
> = {
  login: {
    eyebrow: "Welcome Back",
    headline: "Your study streak is waiting.",
    subtag:
      "Pick up where you left off — sessions, flashcards, and mind maps synced across every device.",
    featureBlurbs: [
      {
        icon: Sparkles,
        title: "Continue any session",
        body: "Resume Z mid-flow without losing context.",
      },
      {
        icon: CalendarClock,
        title: "Exam-ready",
        body: "Timetable reminders, last-mile review queues.",
      },
      {
        icon: Brain,
        title: "Memory that sticks",
        body: "Spaced-repetition tuned to your weak spots.",
      },
    ],
  },
  signup: {
    eyebrow: "Built for serious study",
    headline: "Everything you need to walk into exams prepared.",
    subtag:
      "An AI-powered study workspace — quizzes, flashcards, mind maps, study rooms, and a 24/7 tutor named Z.",
    featureBlurbs: [
      {
        icon: Brain,
        title: "Z — your 24/7 tutor",
        body: "Ask anything, get citation-grade answers.",
      },
      {
        icon: Layers,
        title: "Quizzes & flashcards",
        body: "Auto-generated from your course materials.",
      },
      {
        icon: Network,
        title: "Mind maps",
        body: "See the connection between concepts instantly.",
      },
    ],
  },
};

export function MarketingPanel({ variant }: MarketingPanelProps) {
  const copy = VARIANT_CONTENT[variant];

  return (
    <div className="flex w-full flex-col justify-between p-10 lg:p-16">
      {/* Brand mark */}
      <header>
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-none group-hover:text-primary transition-colors">
            Qz.
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/80 border-l border-border pl-3">
            BetaForge Labs
          </span>
        </Link>
      </header>

      {/* Center copy */}
      <div className="mt-16 max-w-lg">
        <span className="inline-flex border border-primary/60 px-2 py-1 bg-primary/5 mb-8">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            {copy.eyebrow}
          </span>
        </span>

        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-[-0.02em] text-foreground leading-[1.05] mb-6">
          {copy.headline}
        </h1>
        <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-md">
          {copy.subtag}
        </p>

        <div className="mt-10 space-y-5 max-w-md">
          {copy.featureBlurbs.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="size-9 shrink-0 border border-primary/40 bg-primary/5 flex items-center justify-center">
                <Icon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 flex items-center gap-6 text-[10px] font-mono tracking-widest uppercase text-muted-foreground/70">
        <span>© {new Date().getFullYear()} BetaForge Labs</span>
        <span className="size-1 rounded-full bg-border" />
        <span>v1.0</span>
      </footer>
    </div>
  );
}
