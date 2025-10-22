import express from "express";
import isAuthenticated from "../middleware/authMiddleware.js";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  updateReview,
} from "../controllers/review.controller.js";

const router = express.Router();

router.route("/").get(getAllReviews);
router.route("/:id").get(getReview);
router.route("/").post(isAuthenticated, createReview);
router.route("/:id").put(isAuthenticated, updateReview);
router.route("/:id").delete(isAuthenticated, deleteReview);

export default router;
