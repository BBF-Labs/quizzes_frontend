"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ITimetableOverviewPayload } from "@/types/timetable";

export function useTimetableOverview(params?: {
  semester?: string;
  academicYear?: string;
  date?: string;
}) {
  return useQuery({
    queryKey: queryKeys.timetable.overview(params),
    queryFn: async () => {
      const response = await api.get<{ data: ITimetableOverviewPayload }>(
        "/app/timetable",
        {
          params,
        },
      );
      return response.data.data;
    },
  });
}
