import { FullQuiz, IQuizState } from "@/interfaces";
import { QuizSettings } from "@/interfaces/IQuizState";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: IQuizState = {
  quiz: null,
  currentQuestion: 0,
  quizStateSettings: null,
  answers: [],
  currentTime: 0,
  userSelectedLectures: [],
  score: 0,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setQuiz(state, action: PayloadAction<FullQuiz>) {
      state.quiz = action.payload;
    },
    setCurrentQuizQuestion(state, action: PayloadAction<number>) {
      state.currentQuestion = action.payload;
    },
    setAnswers(state, action: PayloadAction<string[]>) {
      state.answers = action.payload;
    },
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
    setUserSelectedLectures(state, action: PayloadAction<string[]>) {
      state.userSelectedLectures = action.payload;
    },
    setScore(state, action: PayloadAction<number>) {
      state.score = action.payload;
    },
    setQuizStateSettings(state, action: PayloadAction<QuizSettings>) {
      state.quizStateSettings = action.payload;
    },
  },
});

export const {
  setQuiz,
  setCurrentQuizQuestion,
  setAnswers,
  setCurrentTime,
  setUserSelectedLectures,
  setScore,
  setQuizStateSettings,
} = quizSlice.actions;

export default quizSlice.reducer;
