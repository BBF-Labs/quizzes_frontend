"use client";

import { use } from "react";
import { CourseSummaryView } from "@/components/app/session/CourseSummaryView";
import { useAuth } from "@/contexts/auth-context";
import { useApp } from "@/hooks/app/use-app-queries";

export default function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const { user } = useAuth();
  const { data: app } = useApp(sessionId);

  return (
    <CourseSummaryView
      sessionId={sessionId}
      userName={user?.name || "Student"}
      courseTitle={app?.name || app?.title}
    />
  );
}
