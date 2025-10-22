import express from "express";
import connectDB from "./config/database.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import foodRoutes from "./routes/food.routes.js";
import orderRoutes from "./routes/order.routes.js";
const app = express();
app.use(express.json());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/food", foodRoutes);
app.use("/api/v1/orders", orderRoutes);
app.listen(3000, () => {
  console.log("Server is running on port: 3000");
});
connectDB();
