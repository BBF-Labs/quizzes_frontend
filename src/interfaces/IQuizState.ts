interface QuizQuestion {
  question: "string";
  options?: "string";
  answer: "string";
  type: "string";
  explanation?: string;
  lectureNumber: string;
  hint?: string;
}
interface QuizQuestions {
  name: string;
  questions: QuizQuestion[];
}

interface FullQuiz {
  courseCode: string;
  quizQuestions: QuizQuestions[] | null;
}

interface QuizSettings {
  lectures: string[];
  showHints: boolean;
  feedbackType: "during" | "after";
  timer: number;
  timerEnabled: boolean;
  autoNext: boolean;
  isLinear: boolean;
  randomizeQuestions: boolean; // Added randomization option
}
interface IQuizState {
  quiz: FullQuiz | null;
  currentQuestion: number;
  quizStateSettings: QuizSettings | null;
  answers: string[];
  currentTime: number;
  userSelectedLectures: string[];
  score: number;
}

export type { IQuizState, FullQuiz, QuizSettings };
