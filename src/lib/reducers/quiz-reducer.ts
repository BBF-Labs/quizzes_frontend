import { IQuizState } from "@/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: IQuizState = {
  questions: [],
  currentQuestion: 0,
  answers: [],
  currentTime: 0,
  userSelectedQuestions: [],
  score: 0,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setQuestions(state, action: PayloadAction<IQuizState>) {
      state.questions = action.payload.questions;
    },
    setCurrentQuestion(state, action: PayloadAction<number>) {
      state.currentQuestion = action.payload;
    },
    setAnswers(state, action: PayloadAction<string[]>) {
      state.answers = action.payload;
    },
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
    setUserSelectedQuestions(state, action: PayloadAction<IQuizState>) {
      state.userSelectedQuestions = action.payload.userSelectedQuestions;
    },
    setScore(state, action: PayloadAction<number>) {
      state.score = action.payload;
    },
  },
});

export const {
  setQuestions,
  setCurrentQuestion,
  setAnswers,
  setCurrentTime,
  setUserSelectedQuestions,
  setScore,
} = quizSlice.actions;

export default quizSlice.reducer;
