import express from "express";
import { makeComment, getComments } from "../controllers/comment.controller.js";

// Create a new router for comments
const commentRouter = express.Router();

// Define routes for comments
// @POST /comments/:postId - Create a new comment for a post
// @GET /comments/:postId - Get all comments for a post
commentRouter.route("/:postId").post(makeComment).get(getComments);

export default commentRouter;
