"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  // True when the link is "exact match" (e.g. /); false for prefix match.
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: "⌂", label: "Home", exact: true },
  { href: "/quizzes", icon: "▦", label: "Quizzes" },
  { href: "/library", icon: "☐", label: "Library" },
  { href: "/timetable", icon: "▤", label: "Timetable" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="frosted fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-2xl border border-slate-200 p-1.5 shadow-2xl md:hidden"
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center rounded-xl py-2 text-[9px] font-bold transition-colors",
              isActive
                ? "bg-blue-50 text-[#0C60FC]"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
