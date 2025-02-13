import { loginUser, logoutUser, refreshToken } from "./authControllers";
import { createUser, updateUser } from "./userController";
import { getAllCourses } from "./coursesController";
import { createPayment } from "./paymentControllers";
import { getQuizzes } from "./quizControllers";

export {
  loginUser,
  logoutUser,
  refreshToken,
  createUser,
  updateUser,
  getAllCourses,
  createPayment,
  getQuizzes,
};
