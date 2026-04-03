"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ICourse } from "../common/use-courses";

export interface IUserCourseEnrollment {
  _id: string;
  courseId: ICourse;
  semester: string;
  academicYear: string;
  enrolledAt: string;
}

export function useMyCourses(semester?: string, academicYear?: string) {
  return useQuery({
    queryKey: ["user", "courses", semester, academicYear],
    queryFn: async () => {
      const response = await api.get<{ data: IUserCourseEnrollment[] }>(
        "/users/me/courses",
        {
          params: { semester, academicYear },
        },
      );
      // Filter out enrollments with null courseId to prevent UI crashes
      return (response.data.data || []).filter(e => !!e.courseId);
    },
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      courseId: string;
      semester: string;
      academicYear: string;
    }) => {
      const response = await api.post("/users/me/courses", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "courses"] });
      toast.success("Enrolled in course successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to enroll in course");
    },
  });
}

export function useUnenrollFromCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      semester,
      academicYear,
    }: {
      courseId: string;
      semester: string;
      academicYear: string;
    }) => {
      await api.delete(`/users/me/courses/${courseId}`, {
        params: { semester, academicYear },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "courses"] });
      toast.success("Unenrolled from course successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unenroll from course");
    },
  });
}
