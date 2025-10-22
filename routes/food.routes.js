import express from "express";
import isAuthenticated from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";
import {
  addNewFood,
  deleteFood,
  getAllFoods,
  getFood,
  updateFood,
} from "../controllers/food.controller.js";

const router = express.Router();

router.route("/").post(isAuthenticated, upload.single("image"), addNewFood);
router.route("/:id").put(isAuthenticated, upload.single("image"), updateFood);
router.route("/:id").delete(isAuthenticated, deleteFood);
router.route("/").get(getAllFoods);
router.route("/:id").get(getFood);

export default router;
