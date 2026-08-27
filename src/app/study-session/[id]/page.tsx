"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudySessionIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/study-session/${id}/journey`);
  }, [id, router]);

  return null;
}
