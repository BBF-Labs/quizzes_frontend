"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ICourse {
  _id: string;
  code: string;
  title: string;
  about: string;
  semester: number;
  year: number;
  campusId: string;
}

interface CoursesResponse {
  data: ICourse[];
  message: string;
}

export function useCourseSearch(searchTerm: string) {
  return useQuery({
    queryKey: ["courses", "search", searchTerm],
    queryFn: async () => {
      const response = await api.get<CoursesResponse>("/institutions/courses", {
        params: {
          search: searchTerm,
          searchFields: ["title", "code"],
          limit: 10,
        },
      });
      return response.data.data;
    },
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAllCourses() {
  return useQuery({
    queryKey: ["courses", "all"],
    queryFn: async () => {
      const response = await api.get<CoursesResponse>("/institutions/courses", {
        params: {
          limit: 50,
        },
      });
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
