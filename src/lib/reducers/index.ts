import authReducer, { login, logout, update } from "./auth-reducer";
import quizReducer, {
  setQuiz,
  setCurrentQuizQuestion,
  setAnswers,
  setCurrentTime,
  setUserSelectedLectures,
  setScore,
  setQuizStateSettings,
} from "./quiz-reducer";
import paymentReducer, { setPaymentDetails } from "./payment-reducer";

export {
  authReducer,
  login,
  logout,
  update,
  quizReducer,
  setQuiz,
  setCurrentQuizQuestion,
  setAnswers,
  setCurrentTime,
  setUserSelectedLectures,
  setScore,
  paymentReducer,
  setPaymentDetails,
  setQuizStateSettings,
};
