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

        // Study Plan
        case "ai:generate_study_plan:completed":
          toast.success("Study Plan Ready!", {
            description: "Your personalized study roadmap has been generated.",
          });
          if ((signal.payload as any)?.sessionId) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.app.detail((signal.payload as any).sessionId),
            });
          }
          queryClient.invalidateQueries({
            queryKey: queryKeys.app.details(),
          });
          break;
        case "ai:generate_study_plan:failed":
          toast.error("Study Plan Error", {
            description:
              (signal.payload as any)?.reason ||
              "There was a problem generating your study plan.",
          });
          break;

        // Course Summary
        case "ai:generate_course_summary:completed":
          toast.success("Course Summary Ready!", {
            description: "Editorial course summary and topic deep dives are available.",
          });
          if ((signal.payload as any)?.sessionId) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.app.detail((signal.payload as any).sessionId),
            });
          }
          queryClient.invalidateQueries({
            queryKey: queryKeys.app.details(),
          });
          break;
        case "ai:generate_course_summary:failed":
          toast.error("Course Summary Error", {
            description:
              (signal.payload as any)?.reason ||
              "There was a problem synthesizing your course summary.",
          });
          break;
        case "course_summary_updated":
          if ((signal.payload as any)?.sessionId) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.app.detail((signal.payload as any).sessionId),
            });
          }
          queryClient.invalidateQueries({
            queryKey: queryKeys.app.details(),
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

    const handleStudyPlanUpdated = (payload: { sessionId: string }) => {
      if (payload?.sessionId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.app.detail(payload.sessionId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.app.details(),
      });
    };

    const handleBlockCompleted = (payload: { sessionId: string }) => {
      if (payload?.sessionId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.app.detail(payload.sessionId),
        });
      }
    };

    socket.on("app:signal", handleAppSignal);
    socket.on("app:study_plan_updated", handleStudyPlanUpdated);
    socket.on("app:block_completed", handleBlockCompleted);

    return () => {
      socket.off("app:signal", handleAppSignal);
      socket.off("app:study_plan_updated", handleStudyPlanUpdated);
      socket.off("app:block_completed", handleBlockCompleted);
    };
  }, [socket, isConnected, queryClient]);
}
