"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Check, LayoutDashboard, LogOut } from "lucide-react";
import { LOGO_SRC } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { resolveAvatarUrl } from "@/lib/utils";
import { useStreakStatus } from "@/hooks/common/use-billing";

interface Language {
  code: string;
  label: string;
  flagNode: React.ReactNode;
}

const FlagUS = () => (
  <svg viewBox="0 0 32 32" className="h-5 w-5 rounded-full object-cover shadow-sm ring-1 ring-slate-200">
    <circle cx="16" cy="16" r="16" fill="#B22234" />
    <path d="M0 5.33h32M0 10.66h32M0 16h32M0 21.33h32M0 26.66h32" stroke="#FFFFFF" strokeWidth="2.66" />
    <rect x="0" y="0" width="14.22" height="17.77" fill="#3C3B6E" />
    <circle cx="3" cy="3" r="0.9" fill="#FFF" />
    <circle cx="7" cy="3" r="0.9" fill="#FFF" />
    <circle cx="11" cy="3" r="0.9" fill="#FFF" />
    <circle cx="5" cy="6" r="0.9" fill="#FFF" />
    <circle cx="9" cy="6" r="0.9" fill="#FFF" />
    <circle cx="3" cy="9" r="0.9" fill="#FFF" />
    <circle cx="7" cy="9" r="0.9" fill="#FFF" />
    <circle cx="11" cy="9" r="0.9" fill="#FFF" />
    <circle cx="5" cy="12" r="0.9" fill="#FFF" />
    <circle cx="9" cy="12" r="0.9" fill="#FFF" />
    <circle cx="3" cy="15" r="0.9" fill="#FFF" />
    <circle cx="7" cy="15" r="0.9" fill="#FFF" />
    <circle cx="11" cy="15" r="0.9" fill="#FFF" />
  </svg>
);

const FlagGhana = () => (
  <svg viewBox="0 0 32 32" className="h-5 w-5 rounded-full object-cover shadow-sm ring-1 ring-slate-200">
    <circle cx="16" cy="16" r="16" fill="#006B3F" />
    <path d="M0 0h32v10.66H0z" fill="#CE1126" />
    <path d="M0 10.66h32v10.66H0z" fill="#FCD116" />
    <polygon points="16,11.5 17.2,15 20.8,15 17.8,17.1 19,20.5 16,18.4 13,20.5 14.2,17.1 11.2,15 14.8,15" fill="#000" />
  </svg>
);

const FlagFrance = () => (
  <svg viewBox="0 0 32 32" className="h-5 w-5 rounded-full object-cover shadow-sm ring-1 ring-slate-200">
    <circle cx="16" cy="16" r="16" fill="#FFF" />
    <path d="M0 0h10.66v32H0z" fill="#002395" />
    <path d="M21.33 0H32v32H21.33z" fill="#ED2939" />
  </svg>
);

const FlagSpain = () => (
  <svg viewBox="0 0 32 32" className="h-5 w-5 rounded-full object-cover shadow-sm ring-1 ring-slate-200">
    <circle cx="16" cy="16" r="16" fill="#AA151B" />
    <path d="M0 8h32v16H0z" fill="#F1BF00" />
  </svg>
);

const LANGUAGES: Language[] = [
  { code: "en-US", label: "English (US)", flagNode: <FlagUS /> },
  { code: "en-GH", label: "English (Ghana)", flagNode: <FlagGhana /> },
  { code: "fr", label: "Français", flagNode: <FlagFrance /> },
  { code: "es", label: "Español", flagNode: <FlagSpain /> },
];

export function LandingHeader() {
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const { user, isLoading: authLoading, logout } = useAuth();
  const { data: streak } = useStreakStatus();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive initials from name
  const initials = user
    ? (user.name?.split(" ").map((w) => w[0]).slice(0, 2).join("") ?? user.email?.[0] ?? "U").toUpperCase()
    : "";
  const avatarUrl = resolveAvatarUrl(user);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-5">
      <nav className="frosted mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-white/80 px-3 shadow-[0_10px_40px_rgba(21,32,55,.11)] ring-1 ring-slate-200/70 sm:px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Qz home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Qz" className="h-9 w-9 object-contain" />
          <span className="display text-lg font-bold tracking-tight">Qz</span>
          <span className="hidden rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#0C60FC] sm:inline">
            Beta
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/#features" className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Product
          </Link>
          <Link href="/study-rooms" className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Study rooms
          </Link>
          <Link href="/library" className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Library
          </Link>
          <Link href="/quizzes" className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Quizzes
          </Link>
          <Link href="/timetable" className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Timetable
          </Link>
          <Link href="/pricing" className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Pricing
          </Link>
          <Link href="/donate" className="rounded-xl px-3.5 py-2 text-xs font-bold text-[#0C60FC] transition hover:bg-blue-50">
            Donate
          </Link>
        </div>

        {/* Right side */}
        <div className="flex h-full items-center gap-1.5">
          {/* Streak pill — only for authenticated users with an active streak */}
          {user && streak && streak.current > 0 && (
            <div
              title={`${streak.current}-day streak · longest: ${streak.longest}`}
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold lg:flex ${
                streak.isActive
                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
              }`}
            >
              <span className="text-sm leading-none">{streak.isActive ? "🔥" : "💤"}</span>
              {streak.current}d
            </div>
          )}

          {/* Language selector */}
          <div className="relative hidden lg:block" ref={langRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-transparent px-2 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100/70 focus:outline-none"
              aria-label="Choose language"
              aria-expanded={isLangOpen}
            >
              <span className="flex shrink-0 items-center">{selectedLang.flagNode}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                {LANGUAGES.map((lang) => {
                  const isSelected = lang.code === selectedLang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => { setSelectedLang(lang); setIsLangOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition ${isSelected ? "bg-blue-50 text-[#0C60FC]" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="flex shrink-0 items-center">{lang.flagNode}</span>
                        <span>{lang.label}</span>
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#0C60FC]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Auth CTA — skeleton while loading */}
          {authLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
          ) : user ? (
            /* ── Authenticated: avatar + dropdown ── */
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
                aria-label="Account menu"
                aria-expanded={isUserOpen}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0C60FC] text-xs font-extrabold text-white shadow-sm">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    initials
                  )}
                </span>
                <span className="hidden max-w-[100px] truncate text-xs font-bold text-slate-700 sm:block">
                  {user.name?.split(" ")[0] ?? user.email?.split("@")[0]}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isUserOpen ? "rotate-180" : ""}`} />
              </button>

              {isUserOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/app"
                    onClick={() => setIsUserOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#0C60FC]" />
                    Open dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setIsUserOpen(false); logout?.(); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest: login + signup ── */
            <>
              <Link
                href="/login"
                className="hidden rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 sm:block"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="squishy rounded-xl bg-slate-950 px-4 py-3 text-xs font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0C60FC]"
              >
                Start free <span className="ml-1">↗</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
