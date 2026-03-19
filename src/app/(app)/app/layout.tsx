import type { ReactNode } from "react";
import { SessionsLayoutWrapper } from "@/components/sessions-layout-wrapper";

export default function AppSectionLayout({ children }: { children: ReactNode }) {
  return <SessionsLayoutWrapper>{children}</SessionsLayoutWrapper>;
}
