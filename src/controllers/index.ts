import { loginUser, logoutUser, refreshToken } from "./authControllers";
import { createUser, updateUser } from "./userController";
import { getAllCourses } from "./coursesController";
import { createPayment } from "./paymentControllers";

export {
  loginUser,
  logoutUser,
  refreshToken,
  createUser,
  updateUser,
  getAllCourses,
  createPayment,
};
