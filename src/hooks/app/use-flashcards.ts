import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FlashcardSetDetail, LibraryFlashcard } from "@/types/session";

export function useFlashcardSetDetail(id: string | undefined) {
  return useQuery<FlashcardSetDetail | null>({
    queryKey: ["flashcard-set-detail", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get<{ data: FlashcardSetDetail }>(
        `/app/flashcards/${id}`,
      );
      return res.data?.data ?? null;
    },
  });
}

export function useAddFlashcard(setId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ front, back }: { front: string; back: string }) => {
      if (!setId) throw new Error("No setId");
      const res = await api.post<{ data: LibraryFlashcard }>(
        `/app/flashcards/${setId}/cards`,
        { front: front.trim(), back: back.trim() },
      );
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["flashcard-set-detail", setId],
      });
    },
  });
}

export function useEditFlashcard(setId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cardId,
      front,
      back,
    }: {
      cardId: string;
      front: string;
      back: string;
    }) => {
      if (!setId) throw new Error("No setId");
      await api.patch(`/app/flashcards/${setId}/cards/${cardId}`, {
        front: front.trim(),
        back: back.trim(),
      });
      return { cardId, front, back };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["flashcard-set-detail", setId],
      });
    },
  });
}

export function useDeleteFlashcard(setId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cardId: string) => {
      if (!setId) throw new Error("No setId");
      await api.delete(`/app/flashcards/${setId}/cards/${cardId}`);
      return cardId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["flashcard-set-detail", setId],
      });
    },
  });
}
