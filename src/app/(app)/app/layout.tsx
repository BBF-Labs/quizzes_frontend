import type { ReactNode } from "react";
import { SessionsLayoutWrapper } from "@/components/app/layout";

export default function AppSectionLayout({ children }: { children: ReactNode }) {
  return <SessionsLayoutWrapper>{children}</SessionsLayoutWrapper>;
}
