import axios, { AxiosError } from "axios";
import Config from "@/config";
import { IPaginationResponse } from "@/interfaces";

interface Course {
  code: string;
  _id: string;
  title: string;
  about: string;
  numberOfLectures?: number;
  approvedQuestionsCount: number;
  semester: number;
  creditHours?: number;
  isDeleted?: boolean;
}

const getAllCourses = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{
  courses: Course[];
  pagination?: IPaginationResponse;
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await axios.get(
      `${Config.API_URL}/courses?${queryParams}`
    );

    if (response.status === 429) {
      throw new Error("Too many requests");
    }

    // Backend returns { data, pagination } when paginated
    if (response.data.data) {
      return {
        courses: response.data.data,
        pagination: response.data.pagination,
      };
    }

    // Fallback for old response format
    return { courses: response.data.courses || [] };
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw new Error("Fetch failed, refresh");
    }
    throw new Error("Could load courses");
  }
};

const getCourse = async (courseId: string): Promise<Course | null> => {
    try {
        const response = await axios.get(`${Config.API_URL}/courses/${courseId}`);
        return response.data.course || response.data;
    } catch (error: any) {
        if (error instanceof AxiosError) {
             console.error("Fetch course failed", error.message);
        }
        return null;
    }
}

export { getAllCourses, getCourse };
export type { Course };
