import { loginUser, logoutUser, refreshToken } from "./authControllers";
import { createUser, updateUser } from "./userController";
import { getAllCourses } from "./coursesController";
import {
  createPayment,
  getAllPayments,
  verifyPayment,
} from "./paymentControllers";
import { getQuizzes } from "./quizControllers";
import {
  getAdminCourses,
  getAdminCourse,
  updateAdminCourse,
} from "./adminCourseControllers";

export {
  loginUser,
  logoutUser,
  refreshToken,
  createUser,
  updateUser,
  getAllCourses,
  createPayment,
  getQuizzes,
  getAllPayments,
  verifyPayment,
  getAdminCourses,
  getAdminCourse,
  updateAdminCourse,
};
