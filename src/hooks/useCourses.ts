import { useQuery } from "@tanstack/react-query";
import { getAllCourses, getCourse } from "@/controllers";

interface UseCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useCourses({ page = 1, limit = 12, search = "" }: UseCoursesParams = {}) {
  return useQuery({
    queryKey: ["courses", page, limit, search],
    queryFn: () => getAllCourses({ page, limit, search }),
    // keepPreviousData: true // in V5 this is placeholderData: keepPreviousData
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId),
    enabled: !!courseId,
  });
}
