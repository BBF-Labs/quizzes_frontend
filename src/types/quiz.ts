export interface IQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type: "mcq" | "fill-in" | "true-false";
  explanation: string;
  hint?: string;
}

export interface FilteredQuestions {
  name: string;
  questions: string[];
}

export interface IQuizQuestion {
  _id: string;
  name: string;
  courseId: string;
  isApproved: boolean;
  quizQuestions: FilteredQuestions[];
  creditHours: number;
}

export interface QuizSettings {
  lectureNumber: string;
  showHints: boolean;
  feedbackType: "during" | "after";
  timer: number; // in seconds
  timerEnabled: boolean;
  isLinear: boolean;
  autoNext: boolean;
}
