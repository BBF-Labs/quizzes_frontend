"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  LayoutGrid,
  Library,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  // True when the link is "exact match" (e.g. /); false for prefix match.
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: House, label: "Home", exact: true },
  { href: "/quizzes", icon: LayoutGrid, label: "Quizzes" },
  { href: "/library", icon: Library, label: "Library" },
  { href: "/timetable", icon: CalendarDays, label: "Timetable" },
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
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl py-2 text-[9px] font-bold transition-colors",
              isActive
                ? "bg-blue-50 text-[#0C60FC]"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2.25} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
