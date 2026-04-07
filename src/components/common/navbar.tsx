"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle, UserProfileDropdown } from "@/components/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";
import { DonationBanner } from "@/components/landing/donation-banner";
import { api } from "@/lib/api";
import { useAuthQuery, useStreakStatus } from "@/hooks";
import { queryKeys } from "@/lib/query-keys";
import { Flame } from "lucide-react";
import {
  ONBOARDING_BANNER_VISIBILITY_EVENT,
  isOnboardingBannerTemporarilyHidden,
} from "@/lib/onboarding-banner";

const EXPLORE_LINKS = [
  { href: "/quizzes", label: "Quizzes" },
  { href: "/library", label: "Library" },
  { href: "/timetable", label: "Timetable" },
];

function MobileExploreSection() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 rounded-(--radius) font-mono tracking-widest uppercase text-sm text-foreground hover:bg-accent transition-colors"
      >
        Explore
        <ChevronDown className={`size-3.5 opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border/40 pl-3">
          {EXPLORE_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="w-full">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-(--radius) font-mono tracking-widest uppercase text-muted-foreground h-8 text-xs"
              >
                {label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBannerTemporarilyHidden, setIsBannerTemporarilyHidden] = useState(
    () => isOnboardingBannerTemporarilyHidden(),
  );
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: streak } = useStreakStatus();
  const { scrollY } = useScroll();

  const { data: onboardingStatus, isLoading: onboardingStatusLoading } =
    useAuthQuery({
      queryKey: queryKeys.onboardingStatus,
      queryFn: async () => {
        const res = await api.get("/users/onboarding/status");
        return res.data?.data;
      },
      enabled: !!user,
      staleTime: 30_000,
    });

  const isOnboardingPath = pathname?.startsWith("/onboarding");
  const onboardingCompleted =
    onboardingStatus?.completed ?? user?.onboarding?.completed ?? false;

  const showBanner =
    !!user &&
    !isOnboardingPath &&
    !onboardingStatusLoading &&
    !onboardingCompleted &&
    !isBannerTemporarilyHidden;

  useEffect(() => {
    const refreshHiddenState = () => {
      setIsBannerTemporarilyHidden(isOnboardingBannerTemporarilyHidden());
    };

    window.addEventListener(
      ONBOARDING_BANNER_VISIBILITY_EVENT,
      refreshHiddenState,
    );
    window.addEventListener("storage", refreshHiddenState);
    return () => {
      window.removeEventListener(
        ONBOARDING_BANNER_VISIBILITY_EVENT,
        refreshHiddenState,
      );
      window.removeEventListener("storage", refreshHiddenState);
    };
  }, []);

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(var(--navbar-bg), 0)", "rgba(var(--navbar-bg), 0.7)"],
  );

  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(16px)"],
  );
  const borderBottom = useTransform(
    scrollY,
    [0, 100],
    [
      "1px solid rgba(var(--navbar-border), 0)",
      "1px solid rgba(var(--navbar-border), 0.1)",
    ],
  );

  const scrollToHero = () => {
    if (pathname !== "/") {
      router.push("/#waitlist-form");
    } else {
      document
        .getElementById("waitlist-form")
        ?.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <>
      <DonationBanner />
      <OnboardingBanner />
      {showBanner && <div className="h-12.25 w-full shrink-0" />}
      <motion.header
        style={{ backgroundColor, backdropFilter: backdropBlur, borderBottom }}
        className={`fixed left-0 right-0 z-50 h-16 transition-all duration-300 ${
          showBanner ? "top-12.25" : "top-0"
        }`}
      >
        <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
          <Link href="/" className="flex items-end space-x-2 group">
            <span className="text-xl font-bold tracking-widest text-foreground leading-none group-hover:text-primary transition-colors">
              Qz.
            </span>
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground/60 uppercase leading-none mb-0.5 hidden sm:inline-block">
              / BetaForge Labs
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-8">
              <span className="text-xs font-mono font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground cursor-pointer transition-colors uppercase">
                Features
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-mono font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors uppercase outline-none">
                  Explore
                  <ChevronDown className="size-3 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="font-mono min-w-[140px]">
                  <DropdownMenuItem asChild>
                    <Link href="/quizzes" className="text-[11px] tracking-widest uppercase cursor-pointer">
                      Quizzes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/library" className="text-[11px] tracking-widest uppercase cursor-pointer">
                      Library
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/timetable" className="text-[11px] tracking-widest uppercase cursor-pointer">
                      Timetable
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                href="/pricing"
                className="text-xs font-mono font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors uppercase"
              >
                Pricing
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user && streak && streak.current > 0 && (
                <div className="flex items-center gap-1 border border-amber-400/30 bg-amber-400/5 px-2 py-1">
                  <Flame className="size-3 text-amber-400" />
                  <span className="text-[10px] font-mono font-bold text-amber-400 tabular-nums">
                    {streak.current}
                  </span>
                </div>
              )}
              <Button
                onClick={scrollToHero}
                variant="outline"
                className="rounded-(--radius) border-primary/40 bg-primary/5 text-primary text-xs font-mono font-bold tracking-[0.15em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-[0_0_15px_rgba(0,110,255,0.1)]"
              >
                WAITLIST
              </Button>
              {user ? (
                <div className="flex items-center space-x-4">
                  <UserProfileDropdown user={user} onLogout={logout} />
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="rounded-(--radius) text-muted-foreground hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(0,110,255,0.3)] text-xs font-mono font-bold tracking-[0.15em] uppercase transition-all duration-500 px-6 border border-border/50 hover:border-primary"
                  >
                    LOGIN
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Toggle & ThemeToggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            {user && streak && streak.current > 0 && (
              <div className="flex items-center gap-1 border border-amber-400/30 bg-amber-400/5 px-1.5 py-1">
                <Flame className="size-3 text-amber-400" />
                <span className="text-[10px] font-mono font-bold text-amber-400 tabular-nums">
                  {streak.current}
                </span>
              </div>
            )}
            {user && (
              <div className="mr-1">
                <UserProfileDropdown user={user} onLogout={logout} />
              </div>
            )}
            <button
              className="p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer - Now nested inside header for perfect alignment */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-background border-b border-border z-40 md:hidden pb-6 pt-4 px-4 flex flex-col space-y-4 shadow-xl"
            >
              <Button
                variant="ghost"
                className="w-full justify-start rounded-(--radius) font-mono tracking-widest uppercase"
              >
                Features
              </Button>
              <MobileExploreSection />
              <Link href="/pricing" className="w-full">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-(--radius) font-mono tracking-widest uppercase"
                >
                  Pricing
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full rounded-(--radius) border-primary/40 bg-primary/5 text-primary font-mono tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                onClick={scrollToHero}
              >
                WAITLIST
              </Button>
              {!user && (
                <Link href="/login" className="w-full pt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-(--radius) font-mono font-bold tracking-widest uppercase hover:bg-primary hover:text-white transition-all h-12"
                  >
                    LOGIN
                  </Button>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
