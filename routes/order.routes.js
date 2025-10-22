import express from "express";
import isAuthenticated from "../middleware/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  sslSuccess,
} from "../controllers/order.controller.js";

const router = express.Router();
router.route("/create").post(isAuthenticated, createOrder);
router.route("/user-orders/:userId").get(isAuthenticated, getUserOrders);
router.route("/sslcommerz/success").post(sslSuccess);

export default router;
