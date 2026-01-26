import { loginUser, logoutUser, refreshToken } from "./authControllers";
import {  getQuiz,  getPublicPersonalQuizzes, getQuizzes} from "./quizControllers";
import { getAllCourses, getCourse } from "./coursesController";
import { getAllPayments, verifyPayment, createPayment} from "./paymentControllers";
import { createUser, updateUser } from "./userController";
export * from "./packageControllers";

export {
  loginUser,
  logoutUser,
  refreshToken,
  createUser,
  updateUser,
  getAllCourses,
  createPayment,
  getQuizzes,
  getPublicPersonalQuizzes,
  getAllPayments,
  verifyPayment,
  getCourse,
  getQuiz,
};
