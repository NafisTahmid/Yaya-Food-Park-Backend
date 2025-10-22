import express from "express";
import isAuthenticated from "../middleware/authMiddleware.js";
import { createOrder } from "../controllers/order.controller.js";

const router = express.Router();
router.route("/create").post(isAuthenticated, createOrder);

export default router;
