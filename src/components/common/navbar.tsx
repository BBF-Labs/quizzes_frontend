"use client";

import { useState } from "react";
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
import { useAuth } from "@/contexts/auth-context";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";
import { api } from "@/lib/api";
import { useAuthQuery } from "@/hooks";
import { queryKeys } from "@/lib/query-keys";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
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
    !onboardingCompleted;

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
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                onClick={scrollToHero}
                variant="outline"
                className="rounded-none border-primary/40 bg-primary/5 text-primary text-xs font-mono font-bold tracking-[0.15em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-[0_0_15px_rgba(0,110,255,0.1)]"
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
                    className="rounded-none text-muted-foreground hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(0,110,255,0.3)] text-xs font-mono font-bold tracking-[0.15em] uppercase transition-all duration-500 px-6 border border-border/50 hover:border-primary"
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
                className="w-full justify-start rounded-none font-mono tracking-widest uppercase"
              >
                Features
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-none border-primary/40 bg-primary/5 text-primary font-mono tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                onClick={scrollToHero}
              >
                WAITLIST
              </Button>
              {!user && (
                <Link href="/login" className="w-full pt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-none font-mono font-bold tracking-widest uppercase hover:bg-primary hover:text-white transition-all h-12"
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
