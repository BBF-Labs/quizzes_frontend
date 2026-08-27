"use client";

import { use } from "react";
import { SourcesContextView } from "@/components/app/session/SourcesContextView";

export default function ContextPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);

  return <SourcesContextView sessionId={sessionId} />;
}
