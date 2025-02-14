import axios, { AxiosError } from "axios";
import Config from "@/config";
import { AppDispatch, setQuiz, update } from "@/lib";
import { FullQuiz, IUser } from "@/interfaces";

const getQuizzes = async () => {
  try {
    const quizDoc = await axios.get(`${Config.API_URL}/quizzes`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (quizDoc.data.quizzes) {
      return quizDoc.data.quizzes;
    }

    return [];
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
        }
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
        return payload;
      }
    } catch (error: any) {
      if (error.message === "Request failed with status code 500") {
        return null;
      } else {
        throw new Error("Something went wrong");
      }
    }
  };

export { getQuizzes, fetchFullQuiz };
