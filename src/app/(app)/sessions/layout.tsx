import type { ReactNode } from "react";
import { SessionsLayoutWrapper } from "@/components/sessions-layout-wrapper";

export default function SessionsLayout({ children }: { children: ReactNode }) {
  return <SessionsLayoutWrapper>{children}</SessionsLayoutWrapper>;
}
