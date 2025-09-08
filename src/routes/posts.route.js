import express from "express";
import {
  createPost,
  deleteAllPosts,
  deletePostById,
  getAllPosts,
  getPostById,
  getPostStats,
  updatePostbyId,
  getAllAdminPosts,
} from "../controllers/post.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

// Create a new router instance for handling posts-related routes
const postsRouter = express.Router();

// define the route for getting post statistics (must come before /posts)
postsRouter.get("/posts/stats", getPostStats);

// define the route for all Admin posts
postsRouter.get("/admin/posts", authMiddleware, getAllAdminPosts);

// define the route for all posts
postsRouter.get("/posts", getAllPosts);

// define the route for getting a post by ID
postsRouter.get("/post/:id", authMiddleware, getPostById);

// define the route for creating a new post
postsRouter.post("/post", authMiddleware, upload.single("file"), createPost);

// define the route for updating a post by ID
postsRouter.put("/post/:id", authMiddleware, upload.single("file"), updatePostbyId);

// define the route for deleting a post by ID
postsRouter.delete("/post/:id", authMiddleware, deletePostById);

// define the route for deleting all posts
postsRouter.delete("/posts", deleteAllPosts);

// export the router to be used in the main application
export default postsRouter;
