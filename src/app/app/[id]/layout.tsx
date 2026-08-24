"use client";

import type { ReactNode } from "react";
import { use } from "react";
import { AppSessionLayout } from "@/components/app/layout";

export { useAppLayout } from "@/components/app/layout";

interface AppLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default function AppLayout({ children, params }: AppLayoutProps) {
  const { id: sessionId } = use(params);

  return (
    <AppSessionLayout sessionId={sessionId}>
      {children}
    </AppSessionLayout>
  );
}
