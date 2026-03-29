import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGlobalSocket } from "@/contexts/socket-context";
import { queryKeys } from "@/lib/query-keys";

export function useGlobalAppEvents() {
  const { socket, isConnected } = useGlobalSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleAppSignal = (signal: { type: string; payload?: unknown }) => {
      switch (signal.type) {
        // Flashcards
        case "ai:generate_flashcards:completed":
          toast.success("Ready to Study!", {
            description: "Your flashcards have been successfully generated.",
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.flashcards.root(),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.materials.root(),
          });
          break;
        case "ai:generate_flashcards:failed":
          toast.error("Generation Failed", {
            description: "There was a problem generating your flashcards. Please try again.",
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.materials.root(),
          });
          break;

        // Quizzes
        case "ai:generate_personal_quiz:completed":
          toast.success("Ready for Testing!", {
            description: "Your personal quiz has been successfully generated.",
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.quizzes.root(),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.materials.root(),
          });
          break;
        case "ai:generate_personal_quiz:failed":
          toast.error("Generation Failed", {
            description: "There was a problem generating your quiz. Please try again.",
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.materials.root(),
          });
          break;

        // Mind Maps
        case "ai:generate_mindmap:completed":
          toast.success("Mind Map Created!", {
            description: "Your mind map has been successfully generated.",
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.mindmaps.root(),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.materials.root(),
          });
          break;
        case "ai:generate_mindmap:failed":
          toast.error("Generation Failed", {
            description: "There was a problem generating your mind map. Please try again.",
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.materials.root(),
          });
          break;

        // Material Processing
        case "material:process_text:completed":
        case "material:process_image:completed":
        case "material:extract_embedded_images:completed":
        case "material:process:dispatched":
          // Silently update material lists without spamming toasts
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.materials.root(),
          });
          break;
        case "material:process:failed":
        case "material:process_text:failed":
        case "material:process_image:failed":
        case "material:extract_embedded_images:failed":
          toast.error("Processing Error", {
            description: "There was a problem parsing your uploaded material.",
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.library.materials.root(),
          });
          break;

        default:
          // Ignoring unhandled socket signals
          break;
      }
    };

    socket.on("app:signal", handleAppSignal);

    return () => {
      socket.off("app:signal", handleAppSignal);
    };
  }, [socket, isConnected, queryClient]);
}
