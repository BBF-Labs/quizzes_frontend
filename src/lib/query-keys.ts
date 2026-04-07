export const queryKeys = {
  authSession: ["auth-session"] as const,
  onboardingStatus: ["onboarding-status"] as const,
  app: {
    root: ["app"] as const,
    lists: () => [...queryKeys.app.root, "list"] as const,
    listQueryOptions: (options?: Record<string, unknown>) =>
      [...queryKeys.app.lists(), options] as const,
    details: () => [...queryKeys.app.root, "detail"] as const,
    detail: (id: string) => [...queryKeys.app.details(), id] as const,
    streams: () => [...queryKeys.app.root, "stream"] as const,
    stream: (id: string) => [...queryKeys.app.streams(), id] as const,
    materials: (id: string) => [...queryKeys.app.detail(id), "materials"] as const,
  },
  sessions: {
    root: ["app"] as const,
    lists: () => queryKeys.app.lists(),
    details: () => queryKeys.app.details(),
    detail: (id: string) => queryKeys.app.detail(id),
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
    materials: {
      root: () => [...queryKeys.library.root, "materials"] as const,
      list: () => [...queryKeys.library.materials.root(), "list"] as const,
      detail: (id: string) =>
        [...queryKeys.library.materials.root(), "detail", id] as const,
    },
  },
  publicLibrary: {
    root: ["public-library"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.publicLibrary.root, "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.publicLibrary.root, "detail", id] as const,
  },
  systemQuizzes: {
    root: ["system-quizzes"] as const,
    list: () => [...queryKeys.systemQuizzes.root, "list"] as const,
    detail: (id: string) =>
      [...queryKeys.systemQuizzes.root, "detail", id] as const,
  },
  enrollments: {
    root: ["enrollments"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.enrollments.root, "list", params] as const,
  },
  timetable: {
    root: ["timetable"] as const,
    mine: (semester: string, academicYear: string) =>
      [...queryKeys.timetable.root, "mine", semester, academicYear] as const,
  },
  billing: {
    root: ["billing"] as const,
    packages: () => [...queryKeys.billing.root, "packages"] as const,
    creditBundles: () => [...queryKeys.billing.root, "credit-bundles"] as const,
    status: () => [...queryKeys.billing.root, "status"] as const,
    streak: () => [...queryKeys.billing.root, "streak"] as const,
    studentVerify: () => [...queryKeys.billing.root, "student-verify"] as const,
  },
  donations: {
    root: ["donations"] as const,
    ledger: () => [...queryKeys.donations.root, "ledger"] as const,
  },
  analytics: {
    root: ["analytics"] as const,
    summary: () => [...queryKeys.analytics.root, "summary"] as const,
  },
};
