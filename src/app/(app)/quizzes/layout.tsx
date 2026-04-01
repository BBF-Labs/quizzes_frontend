import type { ReactNode } from "react";
import { AppLayoutWrapper } from "@/components/app/layout";
import { AuthGuard } from "@/components/common";

export default function QuizzesLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppLayoutWrapper>{children}</AppLayoutWrapper>
    </AuthGuard>
  );
}
