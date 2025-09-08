import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", upload.single("profilePicture"), registerUser);

userRouter.post("/login", loginUser);

userRouter.get("/logout", authMiddleware, logoutUser);

export default userRouter;
