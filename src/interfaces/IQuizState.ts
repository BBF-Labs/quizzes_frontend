import { IQuizQuestion } from "@/types/quiz";

interface IQuizState {
  questions: IQuizQuestion[];
  currentQuestion: number;
  answers: string[];
  currentTime: number;
  userSelectedQuestions: IQuizQuestion[];
  score: number;
}

export type { IQuizState };
