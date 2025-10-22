import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({});
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected :D");
  } catch (error) {
    console.log("Error connecting database: ", error);
  }
};

export default connectDB;
