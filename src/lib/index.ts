import { cn } from "./utils";
import store, { RootState, AppDispatch } from "./store/state-store";
import { login, logout, update, setPaymentDetails } from "./reducers";
import {
  setQuiz,
  setCurrentQuizQuestion,
  setAnswers,
  setCurrentTime,
  setUserSelectedLectures,
  setScore,
  setQuizStateSettings,
} from "./reducers";

export {
  cn,
  type RootState,
  store,
  type AppDispatch,
  login,
  logout,
  update,
  setPaymentDetails,
  setQuiz,
  setCurrentQuizQuestion,
  setAnswers,
  setCurrentTime,
  setUserSelectedLectures,
  setScore,
  setQuizStateSettings,
};
