"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export function AdminUserActions() {
  return (
    <div className="flex items-center gap-4 shrink-0">
      <ThemeToggle />
    </div>
  );
}
