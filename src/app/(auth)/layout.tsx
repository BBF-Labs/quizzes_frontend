import type { ReactNode } from "react";
import { AuthGuard } from "@/components/common";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthGuard unauthenticatedOnly>{children}</AuthGuard>;
}
