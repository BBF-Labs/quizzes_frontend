"use client";

import type { ReactNode } from "react";
import { use } from "react";
import { SessionJourneyLayout } from "@/components/app/session/SessionJourneyLayout";

interface HubLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default function HubLayout({ children, params }: HubLayoutProps) {
  const { id: sessionId } = use(params);

  return (
    <SessionJourneyLayout sessionId={sessionId}>
      {children}
    </SessionJourneyLayout>
  );
}
