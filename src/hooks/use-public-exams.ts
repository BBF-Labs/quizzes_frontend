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

export interface PublicTimetableEntry extends PublicExamEntry {
  timetableId: string;
  semester: string;
  academicYear: string;
}

export interface PublicPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const usePublicTimetables = (
  search: string = "",
  studentId: string = "",
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery({
    queryKey: ["public", "timetables", search, studentId, page, limit],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
        ...(studentId ? { studentId } : {}),
      });
      const res = await api.get<{
        data: PublicTimetableEntry[];
        meta?: PublicPaginationMeta;
      }>(`/learning/timetables/public?${query}`);
      return {
        entries: res.data?.data ?? [],
        pagination: res.data?.meta ?? {
          total: 0,
          page,
          limit,
          totalPages: 1,
        },
      };
    },
    // Don't refetch too often for public data
    staleTime: 1000 * 60 * 5,
  });
};
