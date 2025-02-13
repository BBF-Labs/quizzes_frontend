import authReducer, { login, logout, update } from "./auth-reducer";
import quizReducer, {
  setQuestions,
  setCurrentQuestion,
  setAnswers,
  setCurrentTime,
  setUserSelectedQuestions,
  setScore,
} from "./quiz-reducer";
import paymentReducer, { setPaymentDetails } from "./payment-reducer";

export {
  authReducer,
  login,
  logout,
  update,
  quizReducer,
  setQuestions,
  setCurrentQuestion,
  setAnswers,
  setCurrentTime,
  setUserSelectedQuestions,
  setScore,
  paymentReducer,
  setPaymentDetails,
};
