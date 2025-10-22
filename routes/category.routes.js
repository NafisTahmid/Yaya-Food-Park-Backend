import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import isAuthenticated from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/all").get(getAllCategories);
router.route("/:id").get(getCategory);
router.route("/create").post(isAuthenticated, createCategory);
router.route("/:id").put(isAuthenticated, updateCategory);
router.route("/:id").delete(isAuthenticated, deleteCategory);

export default router;
