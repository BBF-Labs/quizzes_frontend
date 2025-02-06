import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface QuizState {
  currentQuestion: number
  userAnswers: string[]
  selectedQuestions: number[]
  quizType: "all" | "custom"
}

const initialState: QuizState = {
  currentQuestion: 0,
  userAnswers: [],
  selectedQuestions: [],
  quizType: "all",
}

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      state.currentQuestion = action.payload
    },
    setUserAnswers: (state, action: PayloadAction<string[]>) => {
      state.userAnswers = action.payload
    },
    setSelectedQuestions: (state, action: PayloadAction<number[]>) => {
      state.selectedQuestions = action.payload
    },
    setQuizType: (state, action: PayloadAction<"all" | "custom">) => {
      state.quizType = action.payload
    },
  },
})

export const { setCurrentQuestion, setUserAnswers, setSelectedQuestions, setQuizType } = quizSlice.actions
export default quizSlice.reducer

