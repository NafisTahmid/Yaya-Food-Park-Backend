import express from "express";
import {
  deleteUserController,
  editProfile,
  getAllUsers,
  getUserProfile,
  loginController,
  logoutController,
  registerController,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.route("/logout").get(logoutController);
router.route("/all").get(isAuthenticated, getAllUsers);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/edit").put(isAuthenticated, editProfile);
router.route("/profile/delete").delete(isAuthenticated, deleteUserController);
export default router;
