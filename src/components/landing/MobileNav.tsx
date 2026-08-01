"use client";

import Link from "next/link";

export function MobileNav() {
  return (
    <nav
      className="frosted fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-2xl border border-slate-200 p-1.5 shadow-2xl md:hidden"
      aria-label="Mobile navigation"
    >
      <Link href="/" className="flex flex-col items-center rounded-xl bg-blue-50 py-2 text-[9px] font-bold text-[#0C60FC]">
        <span className="text-base">⌂</span>Home
      </Link>
      <Link href="/study-rooms" className="flex flex-col items-center py-2 text-[9px] font-bold text-slate-500 hover:text-slate-900">
        <span className="text-base">◍</span>Rooms
      </Link>
      <Link href="/library" className="flex flex-col items-center py-2 text-[9px] font-bold text-slate-500 hover:text-slate-900">
        <span className="text-base">▦</span>Library
      </Link>
      <Link href="/timetable" className="flex flex-col items-center py-2 text-[9px] font-bold text-slate-500 hover:text-slate-900">
        <span className="text-base">▤</span>Timetable
      </Link>
    </nav>
  );
}
