export const queryKeys = {
  authSession: ["auth-session"] as const,
  onboardingStatus: ["onboarding-status"] as const,
  sessions: {
    root: ["sessions"] as const,
    lists: () => [...queryKeys.sessions.root, "list"] as const,
    listQueryOptions: (options?: Record<string, any>) =>
      [...queryKeys.sessions.lists(), options] as const,
    details: () => [...queryKeys.sessions.root, "detail"] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const,
    streams: () => [...queryKeys.sessions.root, "stream"] as const,
    stream: (id: string) => [...queryKeys.sessions.streams(), id] as const,
  },
  library: {
    root: ["library"] as const,
    flashcards: {
      root: () => [...queryKeys.library.root, "flashcards"] as const,
      list: () => [...queryKeys.library.flashcards.root(), "list"] as const,
      detail: (id: string) =>
        [...queryKeys.library.flashcards.root(), "detail", id] as const,
    },
    quizzes: {
      root: () => [...queryKeys.library.root, "quizzes"] as const,
      list: () => [...queryKeys.library.quizzes.root(), "list"] as const,
      detail: (id: string) =>
        [...queryKeys.library.quizzes.root(), "detail", id] as const,
    },
    mindmaps: {
      root: () => [...queryKeys.library.root, "mindmaps"] as const,
      list: () => [...queryKeys.library.mindmaps.root(), "list"] as const,
      detail: (id: string) =>
        [...queryKeys.library.mindmaps.root(), "detail", id] as const,
    },
    notes: {
      root: () => [...queryKeys.library.root, "notes"] as const,
      list: () => [...queryKeys.library.notes.root(), "list"] as const,
      detail: (id: string) =>
        [...queryKeys.library.notes.root(), "detail", id] as const,
    },
  },
};
