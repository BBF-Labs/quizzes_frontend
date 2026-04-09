"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface IExamSessionEntry {
  _id: string;
  sessionId?: string;
  label?: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  examType: "midterm" | "final" | "resit" | "supplementary" | "viva" | "practical";
  scheduledAt: string; // ISO Date String
  venue: string;
  assignedVenue?: string | null;
  timingStatus?: "ongoing" | "today" | "upcoming";
  durationMinutes: number;
  semester: string;
  academicYear: string;
}

export function useMyTimetable(semester: string, academicYear: string) {
  return useQuery({
    queryKey: ["user", "timetable", semester, academicYear],
    queryFn: async () => {
      const response = await api.get<{ data: IExamSessionEntry[] }>(
        "/learning/timetable/me",
        {
          params: { semester, academicYear },
        },
      );
      return response.data.data;
    },
    enabled: !!semester && !!academicYear,
  });
}
