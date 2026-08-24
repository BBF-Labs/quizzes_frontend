"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSessions, useCreateSession } from "@/hooks";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  House,
  MessageSquare,
  BookMarked,
  GraduationCap,
  CalendarDays,
  Layers,
  ListChecks,
  Network,
  Users,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const QUBI_POSES = [
  {
    src: "/images/f6eed6ae-0e8b-4c1c-a516-a4ca787d4963.png",
    alt: "Qubi waving hello",
    title: "Hey there! 👋",
    subtitle: "Ready to cook today?",
  },
  {
    src: "/images/bde53307-b0b5-4351-90ab-effc4618e33e.png",
    alt: "Qubi taking study notes",
    title: "Deep focus 🧠",
    subtitle: "Taking study notes...",
  },
  {
    src: "/images/6429cd24-eecd-4fe8-abb8-40d35adae68c.png",
    alt: "Qubi peeking",
    title: "Found your move! 👀",
    subtitle: "Check your study rooms",
  },
  {
    src: "/images/dcdc0a4b-27e0-4c41-8a13-ee21053d7511.png",
    alt: "Qubi running ahead",
    title: "Race you inside! 🏃",
    subtitle: "Start a study session",
  },
];

function QzLogoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4.2 9.2a5 5 0 0 1 5-5h5.6a5 5 0 0 1 5 5v5.6a5 5 0 0 1-5 5H9.2a5 5 0 0 1-5-5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M15.1 15.1 20.9 20.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <rect
        x="9.4"
        y="9.4"
        width="5.2"
        height="5.2"
        rx="1"
        transform="rotate(45 12 12)"
        fill="#DFFF61"
      />
    </svg>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const createSession = useCreateSession();

  const [poseIndex, setPoseIndex] = useState(0);
  const [profileExpanded, setProfileExpanded] = useState(false);

  // Auto rotate Qubi postures every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPoseIndex((prev) => (prev + 1) % QUBI_POSES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentPose = QUBI_POSES[poseIndex];

  const handleNewSession = async () => {
    try {
      const session = await createSession.mutateAsync({ mode: "structured" });
      const resolvedId = session?.id || (session as { _id?: string })?._id;
      if (resolvedId) {
        toast.success("New study session started!");
        router.push(`/app/${resolvedId}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create study session");
    }
  };

  const userInitials = useMemo(() => {
    if (!user?.name) return "AK";
    const parts = user.name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user?.name]);

  type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
  };

  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: "Workspace",
      items: [
        { href: "/app", label: "Today", icon: House },
        { href: "/app/all", label: "Sessions", icon: MessageSquare },
        { href: "/app/library", label: "My library", icon: BookMarked },
      ],
    },
    {
      label: "Academics",
      items: [
        { href: "/app/courses", label: "My courses", icon: GraduationCap },
        { href: "/app/timetable", label: "Timetable", icon: CalendarDays, badge: "4" },
      ],
    },
    {
      label: "Study tools",
      items: [
        { href: "/app/flashcards", label: "Flashcards", icon: Layers },
        { href: "/app/quizzes", label: "Quizzes", icon: ListChecks },
        { href: "/app/mindmaps", label: "Mind maps", icon: Network },
        { href: "/study-rooms", label: "Study rooms", icon: Users },
      ],
    },
  ];

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-slate-200/90 bg-white text-slate-900 [&_[data-slot=sidebar-inner]]:bg-white"
    >
      {/* Brand & Animated Qubi Mascot Header */}
      <SidebarHeader className="h-18 border-b border-slate-100 bg-white relative overflow-hidden shrink-0 p-3">
        {/* Qubi Mascot — links to the landing page (/) */}
        <Link
          href="/"
          aria-label="Qz home"
          className="group cursor-pointer w-full h-full flex items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs hover:border-[#0C60FC]/40 transition"
        >
          <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPose.src}
                src={currentPose.src}
                alt={currentPose.alt}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                transition={{ duration: 0.25 }}
                className="h-11 w-11 object-contain qubi-bob"
              />
            </AnimatePresence>
          </div>

          <CollapsibleHide className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPose.title}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <p className="hand text-base font-bold leading-tight text-[#0C60FC] truncate">
                  {currentPose.title}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
                  {currentPose.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </CollapsibleHide>
        </Link>
      </SidebarHeader>

      {/* Main Navigation Scroll Area */}
      <SidebarContent className="p-3 gap-4 no-scrollbar bg-white">
        {/* New Session CTA */}
        <button
          onClick={handleNewSession}
          disabled={createSession.isPending}
          className="mb-4 w-full flex items-center justify-between rounded-xl bg-slate-950 px-3.5 py-3 text-xs font-extrabold text-white hover:bg-[#0C60FC] transition shadow-sm"
        >
          <span className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            New study session
          </span>
          <span className="text-[10px] text-slate-400 font-mono">⌘N</span>
        </button>

        {/* Navigation Sections */}
        <nav className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <CollapsibleHide
                as="p"
                className="px-3 pb-1 pt-1 text-[9px] font-extrabold uppercase tracking-[.18em] text-slate-400"
              >
                {group.label}
              </CollapsibleHide>
              {group.items.map((item) => {
                const isActive =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition font-semibold",
                      isActive
                        ? "bg-blue-50 text-[#0C60FC] font-extrabold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                    <CollapsibleHide as="span">{item.label}</CollapsibleHide>
                    {item.badge && (
                      <CollapsibleHide as="span" className="ml-auto rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-extrabold text-rose-600">
                        {item.badge}
                      </CollapsibleHide>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </SidebarContent>

      {/* User Profile Widget Footer */}
      <SidebarFooter className="border-t border-slate-100 p-3 shrink-0 bg-white">
        <div className="rounded-2xl bg-[#F7F9FC] border border-slate-200/60 p-3">
          <button
            type="button"
            onClick={() => setProfileExpanded((v) => !v)}
            aria-expanded={profileExpanded}
            aria-label="Toggle account menu"
            className="flex w-full items-center gap-3 rounded-xl text-left transition hover:bg-white/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DFFF61] text-xs font-extrabold text-slate-950">
              {userInitials}
            </span>
            <CollapsibleHide className="min-w-0 flex-1">
              <p className="truncate text-xs font-extrabold text-slate-950">
                {user?.name || "Ama Kusi"}
              </p>
              <p className="truncate text-[10px] font-semibold text-slate-500">
                Computer Science · UG
              </p>
            </CollapsibleHide>
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                profileExpanded && "rotate-180",
              )}
            />
          </button>

          {/* Weekly goal progress — hidden when submenu is open to make room */}
          <AnimatePresence initial={false}>
            {!profileExpanded && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <CollapsibleHide>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-200">
                    <div className="h-full w-[68%] rounded-full bg-[#0C60FC]" />
                  </div>
                  <p className="mt-2 text-[9px] font-bold text-slate-400">
                    68% of weekly goal
                  </p>
                </CollapsibleHide>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded submenu */}
          <AnimatePresence initial={false}>
            {profileExpanded && (
              <motion.div
                key="submenu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <CollapsibleHide>
                  <div className="mt-3 space-y-0.5 border-t border-slate-200/70 pt-3">
                    <Link
                      href="/app/settings"
                      onClick={() => setProfileExpanded(false)}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-white hover:text-slate-950"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-500" />
                      Settings
                    </Link>
                    <Link
                      href="/app/billing"
                      onClick={() => setProfileExpanded(false)}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-white hover:text-slate-950"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                      Billing
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileExpanded(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </CollapsibleHide>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

// Hide inner content when the sidebar is collapsed to icon mode. Used for
// group labels, item text, badges, Qubi subtitle, and the user widget —
// everything except the icons and avatars that should remain visible.
function CollapsibleHide({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "p" | "span";
}) {
  const { state } = useSidebar();
  if (state === "collapsed") return null;
  return <Tag className={className}>{children}</Tag>;
}
