export interface IPersonalQuiz {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  questions: string[];
  createdBy: string;
  isPublic: boolean;
  isPublished: boolean;
  settings: {
    timeLimit?: number;
    showHints: boolean;
    showExplanations: boolean;
    randomizeQuestions: boolean;
    allowRetakes: boolean;
    passingScore: number;
  };
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  estimatedDuration: number;
  shareToken?: string;
  shareExpiry?: Date;
  completionCount: number;
  averageScore: number;
  lastModified: Date;
}

export interface IPersonalQuizProgress {
  quizId: string;
  userId: string;
  currentQuestion: number;
  answers: string[];
  score: number;
  timeSpent: number;
  isCompleted: boolean;
  lastSaved: Date;
  startedAt: Date;
  completedAt?: Date;
}

export interface IQuizSession {
  quizId: string;
  userId: string;
  sessionId: string;
  progress: IPersonalQuizProgress;
  autoSave: boolean;
  saveInterval: number; // in seconds
}
