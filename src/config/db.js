import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

// connect to MongoDB using mongoose
const connectDB = async () => {
  const MONGO_URI = process.env.CONNECTION_STRING;

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    throw new ApiError(500, "MongoDB connection error", error);
  }
};

export default connectDB;
