"use client";

import type { ReactNode } from "react";
import { use } from "react";
import { AppSessionLayout } from "@/components/app/layout";

interface StudySessionLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default function StudySessionLayout({
  children,
  params,
}: StudySessionLayoutProps) {
  const { id: sessionId } = use(params);

  return <AppSessionLayout sessionId={sessionId}>{children}</AppSessionLayout>;
}
