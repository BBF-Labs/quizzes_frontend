"use client";

import React, { createContext, useContext, useReducer } from "react";
import { FullQuiz, IQuizState } from "@/interfaces";
import { QuizSettings } from "@/interfaces/IQuizState"; // Assuming this exists or is part of IQuizState

// Define action types
type QuizAction =
  | { type: "SET_QUIZ"; payload: FullQuiz }
  | { type: "SET_CURRENT_QUESTION"; payload: number }
  | { type: "SET_ANSWERS"; payload: string[] }
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SET_USER_SELECTED_LECTURES"; payload: string[] }
  | { type: "SET_SCORE"; payload: number }
  | { type: "SET_QUIZ_SETTINGS"; payload: QuizSettings }
  | { type: "RESET_QUIZ" };

const initialState: IQuizState = {
  quiz: null,
  currentQuestion: 0,
  quizStateSettings: null,
  answers: [],
  currentTime: 0,
  userSelectedLectures: [],
  score: 0,
};

function quizReducer(state: IQuizState, action: QuizAction): IQuizState {
  switch (action.type) {
    case "SET_QUIZ":
      return { ...state, quiz: action.payload };
    case "SET_CURRENT_QUESTION":
      return { ...state, currentQuestion: action.payload };
    case "SET_ANSWERS":
      return { ...state, answers: action.payload };
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.payload };
    case "SET_USER_SELECTED_LECTURES":
      return { ...state, userSelectedLectures: action.payload };
    case "SET_SCORE":
      return { ...state, score: action.payload };
    case "SET_QUIZ_SETTINGS":
      return { ...state, quizStateSettings: action.payload };
    case "RESET_QUIZ":
      return initialState;
    default:
      return state;
  }
}

interface QuizContextType extends IQuizState {
  dispatch: React.Dispatch<QuizAction>;
  setQuiz: (quiz: FullQuiz) => void;
  setCurrentQuestion: (index: number) => void;
  setAnswers: (answers: string[]) => void;
  setCurrentTime: (time: number) => void;
  setUserSelectedLectures: (lectures: string[]) => void;
  setScore: (score: number) => void;
  setQuizSettings: (settings: QuizSettings) => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const value = {
    ...state,
    dispatch,
    setQuiz: (quiz: FullQuiz) => dispatch({ type: "SET_QUIZ", payload: quiz }),
    setCurrentQuestion: (index: number) =>
      dispatch({ type: "SET_CURRENT_QUESTION", payload: index }),
    setAnswers: (answers: string[]) =>
      dispatch({ type: "SET_ANSWERS", payload: answers }),
    setCurrentTime: (time: number) =>
      dispatch({ type: "SET_CURRENT_TIME", payload: time }),
    setUserSelectedLectures: (lectures: string[]) =>
      dispatch({ type: "SET_USER_SELECTED_LECTURES", payload: lectures }),
    setScore: (score: number) => dispatch({ type: "SET_SCORE", payload: score }),
    setQuizSettings: (settings: QuizSettings) =>
      dispatch({ type: "SET_QUIZ_SETTINGS", payload: settings }),
    resetQuiz: () => dispatch({ type: "RESET_QUIZ" }),
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuizSession() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuizSession must be used within a QuizProvider");
  }
  return context;
}
