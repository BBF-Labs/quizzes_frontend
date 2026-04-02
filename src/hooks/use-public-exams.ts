import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface PublicVenue {
  venue: string;
  indexStart?: string;
  indexEnd?: string;
}

export interface PublicExamEntry {
  _id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  scheduledAt: string;
  venues: PublicVenue[];
  assignedVenue?: string | null;
  durationMinutes: number;
}

export interface PublicTimetable {
  _id: string;
  semester: string;
  academicYear: string;
  isPublished: boolean;
  entries: PublicExamEntry[];
}

export const usePublicTimetables = (
  search: string = "",
  studentId: string = "",
) => {
  return useQuery({
    queryKey: ["public", "timetables", search, studentId],
    queryFn: async () => {
      const query = new URLSearchParams({
        ...(search ? { search } : {}),
        ...(studentId ? { studentId } : {}),
      });
      const res = await api.get<{ data: PublicTimetable[] }>(
        `/learning/timetables/public?${query}`,
      );
      return res.data?.data ?? [];
    },
    // Don't refetch too often for public data
    staleTime: 1000 * 60 * 5,
  });
};
