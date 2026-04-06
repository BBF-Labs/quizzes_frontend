"use client";

import { ThemeToggle } from "@/components/common";
import { UserProfileDropdown } from "@/components/common/user-profile-dropdown";
import { useAuth } from "@/contexts/auth-context";

export function AdminUserActions() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center gap-3 shrink-0">
      <ThemeToggle />
      <UserProfileDropdown user={user} onLogout={logout} />
    </div>
  );
}
