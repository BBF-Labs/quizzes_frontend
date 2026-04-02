"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface IExamTimetable {
  _id: string;
  semester: string;
  academicYear: string;
  entries: IExamEntry[];
  isPublished: boolean;
}

export interface IExamEntry {
  _id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  scheduledAt: string; // ISO Date String
  venue: string;
  durationMinutes: number;
}

export function useMyTimetable(semester: string, academicYear: string) {
  return useQuery({
    queryKey: ["user", "timetable", semester, academicYear],
    queryFn: async () => {
      const response = await api.get<{ data: IExamTimetable[] }>(
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
