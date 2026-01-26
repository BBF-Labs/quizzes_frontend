import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { flashcardService } from "../lib/services/flashcardService";
import { useAuth } from "@/context";
import axios from "axios";
import Config from "@/config";

export function useFlashcards() {
  const { credentials } = useAuth();

  return useQuery({
    queryKey: ["flashcards", "grouped"],
    queryFn: async () => {
      const response = await axios.get(`${Config.API_URL}/flashcards/grouped`, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });
      return response.data.courseGroups;
    },
    enabled: !!credentials.accessToken,
  });
}

export function useFlashcardStats() {
  const { credentials } = useAuth();

  return useQuery({
    queryKey: ["flashcardStats"],
    queryFn: () => flashcardService.getFlashcardStats(credentials.accessToken),
    enabled: !!credentials.accessToken,
  });
}

export function useUserMaterials() {
  const { credentials } = useAuth();

  return useQuery({
    queryKey: ["userMaterials"],
    queryFn: async () => {
      const response = await axios.get(`${Config.API_URL}/materials/user`, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });
      return response.data.materials;
    },
    enabled: !!credentials.accessToken,
  });
}

export function useGenerateFlashcards() {
  const queryClient = useQueryClient();
  const { credentials } = useAuth();

  return useMutation({
    mutationFn: ({ materialId, count }: { materialId: string; count: number }) =>
      flashcardService.generateFlashcards(materialId, count, credentials.accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["flashcardStats"] });
    },
  });
}
