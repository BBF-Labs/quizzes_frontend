"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { StudyPlanView } from "@/components/app/session/StudyPlanView";
import { UpdateStudyPlanView } from "@/components/app/session/UpdateStudyPlanView";
import { useAuth } from "@/contexts/auth-context";
import { useApp } from "@/hooks/app/use-app-queries";

export default function JourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data: app } = useApp(sessionId);

  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  if (isUpdatingPlan) {
    return (
      <UpdateStudyPlanView
        sessionId={sessionId}
        userName={user?.name || "Student"}
        courseTitle={app?.name || app?.title}
        onStartNow={() => router.push(`/study-session/${sessionId}/session`)}
        onSendMessage={() => router.push(`/study-session/${sessionId}/session`)}
      />
    );
  }

  return (
    <StudyPlanView
      sessionId={sessionId}
      userName={user?.name || "Student"}
      courseTitle={app?.name || app?.title}
      onSelectTopic={() => router.push(`/study-session/${sessionId}/session`)}
      onContinueSession={() => router.push(`/study-session/${sessionId}/session`)}
      onSwitchToChat={() => router.push(`/study-session/${sessionId}/session`)}
      onOpenEditPlan={() => setIsUpdatingPlan(true)}
    />
  );
}
