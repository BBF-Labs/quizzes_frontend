import axios, { AxiosError } from "axios";
import Config from "@/config";
import { AppDispatch, setQuiz, update } from "@/lib";
import {
  FullQuiz,
  IUser,
  IPersonalQuiz,
  IPaginationResponse,
} from "@/interfaces";
import { sessionSet } from "@/lib/reducers";

const getQuizzes = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  quizzes: any[];
  pagination?: IPaginationResponse;
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

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

const getUserInfo = async (accessToken: string) => {
  try {
    const response = await axios.get(`${Config.API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

interface QuizResponse {
  message: string;
  fullQuizQuestions: FullQuiz;
  user: Partial<IUser | any>;
}
const fetchFullQuiz =
  (courseId: string, accessToken: string) => async (dispatch: AppDispatch) => {
    try {
      const quizData = await axios.get<QuizResponse>(
        `${Config.API_URL}/quizzes/full/${courseId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!quizData.data.fullQuizQuestions) {
        const user = await getUserInfo(accessToken);

        const payload = {
          isAuthenticated: true,
          credentials: {
            accessToken: accessToken,
            refreshToken: "",
          },
          user: {
            email: user.email,
            name: user.name,
            password: "",
            credits: user.quizCredits,
            username: user.username,
            role: user.role,
          },
        };

        dispatch(update(payload));
      }

      if (quizData.data.fullQuizQuestions) {
        const payload = quizData.data.fullQuizQuestions;
        dispatch(setQuiz(payload));
        const user = await getUserInfo(accessToken);

        const userPayload = {
          isAuthenticated: true,
          credentials: {
            accessToken: accessToken,
            refreshToken: "",
          },
          user: {
            email: user.email,
            name: user.name,
            password: "",
            credits: user.quizCredits,
            username: user.username,
            role: user.role,
          },
        };

        dispatch(update(userPayload));
        return payload;
      }
    } catch (error: any) {
      if (error instanceof AxiosError) {
        if (
          error.response?.data.message ===
          "Error validating token: Multiple sessions detected. Please login again."
        ) {
          dispatch(sessionSet());
          return;
        }
        throw new Error(error.response?.data.message);
      }
      throw new Error("Something went wrong");
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

export { getQuizzes, fetchFullQuiz, getPublicPersonalQuizzes };
