import axios from "axios";
import Config from "@/config";
import { AppDispatch, setQuiz } from "@/lib";
import { FullQuiz } from "@/interfaces";

const getQuizzes = async () => {
  try {
    const quizDoc = await axios.get(`${Config.API_URL}/quizzes`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (quizDoc.data) {
      return quizDoc.data.quizzes;
    }

    return [];
  } catch (error: any) {
    throw new Error(error.message);
  }
};

interface QuizResponse {
  message: string;
  fullQuizQuestions: FullQuiz;
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
