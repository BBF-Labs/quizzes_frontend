import { useQuery } from "@tanstack/react-query";
import { getQuizzes, getQuiz } from "@/controllers"; 
import { useAuth } from "@/context";
import axios from "axios";
import Config from "@/config";

interface UseQuizzesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useQuizzes({ page = 1, limit = 12, search = "" }: UseQuizzesParams = {}) {
  return useQuery({
    queryKey: ["quizzes", page, limit, search],
    queryFn: () => getQuizzes({ page, limit, search }),
  });
}

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
         return getQuiz(quizId);
    },
    enabled: !!quizId,
  });
}

export function useFullQuiz(courseId: string) {
    const { credentials } = useAuth();
    
    return useQuery({
        queryKey: ["fullQuiz", courseId],
        queryFn: async () => {
             const response = await axios.get(`${Config.API_URL}/quizzes/full/${courseId}`, {
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                    "Content-Type": "application/json",
                }
             });
             
             return response.data.fullQuizQuestions || response.data;
        },
        enabled: !!courseId && !!credentials.accessToken,
    });
}
