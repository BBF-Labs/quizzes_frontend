import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context";
import axios from "axios";
import Config from "@/config";

export function usePersonalQuizzes() {
  const { credentials } = useAuth();

  return useQuery({
    queryKey: ["personalQuizzes"],
    queryFn: async () => {
      const response = await axios.get(
        `${Config.API_URL}/personal-quizzes/user`,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );
      return response.data.quizzes;
    },
    enabled: !!credentials.accessToken,
  });
}

export function useCreatePersonalQuiz() {
  const queryClient = useQueryClient();
  const { credentials } = useAuth();

  return useMutation({
    mutationFn: ({ materialId, count }: { materialId: string; count: number }) =>
      axios.post(
        `${Config.API_URL}/personal-quizzes`,
        { materialId, count },
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personalQuizzes"] });
    },
  });
}

export function useDeletePersonalQuiz() {
  const queryClient = useQueryClient();
  const { credentials } = useAuth();

  return useMutation({
    mutationFn: (quizId: string) =>
      axios.delete(`${Config.API_URL}/personal-quizzes/${quizId}`, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personalQuizzes"] });
    },
  });
}
