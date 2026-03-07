"use client";

import { useAuth } from "@/contexts/auth-context";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";

export function AdminUserActions() {
  return (
    <div className="flex items-center gap-4 shrink-0">
      <ThemeToggle />
    </div>
  );
}
