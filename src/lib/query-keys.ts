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
};
