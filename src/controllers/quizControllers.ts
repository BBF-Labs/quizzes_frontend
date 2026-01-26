import axios, { AxiosError } from "axios";
import Config from "@/config";
import {
  FullQuiz,
  IPersonalQuiz,
  IPaginationResponse,
} from "@/interfaces";

const getQuizzes = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{
  quizzes: any[];
  pagination?: IPaginationResponse;
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const quizDoc = await axios.get(
      `${Config.API_URL}/quizzes?${queryParams}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Backend returns { data, pagination } when paginated
    if (quizDoc.data.data) {
      return {
        quizzes: quizDoc.data.data,
        pagination: quizDoc.data.pagination,
      };
    }

    // Fallback for old response format
    if (quizDoc.data.quizzes) {
      return { quizzes: quizDoc.data.quizzes };
    }

    return { quizzes: [] };
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw new Error("Update Failed");
    }
    throw new Error("Couldn't fetch Quiz");
  }
};

const getPublicPersonalQuizzes = async (params?: {
  page?: number;
  limit?: number;
  courseId?: string;
  tags?: string[];
}): Promise<{
  quizzes: IPersonalQuiz[];
  pagination: IPaginationResponse;
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.courseId) queryParams.append("courseId", params.courseId);
    if (params?.tags) {
      params.tags.forEach((tag) => queryParams.append("tags", tag));
    }

    const response = await axios.get(
      `${Config.API_URL}/personal-quizzes/public?${queryParams}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return {
      quizzes: response.data.quizzes || [],
      pagination: response.data.pagination,
    };
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch public quizzes",
      );
    }
    throw new Error("Couldn't fetch public quizzes");
  }
};

const getQuiz = async (quizId: string): Promise<FullQuiz | null> => {
     try {
         // Assuming public endpoint or secure if needed. 
         // But usually frontend fetches full quiz details for taking it.
         // Endpoint might be /quizzes/:id?
         const response = await axios.get(`${Config.API_URL}/quizzes/${quizId}`);
         return response.data;
     } catch (error) {
         console.error("Fetch quiz failed", error);
         return null;
     }
}

export { getQuizzes, getPublicPersonalQuizzes, getQuiz };
