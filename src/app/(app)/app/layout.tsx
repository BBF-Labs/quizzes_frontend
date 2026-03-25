import type { ReactNode } from "react";
import { SessionsLayoutWrapper } from "@/components/app/layout";
import { AuthGuard } from "@/components/common";

export default function AppSectionLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <SessionsLayoutWrapper>{children}</SessionsLayoutWrapper>
    </AuthGuard>
  );
}
